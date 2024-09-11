export interface Namespace {

}

export class ReflectionObject<T extends Namespace> {
  /**
   * Parent namespace.
   * @type {Namespace|null}
   */
  parent: ReflectionObject<T> | null = null
  /**
   * Whether already resolved or not.
   * @type {boolean}
   */
  resolved = false
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
    readonly options: Record<string, any>
  ) {}

  /**
   * Reference to the root namespace.
   * @name ReflectionObject#root
   * @type {Root}
   * @readonly
   */
  get root() {
    let ptr: ReflectionObject<T> = this

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
  /**
   * Called when this object is added to a parent.
   * @param {ReflectionObject} parent Parent added to
   * @returns {undefined}
   */
  onAdd(parent: ReflectionObject<T>): void {
    if (this.parent && this.parent !== parent) {
      this.parent.remove(this)
    }

    this.parent = parent
    this.resolved = false

    const root = parent.root

    if (root instanceof Root) {
      root._handleAdd(this)
    }
  }

  /**
   * Called when this object is removed from a parent.
   * @param {ReflectionObject} parent Parent removed from
   * @returns {undefined}
   */
  onRemove(parent) {
    const root = parent.root

    if (root instanceof Root) {
      root._handleRemove(this)
    }

    this.parent = null
    this.resolved = false
  }

  /**
   * Resolves this objects type references.
   * @returns {ReflectionObject} `this`
   */
  resolve() {
    if (this.resolved) {
      return this
    }

    if (this.root instanceof Root) {
      this.resolved = true // only if part of a root
    }

    return this
  }
}