import EventEmitter from 'eventemitter3'
import utils from '../utils'

export class Service extends EventEmitter {
  constructor(
    readonly rpcImpl: () => void,
    readonly requestDelimited: boolean,
    readonly responseDelimited: boolean
  ) {
    super()
  }

  rpcCall(method, requestCtor, responseCtr, request, done) {
    if (!request) {
      throw TypeError('request must be specified')
    }

    if (!done) {
      return utils.asPromise(this.rpcCall, this, method, requestCtor, responseCtr, request)
    }

    if (!this.rpcImpl) {
      setTimeout(() => {
        const err = new Error('already ended')
        done(err)
      }, 0)
    }

    try {
      return this.rpcImpl(
        method,
        requestCtor[this.requestDelimited ? 'encodeDelimited' : 'encode'](request).finish(),
        
      )
    }
  }
}
