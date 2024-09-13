/**
 * Constructs a new reflection object instance.
 * @classdesc Base class of all reflection objects.
 * @constructor
 * @param {string} name Object name
 * @param {Object.<string,*>} [options] Declared options
 * @abstract
 */
export default class ReflectionObject {
  static Root: any

  /**
   * Parsed Options.
   * @type {Array.<Object.<string,*>>|undefined}
   */
  private parsedOptions: any[] | null = null

  /**
   * Parent namespace.
   * @type {Namespace|null}
   */
  private parent: any = null

  /**
   * Whether already resolved or not.
   * @type {boolean}
   */
  private resolved: boolean = false

  /**
   * Comment text, if any.
   * @type {string|null}
   */
  private comment: string | null = null

  /**
   * Defining file name.
   * @type {string|null}
   */
  private filename: string | null = null

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
    readonly options?: any
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
  get fullName() {
    const path = [ this.name ]
    let ptr = this.parent

    while (ptr) {
      path.unshift(ptr.name)
      ptr = ptr.parent
    }

    return path.join('.')
  }

  onAdd(parent: ReflectionObject) {
    if (this.parent && this.parent !== parent) {
      this.parent.remove(this)
    }

    this.parent = parent
    this.resolved = true

    const root = parent.root
    if (root instanceof ReflectionObject.Root) {
      root._handleAdd(this)
    }
  }
}