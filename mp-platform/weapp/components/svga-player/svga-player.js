// import { Parser, Player } from "../../utils/svgaplayer.weapp";
import { Parser, Player } from "../../utils/fuck-svga";

let player;
let parser;

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
        this.initialize();
      }
    },
  },

  lifetimes: {
    detached() {
      this.stop();
      player = null;
      parser = null;
    },
  },

  methods: {
    async initialize() {
      try {
        if (!parser) {
          parser = new Parser();
        }

        if (!player) {
          player = new Player();
          await player.setConfig("#palette", this);
        } else {
          player.stop();
        }

        const videoItem = await parser.load(this.properties.url);
        await player.mount(videoItem);
        player.start();
      } catch (ex) {
        console.error("svga初始化失败！", ex);
      }
    },
    stop() {
      if (player) {
        player.stop();
      }
    },
  },
});
