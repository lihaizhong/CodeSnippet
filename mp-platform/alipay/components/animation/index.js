import { Parser, Player } from "../../utils/fuck-svga";
import ReadyGo from "../../utils/ReadyGo";

let player;
let parser;
const readyGo = new ReadyGo();

Component({
  options: {
    lifetimes: true,
    observers: true,
    virtualHost: false,
  },

  props: {
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
        // my.showLoading();
        const videoItem = await parser.load(this.props.url);
        this.setData({ message: "下载资源成功" });
        await player.mount(videoItem);
        this.setData({ message: "资源装载成功" });
        player.start();
        this.setData({ message: "" });
      } catch (ex) {
        // my.hideLoading();
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
