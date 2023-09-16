import ReflectionObject from "./object";

export default class Namespace extends ReflectionObject {
  static isReservedId(
    reserved: Array<number[] | string> | undefined,
    id: number
  ) {
    if (reserved) {
      for (let i = 0; i < reserved.length; ++i) {
        if (
          typeof reserved[i] !== "string" &&
          (reserved[i][0] as number) <= id &&
          (reserved[i][1] as number) > id
        ) {
          return true;
        }
      }
    }

    return false;
  }

  static isReservedName(
    reserved: Array<number[] | string> | undefined,
    name: string
  ) {
    if (reserved) {
      for (let i = 0; i < reserved.length; ++i) {
        if (reserved[i] === name) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Cached nested objects as an array.
   * @type {ReflectionObject[]|null}
   * @private
   */
  private nestedArray: ReflectionObject[] | null = null

  /**
   * Nested objects by name.
   * @type {Object.<string,ReflectionObject>|undefined}
   */
  nested?: Record<string,ReflectionObject>

  remove(parent: ReflectionObject) {}
}
