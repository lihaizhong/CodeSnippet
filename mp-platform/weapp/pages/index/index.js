import { unzlibSync } from 'fflate'
import { MovieEntity } from 'svga-protobuf'

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
  },

  onLoad() {
    // 测试svga解析
    wx.request({
      url: 'https://assets.2dfire.com/frontend/1ddb590515d196f07c411794633e4406.svga',
      responseType: 'arraybuffer',
      enableCache: true,
      success(res) {
        const header = new Uint8Array(res.data, 0, 4)
        const u8a = new Uint8Array(res.data)

        if (header.toString() === '80,75,3,4') {
          throw new Error('this parser only support version@2 of SVGA.')
        }

        const inflateData = unzlibSync(u8a)
        const movieData = MovieEntity.decode(inflateData)

        console.log('movieData', movieData)
      }
    })
  }
})