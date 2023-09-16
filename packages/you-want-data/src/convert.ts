import dayjs from "dayjs"

/**
 * 数据类型解析器
 * 根据不同的类型，试图根据指定类型转换数据
 * @constructor
 * @param value 已知的值
 * @param defaultValue 默认的值
 */
export class Convertor {
  private value: any

  private defaultValue: any

  static isObject(value: any) {
    return Object.prototype.toString.call(value) === '[Object object]'
  }

  static isVoid(value: any) {
    if (value === '' || value === null || value === undefined) {
      return true
    }

    if (Array.isArray(value) && value.length === 0) {
      return true
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true
    }

    return false
  }

  static getDefaultValue(placeholderValue: any, defaultValue?: any) {
    if (typeof defaultValue === 'undefined') {
      return placeholderValue
    }

    return defaultValue
  }

  constructor(value: any, defaultValue?: any) {
    this.value = value
    this.defaultValue = defaultValue
  }

  toRaw() {
    return this.value
  }

  toString() {
    if (typeof this.value === 'string') {
      return this.value
    }

    if (
      typeof this.value === 'number'
      || typeof this.value === 'boolean'
      || typeof this.value === 'bigint'
    ) {
      return this.value.toString()
    }

    if (!Convertor.isVoid(this.value)) {
      return JSON.stringify(this.value)
    }

    return Convertor.getDefaultValue('', this.defaultValue)
  }

  toNumber() {
    if (typeof this.value === 'number' || typeof this.value === 'bigint') {
      return this.value
    }

    if (typeof this.value === 'boolean') {
      return +this.value
    }

    if (typeof this.value === 'string' && !Number.isNaN(+this.value)) {
      return +this.value
    }

    return Convertor.getDefaultValue(0, this.defaultValue)
  }

  toBoolean() {
    if (typeof this.value === 'boolean') {
      return this.value
    }

    if (typeof this.value === 'number') {
      return Boolean(this.value)
    }

    return Convertor.getDefaultValue(false, this.defaultValue)
  }

  toDate(format?: string) {
    const inst = dayjs(this.value as string)

    if (inst.isValid()) {
      return inst.format(format)
    }

    return Convertor.getDefaultValue(null, this.defaultValue)
  }

  toArray() {
    if (Array.isArray(this.value)) {
      return this.value
    }

    if (typeof this.value === 'string' && this.value !== '') {
      try {
        const value = JSON.parse(this.value)

        if (Array.isArray(value)) {
          return value
        }
      } catch {
        return []
      }
    }

    return Convertor.getDefaultValue([], this.defaultValue)
  }

  toObject() {
    if (Convertor.isObject(this.value)) {
      return this.value
    }

    if (typeof this.value === 'string') {
      try {
        const value = JSON.parse(this.value)

        if (Convertor.isObject(value)) {
          return value
        }
      } catch {
        return {}
      }
    }

    return Convertor.getDefaultValue({}, this.defaultValue)
  }
}
