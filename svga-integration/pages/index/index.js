import { ImageSources } from './constants'

const app = getApp()

Page({
  data: {
    url: ImageSources[0],
    current: 0
  },

  // shuffle (values) {
  //   for (let i = 0; i < values.length; i++) {
  //     const ranIndex = Math.floor(Math.random() * (i + 1))
  //     const itemAtIndex = values[i]
  
  //     values[i] = values[ranIndex]
  //     values[ranIndex] = itemAtIndex
  //   }
  // },

  switchRandom() {
    const { length } = ImageSources
    const index = Math.floor(Math.random() * length)

    // this.shuffle(ImageSources)
    this.setData({ url: ImageSources[index], current: index })
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

    this.setData({ url: ImageSources[prev], current: prev })
  },

  handleSwitchNext() {
    const { current } = this.data
    let next = current + 1

    if (next > ImageSources.length - 1) {
      next = 0
    }

    this.setData({ url: ImageSources[next], current: next })
  },
})
