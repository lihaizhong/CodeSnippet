Page({
  data: {
    btnList: [
      {
        text: '跳转SVGA动画',
        path: '/pages/svga/index'
      },
      {
        text: '跳转Webview',
        path: '/pages/webview/index'
      }
    ]
  },
  handleNavigateTo(e) {
    const { url } = e.currentTarget.dataset

    if (url) {
      wx.navigateTo({ url })
    } else {
      console.error('为获取到跳转路径', e)
    }
  }
})