export const SupportedPlatform = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
  DOUYIN: 'douyin',
  H5: 'h5',
  UNKNOWN: 'unknown'
}

export const UNSUPPORTED_PLATFORM = '不支持当前平台'

export function getPlatform() {
  // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
  if (typeof tt !== 'undefined') {
    return SupportedPlatform.DOUYIN
  }

  if (typeof my !== 'undefined') {
    return SupportedPlatform.ALIPAY
  }

  if (typeof wx !== 'undefined') {
    return SupportedPlatform.WECHAT
  }

  if (typeof window !== 'undefined') {
    return SupportedPlatform.H5
  }

  return SupportedPlatform.UNKNOWN
}

export const platform = getPlatform()
