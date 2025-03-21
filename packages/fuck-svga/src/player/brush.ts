import benchmark from "../benchmark";
import {
  getCanvas,
  getOffscreenCanvas,
  noop,
  platform,
  br,
} from "../polyfill";
import { Env, SE } from "../env";
import render from "./render";
import { ImageManager } from "./image-manager";

interface IBrushModel {
  // canvas or offscreen
  type: "C" | "O";
  // clear or resize or create
  clear: "CL" | "RE" | "CR";
  // put or draw
  render: "PU" | "DR";
}

type TBrushMode = "poster" | "animation";

export class Brush {
  /**
   * 主屏的 Canvas 元素
   * Main Screen
   */
  private X: PlatformCanvas | null = null;
  /**
   * 主屏的 Context 对象
   * Main Context
   */
  private XC: CanvasRenderingContext2D | null = null;
  /**
   * 副屏的 Canvas 元素
   * Secondary Screen
   */
  private Y: PlatformCanvas | PlatformOffscreenCanvas | null = null;
  /**
   * 副屏的 Context 对象
   * Secondary Context
   */
  private YC:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  /**
   * canvas宽度
   */
  private W: number = 0;
  /**
   * canvas高度
   */
  private H: number = 0;
  /**
   * 粉刷模式
   */
  private model: IBrushModel = {} as IBrushModel;

  private IM = new ImageManager();

  public globalTransform?: GlobalTransform;

  constructor(private readonly mode: TBrushMode = "animation") {}

  private setModel(type: "C" | "O"): void {
    const { model } = this;

    // set type
    model.type = type;

    // set clear
    if (
      type === "O" &&
      // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
      Env.is(SE.H5) &&
      navigator.userAgent.includes("Firefox")
    ) {
      model.clear = "CR";
    } else if ((type === "O" && Env.is(SE.DOUYIN)) || Env.is(SE.ALIPAY)) {
      model.clear = "CL";
    } else {
      model.clear = "RE";
    }

    // set render
    if (
      (type === "C" &&
        (Env.is(SE.DOUYIN) || (platform === "IOS" && Env.is(SE.ALIPAY)))) ||
      (type === "O" && Env.is(SE.WECHAT))
    ) {
      model.render = "PU";
    } else {
      model.render = "DR";
    }

    benchmark.line(4);
    benchmark.log("brush type", model.type);
    benchmark.log("brush clear", model.clear);
    benchmark.log("brush render", model.render);
    benchmark.line(4);
  }

  /**
   * 注册画笔，根据环境判断生成最优的绘制方式
   * @param selector
   * @param ofsSelector
   * @param component
   */
  public async register(
    selector: string,
    ofsSelector?: string,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ) {
    const { model, mode } = this;
    // #region set main screen implement
    // -------- 创建主屏 ---------
    const { canvas, ctx } = await getCanvas(selector, component);
    const { width, height } = canvas;
    // 添加主屏
    this.X = canvas;
    this.XC = ctx;
    this.W = width;
    this.H = height;
    // #endregion set main screen implement

    // #region set secondary screen implement
    // ------- 创建副屏 ---------
    if (mode === "poster") {
      this.Y = this.X;
      this.YC = this.XC;
      this.setModel("C");
    } else {
      let ofsResult;

      if (typeof ofsSelector === "string" && ofsSelector !== "") {
        ofsResult = await getCanvas(ofsSelector, component);
        ofsResult.canvas.width = width;
        ofsResult.canvas.height = height;
        this.setModel("C");
      } else {
        ofsResult = getOffscreenCanvas({ width, height });
        this.setModel("O");
      }

      this.Y = ofsResult.canvas;
      this.YC = ofsResult.ctx;
    }
    // #endregion set secondary screen implement

    // #region clear main screen implement
    // ------- 生成主屏清理函数 -------
    // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布
    if (model.clear === "CL") {
      this.clearContainer = () => {
        const { W, H } = this;
        this.XC!.clearRect(0, 0, W, H);
      };
    } else {
      this.clearContainer = () => {
        const { W, H } = this;
        this.X!.width = W;
        this.X!.height = H;
      };
    }
    // #endregion clear main screen implement

    if (mode === "poster") {
      this.clearSecondary = this.stick = noop;
    } else {
      // #region clear secondary screen implement
      // ------- 生成副屏清理函数 --------
      switch (model.clear) {
        case "CR":
          this.clearSecondary = () => {
            const { W, H } = this;
            // FIXME:【支付宝小程序】频繁创建新的 OffscreenCanvas 会出现崩溃现象
            const { canvas, ctx } = getOffscreenCanvas({ width: W, height: H });
            this.Y = canvas;
            this.YC = ctx;
          };
          break;
        case "CL":
          this.clearSecondary = () => {
            const { W, H } = this;
            // FIXME:【支付宝小程序】无法通过改变尺寸来清理画布，无论是Canvas还是OffscreenCanvas
            this.YC!.clearRect(0, 0, W, H);
          };
          break;
        default:
          this.clearSecondary = () => {
            const { W, H, Y } = this;
            Y!.width = W;
            Y!.height = H;
          };
      }
      // #endregion clear secondary screen implement

      // #region stick implement
      // -------- 生成渲染函数 ---------
      switch (model.render) {
        case "DR":
          this.stick = () => {
            const { W, H } = this;
            // FIXME:【微信小程序】 drawImage 无法绘制 OffscreenCanvas；【抖音小程序】 drawImage 无法绘制 Canvas
            this.XC!.drawImage(this.Y as CanvasImageSource, 0, 0, W, H);
          };
          break;
        case "PU":
          this.stick = () => {
            const { W, H } = this;
            // FIXME:【所有小程序】 imageData 获取到的数据都是 0，可以当场使用，但不要妄图缓存它
            const imageData = this.YC!.getImageData(0, 0, W, H);
            this.XC!.putImageData(imageData, 0, 0, 0, 0, W, H);
          };
          break;
        default:
      }
      // #endregion stick implement
    }
  }

  /**
   * 加载图片集
   * @param images 图片数据
   * @param filename 文件名称
   * @returns
   */
  public loadImages(images: RawImages, filename: string): Promise<void> {
    return this.IM.loadImage(images, this, filename);
  }

  /**
   * 创建图片标签
   * @returns
   */
  public createImage(): PlatformImage {
    return this.IM.createImage(this.X!);
  }

  /**
   * 生成图片
   * @param type
   * @param encoderOptions
   * @returns
   */
  public getImage(type: string = "image/png", encoderOptions: number = 0.92) {
    return this.X!.toDataURL(type, encoderOptions);
  }

  public resize(
    contentMode: PLAYER_CONTENT_MODE,
    videoSize: ViewportRect
  ): void {
    const { Y } = this;
    let scaleX = 1.0;
    let scaleY = 1.0;
    let translateX = 0.0;
    let translateY = 0.0;

    if (contentMode === PLAYER_CONTENT_MODE.FILL) {
      scaleX = Y!.width / videoSize.width;
      scaleY = Y!.height / videoSize.height;
    } else if (
      [
        PLAYER_CONTENT_MODE.ASPECT_FILL,
        PLAYER_CONTENT_MODE.ASPECT_FIT,
      ].includes(contentMode)
    ) {
      const imageRatio = videoSize.width / videoSize.height;
      const viewRatio = Y!.width / Y!.height;

      if (
        (imageRatio >= viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT) ||
        (imageRatio <= viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FILL)
      ) {
        scaleX = scaleY = Y!.width / videoSize.width;
        translateY = (Y!.height - videoSize.height * scaleY) / 2.0;
      } else if (
        (imageRatio < viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FIT) ||
        (imageRatio > viewRatio &&
          contentMode === PLAYER_CONTENT_MODE.ASPECT_FILL)
      ) {
        scaleX = scaleY = Y!.height / videoSize.height;
        translateX = (Y!.width - videoSize.width * scaleX) / 2.0;
      }
    }

    this.globalTransform = {
      a: scaleX,
      b: 0.0,
      c: 0.0,
      d: scaleY,
      tx: translateX,
      ty: translateY,
    };
  }

  /**
   * 注册刷新屏幕的回调函数
   * @param cb
   */
  public flush(cb: () => void): void {
    (
      (Env.is(SE.H5) ? br : this.X) as WechatMiniprogram.Canvas
    ).requestAnimationFrame(cb);
  }

  public clearContainer: () => void = noop;

  public clearSecondary: () => void = noop;

  /**
   * 清理素材库
   */
  public clearMaterials() {
    this.IM.clear();
  }

  /**
   * 绘制图片片段
   * @param videoEntity
   * @param currentFrame
   * @param start
   * @param end
   */
  public draw(
    videoEntity: Video,
    currentFrame: number,
    start: number,
    end: number
  ) {
    render(
      this.YC!,
      this.IM.getMaterials(),
      videoEntity,
      currentFrame,
      start,
      end,
      this.globalTransform
    );
  }

  public stick: () => void = noop;

  /**
   * 销毁画笔
   */
  public destroy() {
    this.clearContainer();
    this.clearSecondary();
    this.clearMaterials();
    this.X = this.XC = this.Y = this.YC = null;
    this.clearContainer = this.clearSecondary = this.stick = noop;
  }
}
