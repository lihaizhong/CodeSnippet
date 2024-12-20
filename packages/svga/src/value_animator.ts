import { startAnimationFrame } from './adaptor'

export class ValueAnimator {
  static currentTimeMillSecond = () => {
    if (typeof performance === "undefined") {
      return new Date().getTime()
    }
    return performance.now()
  }

  canvas?: WechatMiniprogram.Canvas | HTMLCanvasElement
  startValue = 0
  endValue = 0
  duration = 0
  loops = 1
  fillRule = 0
  mRunning = false
  mStartTime = 0
  mCurrentFrication = 0.0
  mReverse = false

  onStart = () => {}
  onUpdate = (value: number) => {}
  onEnd = () => {}

  start(currentValue?: number) {
    this.doStart(false, currentValue)
  }

  reverse(currentValue?: number) {
    this.doStart(true, currentValue)
  }

  stop() {
    this.doStop()
  }

  animatedValue() {
    return (
      (this.endValue - this.startValue) * this.mCurrentFrication +
      this.startValue
    )
  }

  doStart(reverse: boolean, currentValue: number | undefined = undefined) {
    this.mReverse = reverse
    this.mRunning = true
    this.mStartTime = ValueAnimator.currentTimeMillSecond()
    if (currentValue) {
      if (reverse) {
        this.mStartTime -=
          (1.0 - currentValue / (this.endValue - this.startValue))
          * this.duration
      } else {
        this.mStartTime -=
          (currentValue / (this.endValue - this.startValue))
          * this.duration
      }
    }
    this.mCurrentFrication = 0.0
    this.onStart()
    this.doFrame()
  }

  doStop() {
    this.mRunning = false
  }

  doFrame() {
    const renderLoop = () => {
      if (!this.mRunning) return
      this.doDeltaTime(ValueAnimator.currentTimeMillSecond() - this.mStartTime)
      startAnimationFrame(this.canvas!, renderLoop)
    }

    startAnimationFrame(this.canvas!, renderLoop)
  }

  doDeltaTime(deltaTime: number) {
    let ended = false
    if (deltaTime >= this.duration * this.loops) {
      this.mCurrentFrication = this.fillRule === 1 ? 0.0 : 1.0
      this.mRunning = false
      ended = true
    } else {
      this.mCurrentFrication = (deltaTime % this.duration) / this.duration
      if (this.mReverse) {
        this.mCurrentFrication = 1.0 - this.mCurrentFrication
      }
    }
    this.onUpdate(this.animatedValue())
    if (this.mRunning === false && ended) {
      this.onEnd()
    }
  }
}
