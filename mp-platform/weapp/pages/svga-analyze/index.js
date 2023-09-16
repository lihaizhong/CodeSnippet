import { unzlibSync } from "../../utils/fflate";
import { MovieEntityReader } from "../../utils/svga-protobuf";
import { getOneAtRandom } from "../../utils/constants";

Page({
  data: {
    images: [],
    params: {
      width: 0,
      height: 0,
    },
  },

  onLoad() {
    const { url } = getOneAtRandom();
    // const url = svgaSources[40];

    // 测试svga解析
    wx.request({
      url,
      responseType: "arraybuffer",
      enableCache: true,
      success: (res) => {
        const header = new Uint8Array(res.data, 0, 4);
        const u8a = new Uint8Array(res.data);

        if (header.toString() === "80,75,3,4") {
          throw new Error("this parser only support version@2 of SVGA.");
        }

        const inflateData = unzlibSync(u8a);
        const movieData = MovieEntityReader.decode(inflateData);

        console.log("movieData", movieData);

        const windowInfo = wx.getWindowInfo();
        const images = [];
        const { viewBoxHeight, viewBoxWidth } = movieData.params;
        Object.keys(movieData.images).forEach((key) => {
          const data = movieData.images[key];
          const ab = data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength
          );
          images.push(
            `data:image/png;base64,${wx.arrayBufferToBase64(ab)}`
              .replace(/[\r\n]/g, "")
              .replace(" ", "")
          );
        });
        this.setData({
          images,
          params: {
            width: windowInfo.screenWidth,
            height: viewBoxHeight * (windowInfo.screenWidth / viewBoxWidth),
          },
        });
      },
    });
  },
});
