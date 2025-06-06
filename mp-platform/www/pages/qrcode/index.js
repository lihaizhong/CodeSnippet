import { generateImageFromCode } from "octopus-svga";
import { createQrCodeImg } from "../../utils/qrcode";

function insertContainer(title, source, size, type = "img") {
  const $root = document.body;
  const $title = document.createElement("div");
  let $main;

  switch (type) {
    case "img":
      $main = document.createElement("img");
      $main.classList.add("qr-img");
      $main.style.width = `${size}px`;
      $main.style.height = `${size}px`;
      $main.src = source;
      break;
    case "html":
      $main = document.createElement("div");
      $main.classList.add("qr-img");
      $main.style.width = `${size}px`;
      $main.style.height = `${size}px`;
      $main.innerHTML = source;
      break;
    default:
      throw new Error(`not support type: ${type}`);
  }

  console.log(type, source);
  $title.classList.add("qr-img-title");
  $title.innerText = `---- ${title.toUpperCase()} ----`;
  $root.appendChild($title);
  $root.appendChild($main);
}

const QRCodeUtils = {
  getSize() {
    // return document.body.clientWidth * 0.6;
    return 258;
  },

  // --- insertQrCodeImg

  insertQrCodeImg(size) {
    console.time("createQrCodeImg");
    const img = createQrCodeImg("this is a test");
    console.timeEnd("createQrCodeImg");

    insertContainer("origin gif", img, size);
  },

  // --- insertQrCodeToPNG

  insertQrCodeToPNG(size) {
    console.time("generateImageFromCode");
    const img = generateImageFromCode({
      code: "i generate a png",
      size: 500,
    });
    console.timeEnd("generateImageFromCode");

    insertContainer("png", img, size);
  },

  // --- insertQrCodeToGIF

  // insertQrCodeToGIF(size) {
  //   console.time('createQRCodeToGIF');
  //   const img = createQRCodeToGIF("i generate a gif");
  //   console.timeEnd('createQRCodeToGIF');

  //   insertContainer('gif', img, size);
  // },

  // --- insertQrCodeToHTML

  // insertQrCodeToHTML(size) {
  //   console.time('createQRCodeToHTML');
  //   const img = createQRCodeToHTML("i generate a table tag", { size });
  //   console.timeEnd('createQRCodeToHTML');

  //   insertContainer('html table', img, size, 'html');
  // }
};

window.onload = () => {
  const size = QRCodeUtils.getSize();

  setTimeout(() => {
    QRCodeUtils.insertQrCodeImg(size);
  }, 0);
  setTimeout(() => {
    QRCodeUtils.insertQrCodeToPNG(size);
  }, 0);
  // setTimeout(() => {
  //   QRCodeUtils.insertQrCodeToGIF(size);
  // }, 0);
  // setTimeout(() => {
  //   QRCodeUtils.insertQrCodeToHTML(size);
  // }, 0);
};
