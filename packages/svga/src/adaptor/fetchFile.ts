import { getBridge } from "./birdge"
import { platform, SupportedPlatform, UNSUPPORTED_PLATFORM } from "./platform"

function request(url: string): Promise<any> {
  if (platform === SupportedPlatform.H5) {
    return fetch(url, {
      cache: 'no-cache'
    })
    .then((response) => {
      if (response.ok) {
        return response.arrayBuffer()
      } else {
        throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`)
      }
    })
  }

  if (platform !== SupportedPlatform.UNKNOWN) {
    const bridge = getBridge() as WechatMiniprogram.Wx

    return new Promise((resolve, reject) => {
      bridge.request({
        url,
        dataType: '其他',
        responseType: 'arraybuffer',
        enableCache: true,
        success(res: any) {
          resolve(res.data)
        },
        fail: reject
      })
    })
  }

  return Promise.reject(UNSUPPORTED_PLATFORM)
}

export function fetchFile(url: string): Promise<any> {
  if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
    return request(url)
  }
  
  if (platform !== SupportedPlatform.H5) {
    return new Promise((resolve, reject) => {
      const bridge = getBridge() as WechatMiniprogram.Wx

      bridge.getFileSystemManager().readFile({
        filePath: url,
        success: (res) => {
          resolve(res.data)
        },
        fail: (error) => {
          reject(error)
        },
      })
    })
  }

  return Promise.reject(UNSUPPORTED_PLATFORM)
}