import { svgaSources, getOneAtRandom } from "../../utils/constants";

Page({
  data: {
    url: "",
    current: 0,
  },

  onLoad() {
    this.handleSwitchAtRandom();
  },

  handleSwitchAtRandom() {
    const { ranIndex, url } = getOneAtRandom();

    this.setData({
      url,
      current: ranIndex,
    });
  },
  handleSwitchPrev() {
    const { current } = this.data;
    let prev = current - 1;

    if (prev < 0) {
      prev = svgaSources.length - 1;
    }

    this.setData({
      url: svgaSources[prev],
      current: prev,
    });
  },
  handleSwitchNext() {
    const { current } = this.data;
    let next = current + 1;

    if (next > svgaSources.length - 1) {
      next = 0;
    }

    this.setData({
      url: svgaSources[next],
      current: next,
    });
  },
});
