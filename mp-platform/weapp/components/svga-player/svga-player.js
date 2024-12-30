import { Parser, Player } from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";

let player;
let parser;
const readyGo = new ReadyGo();

Component({
  properties: {
    url: {
      type: String,
      value: "",
    },
  },

  observers: {
    url(value) {
      if (value !== "") {
        readyGo.ready(this.initialize.bind(this));
        // this.initialize();
      }
    },
  },

  lifetimes: {
    ready() {
      readyGo.go();
    },
    detached() {
      readyGo.reset();
      this.stop();
      player = null;
      parser = null;
    },
  },

  data: {
    message: ""
  },

  methods: {
    async initialize() {
      try {
        this.setData({ message: "实例创建中" })
        if (!(parser instanceof Parser)) {
          parser = new Parser();
        }

        if (player instanceof Player) {
          player.stop();
        } else {
          player = new Player();
        }

        this.setData({ message: "实例化成功" })
        // wx.showLoading();
        const videoItem = await parser.load(this.properties.url);
        this.setData({ message: "下载资源成功" })
        await player.mount(videoItem, "#palette", this);
        this.setData({ message: "资源装载成功" })
        // wx.hideLoading();
        this.setData({ message: "准备开始播放" })
        player.start();
        this.setData({ message: "" })
      } catch (ex) {
        // wx.hideLoading();
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message })
      }
    },
    stop() {
      if (player) {
        player.stop();
      }
    },
  },
});
