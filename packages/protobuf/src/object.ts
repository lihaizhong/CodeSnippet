import Namespace from "./namespace"

/**
 * Constructs a new reflection object instance.
 * @classdesc Base class of all reflection objects.
 * @constructor
 * @param {string} name Object name
 * @param {Object.<string,*>} [options] Declared options
 * @abstract
 */
export default class ReflectionObject {
  /**
   * Parsed Options.
   * @type {Array.<Object.<string,*>>|undefined}
   */
  parsedOptions?: Record<string, any>

  /**
   * Parent namespace.
   * @type {Namespace|null}
   */
  parent: Namespace | null = null

  /**
   * Whether already resolved or not.
   * @type {boolean}
   */
  resolved: boolean = false

  /**
   * Comment text, if any.
   * @type {string|null}
   */
  comment: string | null = null

  /**
   * Defining file name.
   * @type {string|null}
   */
  filename: string | null = null

  constructor(
    /**
     * Unique name within its namespace.
     * @type {string}
     */
    readonly name: string,
    /**
     * Options.
     * @type {Object.<string,*>|undefined}
     */
    readonly options?: Record<string, any>
  ) {}

  /**
   * Reference to the root namespace.
   * @name ReflectionObject#root
   * @type {Root}
   * @readonly
   */
  get root(): ReflectionObject {
    let ptr = this

    while (ptr.parent !== null) {
      ptr = ptr.parent
    }

    return ptr
  }

  /**
   * Full name including leading dot.
   * @name ReflectionObject#fullName
   * @type {string}
   * @readonly
   */
  get fullName(): string {
    const path = [ this.name ]
    let ptr = this.parent

    while (ptr) {
      path.unshift(ptr.name)
      ptr = ptr.parent
    }

    return path.join('.')
  }

  /**
   * Called when this object is added to a parent.
   * @param parent Parent added to
   */
  onAdd(parent: ReflectionObject): void {}

  /**
   * Called when this object is removed from a parent.
   * @param parent Parent removed from
   */
  onRemove(parent: ReflectionObject): void {}

  /**
   * Resolves this objects type references.
   * @returns `this`
   */
  resolve(): ReflectionObject {}

  /**
   * Gets an option value.
   * @param name Option name
   * @returns Option value or `undefined` if not set
   */
  getOption(name: string): any {}

  /**
   * Sets an option.
   * @param name Option name
   * @param value Option value
   * @param [ifNotSet] Sets the option only if it isn't currently set
   * @returns `this`
   */
  setOption(name: string, value: any, ifNotSet?: boolean): ReflectionObject {}

  /**
   * Sets a parsed option.
   * @param name parsed Option name
   * @param value Option value
   * @param propName dot '.' delimited full path of property within the option to set. if undefined\empty, will add a new option with that value
   * @returns `this`
   */
  setParseOption(name: string, value: any, propName: string): ReflectionObject {}

  /**
   * Sets multiple options.
   * @param options Options to set
   * @param [ifNotSet] Sets an option only if it isn't currently set
   * @returns `this`
   */
  setOptions(options: { [k: string]: any }, ifNotSet?: boolean): ReflectionObject {}

  /**
   * Converts this instance to its string representation.
   * @returns Class name[, space, full name]
   */
  toString(): string {}
}