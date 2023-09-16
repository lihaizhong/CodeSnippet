Page({
  data: {
    btnList: [
      {
        text: "跳转SVGA动画",
        path: "/pages/svga/index",
      },
      {
        text: "跳转表单",
        path: "/pages/webview/index",
      },
      {
        text: "跳转SVGA分析",
        path: "/pages/svga-analyze/index",
      },
    ],
  },

  handleNavigateTo(e) {
    const { url } = e.currentTarget.dataset;

    if (url) {
      my.navigateTo({ url });
    } else {
      console.error("未获取到跳转路径", e);
    }
  },
});
