export default class Root {
  /**
   * Loads a namespace descriptor into a root namespace.
   * @param {INamespace} json Nameespace descriptor
   * @param {Root} [root] Root namespace, defaults to create a new one if omitted
   * @returns {Root} Root namespace
   */
  static fromJSON(json, root) {
    if (!root) {
      root = new Root()
    }

    if (json.options) {
      root.setOptions(json.options)
    }

    return root.addJSON(json.nested)
  }
}