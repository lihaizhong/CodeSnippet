import { IField } from "./field";
import Namespace from "./namespace";
import { IOneOf } from "./oneof";

/**
 * Constructs a new reflected message type instance.
 * @classdesc Reflected message type.
 * @extends NamespaceBase
 * @constructor
 * @param {string} name Message name
 * @param {Object.<string,*>} [options] Declared options
 */
export class Type extends Namespace {

  /**
   * Oneofs declared within this namespace, if any.
   * @type {Object.<string,OneOf>}
   */
  oneofs?: { [k: string]: IOneOf }

  /**
   * Message fields.
   * @type {Object.<string,Field>}
   */
  fields: { [k: string]: IField } = {}

  /**
   * Extension ranges, if any.
   * @type {number[][]}
   */
  extensions?: number[][] // toJSON

  /**
   * Reserved ranges, if any.
   * @type {Array.<number[]|string>}
   */
  reserved?: (number[]|string)[] // toJSON

  /**
   * Whether this type is a legacy group.
   * @type {boolean|undefined}
   */
  group?: boolean // toJSON

  /**
   * Cached fields by id.
   * @type {Object.<number,Field>|null}
   * @private
   */
  private _fieldsById: Record<number, IField> | null = null

  /**
   * Cached fields as an array.
   * @type {Field[]|null}
   * @private
   */
  private _fieldsArray: IField[] | null = null

  /**
   * Cached oneofs as an array.
   * @type {OneOf[]|null}
   * @private
   */
  private _oneofsArray: IOneOf[] | null = null

  /**
   * Cached constructor.
   * @type {Constructor<{}>}
   * @private
   */
  private _ctor = null

  /**
   * Message fields by id.
   * @name Type#fieldsById
   * @type {Object.<number,Field>}
   * @readonly
   */
  get fieldsById() {
    if (this._fieldsById) {
      return this._fieldsById
    }

    this._fieldsById = {}

    for (let names = Object.keys(this.fields), i = 0; i < names.length; i++) {
      const field = this.fields[names[i]]
      const { id } = field

      if (this._fieldsById[id]) {
        throw new Error(`duplicate id [${id}] in ${this}`)
      }

      this._fieldsById[id] = field
    }

    return this._fieldsById
  }

  /**
   * Fields of this message as an array for iteration.
   * @name Type#fieldsArray
   * @type {Field[]}
   * @readonly
   */
  get fieldArray() {
    return this._fieldsArray || (this._fieldsArray = Object.values(this.fields))
  }

  /**
   * Oneofs of this message as an array for iteration.
   * @name Type#oneofsArray
   * @type {OneOf[]}
   * @readonly
   */
  get oneofsArray() {
    return this._oneofsArray || (this._oneofsArray = Object.values(this.oneofs || {}))
  }
}