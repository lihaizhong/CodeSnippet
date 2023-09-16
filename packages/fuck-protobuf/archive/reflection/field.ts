import { isObject } from "../utils";
import ReflectionObject from "./object";
import OneOf from "./oneof";
import Type from "./type";

export default class Field extends ReflectionObject {
  /**
   * Field rule, if any.
   * @type {string|undefined}
   */
  rule?: string
  /**
   * Field type.
   * @type {string}
   */
  type: string
  /**
   * Unique field id.
   * @type {number}
   */
  id: number
  /**
   * Extended type if different from parent.
   * @type {string|undefined}
   */
  extend?: string
  /**
   * Whether this field is required.
   * @type {boolean}
   */
  required: boolean
  /**
   * Whether this field is optional.
   * @type {boolean}
   */
  optional: boolean
  /**
   * Whether this field is repeated.
   * @type {boolean}
   */
  repeated: boolean
  /**
   * Whether this field is a map or not.
   * @type {boolean}
   */
  map: boolean
  /**
   * Message this field belongs to.
   * @type {Type|null}
   */
  message: Type | null = null
  /**
   * OneOf this field belongs to, if any,
   * @type {OneOf|null}
   */
  partOf: OneOf | null = null
  /**
   * The field type's default value.
   * @type {*}
   */
  typeDefault: any = null
  /**
   * The field's default value on prototypes.
   * @type {*}
   */
  defaultValue: any = null

  /**
   * Not an actual constructor. Use {@link Field} instead.
   * @classdesc Base class of all reflected message fields. This is not an actual class but here for the sake of having consistent type definitions.
   * @exports FieldBase
   * @extends ReflectionObject
   * @constructor
   * @param {string} name Unique name within its namespace
   * @param {number} id Unique id within its namespace
   * @param {string} type Value type
   * @param {string|Object.<string,*>} [rule="optional"] Field rule
   * @param {string|Object.<string,*>} [extend] Extended type if different from parent
   * @param {Object.<string,*>} [options] Declared options
   * @param {string} [comment] Comment associated with this field
   */
  constructor(name: string, id: number, type: string, rule: string | Record<string, any>, extend: string | Record<string, any>, options: Record<string, any>, comment: string) {
    if (isObject(rule)) {
      comment = extend
      options = rule
      rule = extend = undefined
    } else if (isObject(extend)) {
      comment = options
      options = extend
      extend = undefined
    }

    super(name, options)


  }
}
