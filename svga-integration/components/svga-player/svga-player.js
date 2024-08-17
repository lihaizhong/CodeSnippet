import { Parser, Player } from "../../utils/svgaplayer.weapp";

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
          await player.setCanvas("#palette", this);
        } else {
          player.stopAnimation();
        }

        const videoItem = await parser.load(this.properties.url);
        await player.setVideoItem(videoItem);
        // player.loops = 1;
        player.startAnimation();
      } catch (ex) {
        console.error("svga初始化失败！", ex);
      }
    },
    stop() {
      if (player) {
        player.stopAnimation();
      }
    },
  },
});
