import { IField } from "./field";

/** Extension map field descriptor. */
export interface IExtensionMapField extends IMapField {

  /** Extended type */
  extend: string;
}

/** Map field descriptor. */
export interface IMapField extends IField {

  /** Key type */
  keyType: string;
}
