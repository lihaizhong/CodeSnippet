import { isObject, isString, setProperty } from "../../src/utils";
import Namespace from "./namespace";
import OneOf from "./oneof";
import Root from "./root";

const editions2023Defaults = {
  enum_type: "OPEN",
  field_presence: "EXPLICIT",
  json_format: "ALLOW",
  message_encoding: "LENGTH_PREFIXED",
  repeated_field_encoding: "PACKED",
  utf8_validation: "VERIFY",
};
const proto2Defaults = {
  enum_type: "CLOSED",
  field_presence: "EXPLICIT",
  json_format: "LEGACY_BEST_EFFORT",
  message_encoding: "LENGTH_PREFIXED",
  repeated_field_encoding: "EXPANDED",
  utf8_validation: "NONE",
};
const proto3Defaults = {
  enum_type: "OPEN",
  field_presence: "IMPLICIT",
  json_format: "ALLOW",
  message_encoding: "LENGTH_PREFIXED",
  repeated_field_encoding: "PACKED",
  utf8_validation: "VERIFY",
};

export default class ReflectionObject {
  /**
   * Resolved Features.
   */
  protected features: any = {};
  /**
   * Unresolved Features.
   */
  protected protoFeatures: any = null;
  /**
   * OneOf this field belongs to, if any,
   * @type {OneOf|null}
   */
  protected partOf: OneOf | null = null;
  /**
   * Options.
   * @type {Object.<string,*>|undefined}
   */
  options?: Record<string, any>;
  /**
   * Parsed Options.
   * @type {Array.<Object.<string,*>>|undefined}
   */
  parsedOptions?: Record<string, any>[];
  /**
   * Unique name within its namespace.
   * @type {string}
   */
  name: string;
  /**
   * Parent namespace.
   * @type {Namespace|null}
   */
  parent: Namespace | null = null;
  /**
   * Whether already resolved or not.
   * @type {boolean}
   */
  resolved: boolean = false;
  /**
   * Comment text, if any.
   * @type {string|null}
   */
  comment: string | null = null;
  /**
   * Defining file name.
   * @type {string|null}
   */
  filename: string | null = null;

  /**
   * Constructs a new reflection object instance.
   * @classdesc Base class of all reflection objects.
   * @constructor
   * @param {string} name Object name
   * @param {Object.<string,*>} [options] Declared options
   * @abstract
   */
  constructor(name: string, options: Record<string, any>) {
    if (isString(name)) {
      throw TypeError("name must be a string");
    }

    if (options && !isObject(options)) {
      throw TypeError("options must be an object");
    }

    this.name = name;
    this.options = options;
  }

  /**
   * Reference to the root namespace.
   * @name ReflectionObject#root
   * @type {Root}
   * @readonly
   */
  get root() {
    let ptr: ReflectionObject = this;

    while (ptr.parent) {
      ptr = ptr.parent;
    }

    return ptr;
  }

  get fullName() {
    const path = [this.name];
    let ptr = this.parent;

    while (ptr) {
      path.unshift(ptr.name);
      ptr = ptr.parent;
    }

    return path.join(",");
  }

  private resolveFeatures() {
    let defaults = {};

    if (this instanceof Root) {
      if (this.root.getOption("syntax") === "proto3") {
        defaults = { ...proto3Defaults };
      } else if (this.root.getOption("edition") === "2023") {
        defaults = { ...editions2023Defaults };
      } else {
        defaults = { ...proto2Defaults };
      }
    }

    if (this instanceof Root) {
      this.features = Object.assign(defaults, this.protoFeatures || {});
      // fields in Oneofs aren't actually children of them, so we have to
      // special-case it
    } else if (this.partOf instanceof OneOf) {
      this.features = Object.assign(
        {},
        this.partOf.features,
        this.protoFeatures || {}
      );
    } else if (this.parent) {
      this.features = Object.assign(
        {},
        this.parent.features,
        this.protoFeatures || {}
      );
    } else {
      this.features = { ...this.protoFeatures };
    }
  }

  /**
   * Converts this reflection object to its descriptor representation.
   * @returns {Object.<string,*>} Descriptor
   * @abstract
   */
  // toJSON() {
  //   // not implemented, shouldn't happen
  //   throw Error()
  // }

  /**
   * Called when this object is added to a parent.
   * @param {ReflectionObject} parent Parent added to
   * @returns {undefined}
   */
  onAdd(parent: Namespace) {
    if (this.parent && this.parent !== parent) {
      this.parent.remove(this);
    }

    const root = parent.root;
    this.parent = parent;
    this.resolved = false;

    if (root instanceof Root) {
      root.handleAdd(this);
    }
  }

  /**
   * Called when this object is removed from a parent.
   * @param {ReflectionObject} parent Parent removed from
   * @returns {undefined}
   */
  onRemove(parent: ReflectionObject) {
    const root = parent.root;

    if (root instanceof Root) {
      root.handleRemove(this);
    }

    this.parent = null;
    this.resolved = false;
  }

  /**
   * Resolves this objects type references.
   * @returns {ReflectionObject} `this`
   */
  resolve() {
    if (this.resolved) {
      return this;
    }

    if (this instanceof Root || this.parent?.resolved) {
      this.resolveFeatures();
      this.resolved = true;
    }

    return this;
  }

  /**
   * Gets an option value.
   * @param {string} name Option name
   * @returns {*} Option value or `undefined` if not set
   */
  getOption(name: string) {
    if (this.options) {
      return this.options[name];
    }

    return undefined;
  }

  /**
   * Sets an option.
   * @param {string} name Option name
   * @param {*} value Option value
   * @param {boolean} [ifNotSet] Sets the option only if it isn't currently set
   * @returns {ReflectionObject} `this`
   */
  setOption(name: string, value: any, ifNotSet: boolean) {
    if (!ifNotSet || !this.options || this.options[name] === undefined) {
      (this.options || (this.options = {}))[name] = value;
    }

    return this;
  }

  /**
   * Sets a parsed option.
   * @param {string} name parsed Option name
   * @param {*} value Option value
   * @param {string} propName dot '.' delimited full path of property within the option to set. if undefined\empty, will add a new option with that value
   * @returns {ReflectionObject} `this`
   */
  setParsedOption(name: string, value: any, propName: string) {
    if (!this.parsedOptions) {
      this.parsedOptions = [];
    }
    const isFeature = /^features$/.test(name);

    if (propName) {
      // If setting a sub property of an option then try to merge it
      // with an existing option
      const opt = this.parsedOptions.find((opt) => Object.hasOwn(opt, name));

      if (opt) {
        // If we found an existing option - just merge the property value
        // (If it's a feature, will just write over)
        setProperty(opt[name], propName, value);
      } else {
        // otherwise, create a new option, set its property and add it to the list
        this.parsedOptions.push({ [name]: setProperty({}, propName, value) });
      }
    } else {
      // Always create a new option when setting the value of the option itself
      this.parsedOptions.push({ [name]: value });
    }

    if (isFeature) {
      this.protoFeatures =
        this.parsedOptions.find((x) => Object.hasOwn(x, "features"))
          ?.features || {};
    }

    return this;
  }

  /**
   * Sets multiple options.
   * @param {Object.<string,*>} options Options to set
   * @param {boolean} [ifNotSet] Sets an option only if it isn't currently set
   * @returns {ReflectionObject} `this`
   */
  setOptions(options: Record<string, any>, ifNotSet: boolean) {
    if (options) {
      const keys = Object.keys(options);
      for (let i = 0; i < keys.length; ++i) {
        this.setOption(keys[i], options[keys[i]], ifNotSet);
      }
    }

    return this;
  }

  toString() {
    const className = "ReflectionObject";
    const fullName = this.fullName;

    if (fullName.length) {
      return className + " " + fullName;
    }

    return className;
  }
}
