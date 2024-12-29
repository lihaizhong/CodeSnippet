import { ImageSources } from './constants'

function shuffle (values) {
  for (let i = 0; i < values.length; i++) {
    const ranIndex = Math.floor(Math.random() * (i + 1))
    const itemAtIndex = values[i]

    values[i] = values[ranIndex]
    values[ranIndex] = itemAtIndex
  }

  return values
}

export function getImageSourceByShuffle () {
  return shuffle(ImageSources.slice(0))
}
