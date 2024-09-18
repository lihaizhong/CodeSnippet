/** Field descriptor. */
export interface IField {

  /** Field rule */
  rule?: string;

  /** Field type */
  type: string;

  /** Field id */
  id: number;

  /** Field options */
  options?: { [k: string]: any };
}

/** Extension field descriptor. */
export interface IExtensionField extends IField {

  /** Extended type */
  extend: string;
}
