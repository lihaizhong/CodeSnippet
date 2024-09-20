/** Enum descriptor. */
export interface IEnum {

  /** Enum values */
  values: { [k: string]: number };

  /** Enum options */
  options?: { [k: string]: any };
}