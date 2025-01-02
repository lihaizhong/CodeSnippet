import { getImageSourceByShuffle } from './actions'
import { svgaSources } from '../../utils/constants'

Page({
  data: {
    url: svgaSources[0],
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
      prev = svgaSources.length - 1
    }

    this.setData({
      url: svgaSources[prev],
      current: prev
    })
  },

  handleSwitchNext() {
    const { current } = this.data
    let next = current + 1

    if (next > svgaSources.length - 1) {
      next = 0
    }

    this.setData({
      url: svgaSources[next],
      current: next
    })
  },
})
