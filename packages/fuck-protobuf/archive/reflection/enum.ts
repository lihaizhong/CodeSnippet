import { isInteger, isString, toObject } from "../utils";
import Namespace from "./namespace";
import ReflectionObject from "./object";

export default class Enum extends ReflectionObject {
  /**
   * Constructs an enum from an enum descriptor.
   * @param {string} name Enum name
   * @param {IEnum} json Enum descriptor
   * @returns {Enum} Created enum
   * @throws {TypeError} If arguments are invalid
   */
  static fromJSON(name: string, json: any) {
    var enm = new Enum(
      name,
      json.values,
      json.options,
      json.comment,
      json.comments
    );
    enm.reserved = json.reserved;
    return enm;
  }

  /**
   * Resolved values features, if any
   * @type {Object<string, Object<string, *>>|undefined}
   */
  private valuesFeatures: Record<string, Record<string, any>> = {};

  /**
   * Unresolved values features, if any
   * @type {Object<string, Object<string, *>>|undefined}
   */
  private valuesProtoFeatures: Record<string, Record<string, any>> = {};

  /**
   * Enum values by id.
   * @type {Object.<number,string>}
   */
  valuesById: Record<number, string> = {};

  /**
   * Enum values by name.
   * @type {Object.<string,number>}
   */
  values: Record<string, number>;

  /**
   * Enum comment text.
   * @type {string|null}
   */
  comment: string | null;

  /**
   * Value comment texts, if any.
   * @type {Object.<string,string>}
   */
  comments: Record<string, string | null>;

  /**
   * Values options, if any
   * @type {Object<string, Object<string, *>>|undefined}
   */
  valuesOptions?: Record<string, Record<string, any>>;

  /**
   * Reserved ranges, if any.
   * @type {Array.<number[]|string>}
   */
  reserved?: Array<number[] | string>;

  /**
   * Constructs a new enum instance.
   * @classdesc Reflected enum.
   * @extends ReflectionObject
   * @constructor
   * @param {string} name Unique name within its namespace
   * @param {Object.<string,number>} [values] Enum values as an object, by name
   * @param {Object.<string,*>} [options] Declared options
   * @param {string} [comment] The comment for this enum
   * @param {Object.<string,string>} [comments] The value comments for this enum
   * @param {Object.<string,Object<string,*>>|undefined} [valuesOptions] The value options for this enum
   */
  constructor(
    name: string,
    values: Record<string, number>,
    options: Record<string, any>,
    comment: string,
    comments: Record<string, string>,
    valuesOptions?: Record<string, Record<string, any>>
  ) {
    super(name, options);

    if (values && typeof values !== "object") {
      throw TypeError("values must be an object");
    }

    this.values = Object.create(this.valuesById);
    this.comment = comment;
    this.comments = comments || {};
    this.valuesOptions = valuesOptions;

    // Note that values inherit valuesById on their prototype which makes them a TypeScript-
    // compatible enum. This is used by pbts to write actual enum definitions that work for
    // static and reflection code alike instead of emitting generic object definitions.

    if (values) {
      const keys = Object.keys(values);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const value = values[key];
        // use forward entries only
        if (typeof value === "number") {
          this.values[key] = value;
          this.valuesById[value] = key;
        }
      }
    }
  }

  /**
   * Resolves value features
   * @returns {Enum} `this`
   */
  resolve() {
    super.resolve();

    for (var key of Object.keys(this.valuesProtoFeatures || {})) {
      this.valuesFeatures[key] = {
        ...this.features,
        ...this.valuesProtoFeatures[key],
      };
    }

    return this;
  }

  /**
   * Converts this enum to an enum descriptor.
   * @param {IToJSONOptions} [toJSONOptions] JSON conversion options
   * @returns {IEnum} Enum descriptor
   */
  toJSON(toJSONOptions: any) {
    var keepComments = toJSONOptions
      ? Boolean(toJSONOptions.keepComments)
      : false;
    return toObject([
      "options",
      this.options,
      "valuesOptions",
      this.valuesOptions,
      "values",
      this.values,
      "reserved",
      this.reserved && this.reserved.length ? this.reserved : undefined,
      "comment",
      keepComments ? this.comment : undefined,
      "comments",
      keepComments ? this.comments : undefined,
    ]);
  }

  /**
   * Adds a value to this enum.
   * @param {string} name Value name
   * @param {number} id Value id
   * @param {string} [comment] Comment, if any
   * @param {Object.<string, *>|undefined} [options] Options, if any
   * @returns {Enum} `this`
   * @throws {TypeError} If arguments are invalid
   * @throws {Error} If there is already a value with this name or id
   */
  add(
    name: string,
    id: number,
    comment: string,
    options?: Record<string, any>
  ) {
    if (!isString(name)) {
      throw TypeError("name must be a string");
    }

    if (!isInteger(id)) {
      throw TypeError("id must be an integer");
    }

    if (this.values[name] !== undefined) {
      throw Error("duplicate name '" + name + "' in " + this);
    }

    if (this.isReservedId(id)) {
      throw Error("id '" + id + "' is reserved in " + this);
    }

    if (this.isReservedName(name)) {
      throw Error("name '" + name + "' is reserved in " + this);
    }

    if (this.valuesById[id] !== undefined) {
      if (!(this.options && this.options.allow_alias)) {
        throw Error("duplicate id " + id + " in " + this);
      }

      this.values[name] = id;
    } else {
      this.valuesById[this.values[name]] = name;
    }

    if (options) {
      if (this.valuesOptions === undefined) {
        this.valuesOptions = {};
      }

      this.valuesOptions[name] = options || null;
      for (let key of Object.keys(this.valuesOptions)) {
        const features = Array.isArray(this.valuesOptions[key])
          ? this.valuesOptions[key].find((x) => Object.hasOwn(x, "features"))
          : (this.valuesOptions[key] as unknown as string) === "features";
        if (features) {
          this.valuesProtoFeatures[key] = features.features;
        } else {
          this.valuesProtoFeatures[key] = {};
        }
      }
    }

    for (var enumValue of Object.keys(this.values)) {
      if (!this.valuesProtoFeatures[enumValue]) {
        this.valuesProtoFeatures[enumValue] = {};
      }
    }

    this.comments[name] = comment || null;

    return this;
  }

  /**
   * Removes a value from this enum
   * @param {string} name Value name
   * @returns {Enum} `this`
   * @throws {TypeError} If arguments are invalid
   * @throws {Error} If `name` is not a name of this enum
   */
  remove(name: string) {
    if (!isString(name)) {
      throw TypeError("name must be a string");
    }

    const val = this.values[name];
    if (val == null) {
      throw Error("name '" + name + "' does not exist in " + this);
    }

    delete this.valuesById[val];
    delete this.values[name];
    delete this.comments[name];
    if (this.valuesOptions) {
      delete this.valuesOptions[name];
    }

    return this;
  }

  /**
   * Tests if the specified id is reserved.
   * @param {number} id Id to test
   * @returns {boolean} `true` if reserved, otherwise `false`
   */
  isReservedId(id: number) {
    return Namespace.isReservedId(this.reserved, id);
  }

  /**
   * Tests if the specified name is reserved.
   * @param {string} name Name to test
   * @returns {boolean} `true` if reserved, otherwise `false`
   */
  isReservedName(name: string) {
    return Namespace.isReservedName(this.reserved, name);
  }
}
