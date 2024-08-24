import { getImageSourceByShuffle } from './actions'
import { ImageSources } from './constants'

const app = getApp()

Page({
  data: {
    url: ImageSources[0],
    current: 0
  },

  switchRandom() {
    const ShuffleImageSources = getImageSourceByShuffle()
    const { length } = ShuffleImageSources
    const index = Math.floor(Math.random() * length)

    this.setData({
      url: ShuffleImageSources[index],
      current: index
    })
  },

  handleSwitch() {
    this.switchRandom()
  },

  handleSwitchPrev() {
    const { current } = this.data
    let prev = current - 1

    if (prev < 0) {
      prev = ImageSources.length - 1
    }

    this.setData({
      url: ImageSources[prev],
      current: prev
    })
  },

  handleSwitchNext() {
    const { current } = this.data
    let next = current + 1

    if (next > ImageSources.length - 1) {
      next = 0
    }

    this.setData({
      url: ImageSources[next],
      current: next
    })
  },
})
