import { TextEncoder, TextDecoder } from "util";
import { initialPlatformGlobal } from "./initial";

Object.assign(global, {
  TextDecoder,
  TextEncoder,
  initialPlatformGlobal,
});
