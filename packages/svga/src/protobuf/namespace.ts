/**
 * Constructs a new namespace instance.
 * @name Namespace
 * @classdesc Reflected namespace.
 * @extends NamespaceBase
 * @constructor
 * @param {string} name Namespace name
 * @param {Object.<string,*>} [options] Declared options
 */
import ReflectionObject from "./object"

type ANyExtensionField = IExtensionField | IExtensionMapField

type AnyNestedObject = IEnum | IType | IService | AnyExtensionField | INamespace | IOneOf

export interface INamespace {
  options?: Record<string, any>

  nested?: Record<string, AnyNestedObject>
}

/**
 * Not an actual constructor. Use {@link Namespace} instead.
 * @classdesc Base class of all reflection objects containing nested objects. This is not an actual class but here for the sake of having consistent type definitions.
 * @exports NamespaceBase
 * @extends ReflectionObject
 * @abstract
 * @constructor
 * @param {string} name Namespace name
 * @param {Object.<string,*>} [options] Declared options
 * @see {@link Namespace}
 */
export default class Namespace {
  /**
   * Constructs a namespace from JSON.
   * @memberof Namespace
   * @function
   * @param {string} name Namespace name
   * @param {Object.<string,*>} json JSON object
   * @returns {Namespace} Created namespace
   * @throws {TypeError} If arguments are invalid
   */
  static fromJSON(name: string, json: Record<string ,any>): Namespace {
    return new Namespace(name, json.options).addJSON(json.nested)
  }

  /**
   * Converts an array of reflection objects to JSON.
   * @memberof Namespace
   * @param {ReflectionObject[]} array Object array
   * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
   * @returns {Object.<string,*>|undefined} JSON object or `undefined` when array is empty
   */
  static arrayToJSON(array: any[], toJSONOptions: any) {
    if (!(Array.isArray(array) && array.length)) {
      return undefined
    }

    const obj: Record<string, any> = {}

    for (let i = 0; i < array.length; i++) {
      obj[array[i].name] = array[i].toJSON(toJSONOptions)
    }

    return obj
  }

  /**
   * Tests if the specified id is reserved.
   * @param {Array.<number[]|string>|undefined} reserved Array of reserved ranges and names
   * @param {number} id Id to test
   * @returns {boolean} `true` if reserved, otherwise `false`
   */
  static isReservedId(reserved: Array<string | [number, number]> | undefined, id: number): boolean {
    if (reserved) {
      for (let i = 0; i < reserved.length; i++) {
        if (typeof reserved[i] !== 'string' && (reserved[i][0] as number) <= id && (reserved[i][1] as number) > id) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Tests if the specified name is reserved.
   * @param {Array.<number[]|string>|undefined} reserved Array of reserved ranges and names
   * @param {string} name Name to test
   * @returns {boolean} `true` if reserved, otherwise `false`
   */
  static isReservedName(reserved: Array<string | [number, number]> | undefined, name: string): boolean {
    if (reserved) {
      for (let i = 0; i < reserved.length; i++) {
        if (reserved[i] === name) {
          return true
        }
      }
    }

    return false
  }

  nested?: Record<string, ReflectionObject>

  readonly nestedArray: ReflectionObject[]

  constructor(readonly name: string, readonly options?: Record<string, any>) {}

  toJSON(toJSONOptions?: IToJSONOptions): INamespace

  addJSON(nestedJson: Record<string, ANyNestedObject>): Namespace {}

  get(name: string): ReflectionObject {}

  getEnum(name: string): Record<string, number> {}

  add(object: ReflectionObject): Namespace {}

  remove(object: ReflectionObject): Namespace {}

  define(path: string | string[], json?: any): Namespace {}

  resolveAll(): Namespace {}

  lookup(path: string | string[], parentAlreadyChecked?: boolean): ReflectionObject | null {}

  lookupType(path: string | string[]): Type {}

  lookupEnum(path: string | string[]): Enum {}

  lookupTypeOrEnum(path: string | string[]): Type {}

  lookService(path: string | string[]): Service {}
}