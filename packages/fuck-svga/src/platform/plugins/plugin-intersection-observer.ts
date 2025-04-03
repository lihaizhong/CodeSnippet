import { definePlugin } from "../definePlugin";

export default definePlugin<"intersectionObserver">({
  name: "intersectionObserver",
  install: () => () => {},
});
