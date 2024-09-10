import EventEmitter from 'eventemitter3'

export class Service extends EventEmitter {
  constructor(
    readonly rpcImpl: () => void,
    readonly requestDelimited: boolean,
    readonly responseDelimited: boolean
  ) {}

  rpcCall(method, requestCtor, responseCtr, request, callback) {
    if (!request) {
      throw TypeError('request must be specified')
    }

    if (!callback) {
      return new Promise()
    }
  }
}
