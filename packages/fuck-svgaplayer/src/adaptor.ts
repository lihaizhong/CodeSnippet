declare const my: WechatMiniprogram.Wx;
declare const tt: WechatMiniprogram.Wx;

export function getMiniBridge (): WechatMiniprogram.Wx {
  if (typeof tt !== 'undefined') {
    return tt;
  }

  if (typeof wx === 'undefined' && typeof my !== 'undefined') {
    return my;
  }

  return wx;
}

export const bridge = getMiniBridge()
