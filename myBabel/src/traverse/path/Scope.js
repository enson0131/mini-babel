// scope 中记录着 binding, 也就是声明，每个声明会记录在哪儿声明的，哪里引用的
class Binding {
  constructor(id, path) {
    this.id = id;
    this.path = path;
    this.referenced = false; // 判断该声明是否有被引用，并在哪儿被引用
    this.referencePaths = [];
  }
}

// Scope 代表作用域，作用域内会有多个声明和引用全部存储在 binding 中
class Scope {
  constructor(parentScope, path) {
    this.parent = parentScope;
    this.binding = {};
    this.path = path;

    // 注册 binding 设置作用域
    path.traverse({
      VariableDeclarator: (childPath) => {
        this.registerBinding(childPath.node.id.name, childPath);
      },
      FunctionDeclaration: (childPath) => {
        this.registerBinding(childPath.node.id.name, childPath);
        childPath.skip();
      },
    });

    path.traverse({
      Identifier: (childPath) => {
        if (!childPath.findParent((p) => p.isVariableDeclarator())) {
          const id = childPath.node.name;
          const bindings = this.getBinding(id);
          if (bindings) {
            // 找到了对应的作用域
            bindings.referenced = true; // 该声明有被引用
            bindings.referencePaths.push(childPath); // 引用的路径
          }
        }
      },
    });
  }

  // 添加声明: 👉 当遇到新的块级作用域时添加声明存储遍历
  registerBinding(id, path) {
    this.binding[id] = new Binding(id, path);
  }

  getOwnBinding(id) {
    return this.binding[id];
  }

  getBinding(id) {
    let res = this.getOwnBinding(id);
    if (res === undefined && this.parent) {
      res = this.parent.getOwnBinding(id);
    }
    return res;
  }
  hasBinding(id) {
    return !!this.getBinding(id);
  }
}

module.exports = Scope;
