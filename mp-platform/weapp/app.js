import URLSearchParams from '@ungap/url-search-params'

App({
  onLaunch() {},

  onPageNotFound(e) {
    const { path, query } = e

    if (path === 'pages/index') {
      const params = new URLSearchParams(query)
      const url = `${path}/index?${params.toString()}`

      console.warn('未找到页面，正在重定向到', url)
      wx.navigateTo({ url })
    } else {
      console.error('未找到页面', e)
    }
  }
})
