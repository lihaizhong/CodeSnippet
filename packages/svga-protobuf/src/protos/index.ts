import root from "../utils/roots";
import MovieEntity from "./MovieEntity";
import FrameEntity from "./FrameEntity";
import ShapeEntity from "./ShapeEntity";
import SpriteEntity from "./SpriteEntity";
import MovieParams from "./MovieParams";
import Layout from "./Layout";
import Transform from "./Transform";

root.com = {
  opensource: {
    svga: {
      MovieParams,
      Layout,
      Transform,
      ShapeEntity,
      FrameEntity,
      SpriteEntity,
      MovieEntity,
    },
  },
};

export default root;
