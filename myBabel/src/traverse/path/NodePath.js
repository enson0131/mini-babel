const types = require("../types");
const Scope = require("./Scope");

/**
 * 每个节点对应的 path
 */
module.exports = class NodePath {
  constructor(node, parent, parentPath, key, listKey) {
    this.node = node;
    this.parent = parent; // node 父节点
    this.parentPath = parentPath; // NodePath 父节点对应的 nodePath
    this.key = key; // 节点对应的属性
    this.listKey = listKey; // 节点对应的下标

    Object.keys(types).forEach((key) => {
      // 给 NodePath 绑定 节点类型的判断函数
      if (key.startsWith("is")) {
        this[key] = types[key].bind(this, node);
      }
    });
  }

  // 需要用到的时候采取获取 scope
  get scope() {
    if (this._scope) {
      return this._scope;
    }

    const isBlock = this.isBlock();
    const parentScope = this.parentPath && this.parentPath.scope;
    // 如果是新生成的作用域, 则用新的，否则沿用上一层的作用域
    this._scope = isBlock ? new Scope(parentScope, this) : parentScope;
    return this._scope;
  }

  replaceWith(node) {
    if (this.listKey !== undefined) {
      this.parent[this.key].splice(this.listKey, 1, node);
    } else {
      this.parent[this.key] = node;
    }
  }
  remove() {
    if (this.listKey !== undefined) {
      this.parent[this.key].splice(this.listKey, 1);
    } else {
      this.parent[this.key] = null;
    }
  }
  findParent(callback) {
    let curPath = this.parentPath;
    while (curPath && !callback(curPath)) {
      curPath = curPath.parentPath;
    }
    return curPath;
  }
  find(callback) {
    let curPath = this;
    while (curPath && !callback(curPath)) {
      curPath = curPath.parentPath;
    }
    return curPath;
  }
  skip() {
    this.node._shouldSkip = true; // 给节点设置字段，如有标记则跳过子节点遍历
  }
  traverse(visitor) {
    const traverse = require("../index");
    const defination = types.visitorKeys.get(this.node.type); // 判断

    if (defination.visitor) {
      defination.visitor.forEach((key) => {
        const prop = this.node[key];
        if (Array.isArray(prop)) {
          // 例如参数名有可能是一个数组
          prop.forEach((childNode, childIndex) => {
            traverse(childNode, visitor, this.node, this, key, childIndex);
          });
        } else {
          traverse(prop, visitor, this.node, this, key);
        }
      });
    }
  }
  /**
   * 判断是否是能生成作用域的节点
   */
  isBlock() {
    return types.visitorKeys.get(this.node.type)?.isBlock;
  }
};
