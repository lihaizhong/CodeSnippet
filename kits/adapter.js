/**
 * @author Sky
 * @email lihaizh_cn@foxmail.com
 * @create date 2018-01-02 05:17:38
 * @modify date 2018-01-02 05:17:38
 * @desc 适配手机屏幕
 *  注：标签的尺寸单位请使用 rem(根据html的font-size定义宽度)
 *     页面按照750px宽度定义，如果想要得到750px的宽度，只要修改成7.5rem即可，以此类推！(rem = px/100)
 *     data-mw = '750' default
 */

/**
 * 方法一
 */
((doc, win) => {
  const docEl = doc.documentElement;
  const maxWidth = docEl.dataset.mw || 750;
  const readyRE = /complete|loaded|interactive/;
  const recalculate = () => {
    // 获取设备的宽度
    const clientWidth = window.screen.width;
    if (!clientWidth) return;
    docEl.style.fontSize = `${100 * (clientWidth / maxWidth)}px`;
    // window.devicePixelRatio是设备上物理像素和设备独立像素(device-independent pixels (dips))的比例。
    // 公式就是: window.devicePixelRatio = 物理像素 / dips (非视网膜屏为1， 视网膜屏为2)
    docEl.setAttribute("dpr", window.devicePixelRatio || 1);
    doc.removeEventListener("DOMContentLoaded", recalculate, false);
  };

  // Abort if browser does not support addEventListener
  if (!doc.addEventListener) return;

  win.addEventListener("resize", recalculate, false);
  win.addEventListener(
    "pageshow",
    (e) => {
      if (e.persisted) {
        recalculate();
      }
    },
    false
  );

  if (readyRE.test(document.readyState) && document.body) {
    recalculate();
  } else {
    doc.addEventListener("DOMContentLoaded", recalculate, false);
  }
})(document, window);

/**
 * 方法二
 */
(function flexible(window, document) {
  const docEl = document.documentElement;
  const dpr = window.devicePixelRatio || 1;

  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = `${12 * dpr}px`;
    } else {
      document.addEventListener("DOMContentLoaded", setBodyFontSize);
    }
  }

  setBodyFontSize();

  // set 1rem = viewWidth / 10
  function setRemUnit() {
    docEl.style.fontSize = `${docEl.clientWidth / 10}px`;
  }

  setRemUnit();

  // reset rem unit on page resize
  window.addEventListener("resize", setRemUnit);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      setRemUnit();
    }
  });

  // detect 0.5px supports
  if (dpr >= 2) {
    const fakeBody = document.createElement("body");
    const testElement = document.createElement("div");

    testElement.style.border = ".5px solid transparent";
    fakeBody.appendChild(testElement);
    docEl.appendChild(fakeBody);

    if (testElement.offsetHeight === 1) {
      docEl.classList.add("hairlines");
    }

    docEl.removeChild(fakeBody);
  }
})(window, document);
