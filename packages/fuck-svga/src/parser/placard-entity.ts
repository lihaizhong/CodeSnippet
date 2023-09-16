// import type { MovieEntity } from "fuck-protobuf";
// import { VideoEntity } from "./video-entity";

// export class PlacardEntity extends VideoEntity {
//   constructor(data: any[], viewBoxWidth: number, viewBoxHeight: number) {
//     const videoEntity: MovieEntity = {
//       version: "",
//       images: {},
//       sprites: [
//         {
//           frames: [],
//           imageKey: "1",
//           matteKey: "",
//         },
//       ],
//       params: {
//         fps: 0,
//         frames: 1,
//         viewBoxWidth,
//         viewBoxHeight,
//       },
//     };

//     data.forEach((item: any, index: number) => {
//       const key = `frag_${index}`;
//       const sprite = videoEntity.sprites[index];

//       // 插入图片
//       videoEntity.images[key] = item.url;
//       // 插入关键帧
//       sprite.imageKey = key;
//       sprite.frames[0] = item;
//       sprite.matteKey = "";
//     });

//     super(videoEntity, videoEntity.images);
//   }
// }
