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
      }
    },
  },

  lifetimes: {
    async ready() {
      parser = new Parser();
      player = new Player();
      await player.setConfig(
        {
          container: "#palette",
          secondary: "#secondary",
        },
        this
      );
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
    message: "",
  },

  methods: {
    async initialize() {
      try {
        this.setData({ message: "准备下载资源" });
        const videoItem = await parser.load(this.properties.url);
        this.setData({ message: "下载资源成功" });
        await player.mount(videoItem);
        this.setData({ message: "资源装载成功" });
        player.start();
        this.setData({ message: "" });
      } catch (ex) {
        console.error("svga初始化失败！", ex);
        this.setData({ message: ex.message + "\n" + ex.stack });
      }
    },
    stop() {
      if (player) {
        player.stop();
      }
    },
  },
});
