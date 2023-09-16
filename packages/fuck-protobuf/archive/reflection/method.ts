import ReflectionObject from "./object";

export default class Method extends ReflectionObject {
  /**
   * Constructs a new service method instance.
   * @classdesc Reflected service method.
   * @extends ReflectionObject
   * @constructor
   * @param {string} name Method name
   * @param {string|undefined} type Method type, usually `"rpc"`
   * @param {string} requestType Request message type
   * @param {string} responseType Response message type
   * @param {boolean|Object.<string,*>} [requestStream] Whether the request is streamed
   * @param {boolean|Object.<string,*>} [responseStream] Whether the response is streamed
   * @param {Object.<string,*>} [options] Declared options
   * @param {string} [comment] The comment for this method
   * @param {Object.<string,*>} [parsedOptions] Declared options, properly parsed into an object
   */
  constructor(
    name: string,
    type: string,
    requestType: string,
    responseType: string,
    requestStream: boolean | Record<string, any>,
    responseStream: boolean | Record<string, any>,
    options: Record<string, any>,
    comment: string,
    parsedOptions: Record<string, any>
  ) {
    super(name, options)
  }
}
