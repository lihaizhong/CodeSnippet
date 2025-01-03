import { svgaSources } from '../../utils/constants'

export function getOneAtRandom () {
  const ranIndex = Math.floor(Math.random() * svgaSources.length)

  return { ranIndex, url: svgaSources[ranIndex] }
}