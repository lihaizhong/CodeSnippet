import { br } from "./bridge";
import { app, SP } from "./app";

let p: string;

switch (app) {
  case SP.H5: {
    const UA = navigator.userAgent;

    if (/(Android)/i.test(UA)) {
      p = "Android";
    } else if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
      p = "iOS";
    } else if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
      p = "OpenHarmony";
    } else {
      p = "UNKNOWN";
    }
    break;
  }
  case SP.ALIPAY:
    p = br.getDeviceBaseInfo().platform as string;
    break;
  case SP.DOUYIN:
    p = br.getDeviceInfoSync().platform as string;
    break;
  case SP.WECHAT:
    p = br.getDeviceInfo().platform as string;
    break;
  default:
    p = "UNKNOWN";
}

export const platform = p.toLocaleUpperCase();
