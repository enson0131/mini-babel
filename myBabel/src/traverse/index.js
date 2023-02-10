/**
 * traverse 遍历 AST, 并且遍历过程中支持 visitor 的调用，在 visitor 里实现对 AST 的增删改。
 *
 * 通过深度优先遍历AST，匹配到对应的 visitor（对应可操作的节点），将 path/state 传给 visitor 进行操作
 *
 * 实现 traverse 的思路:
 *     做法: 通过用户传入的 AST 和 配置项，对 AST 进行深度优先遍历，在遍历的过程中，部分节点是数组，需要循环深度遍历的。
 *          因此通过 一个 MAP 去存储，在不断遍历地过程中，获取配置项的enter 和 exit 函数，并调用
 *          判断当前节点类型是否和配置的节点函数一致，一致则执行
 *
 * 实现 path 的思路:
 *     前提: path 可以简单的理解是链表，是在深度优先遍历的过程中，不断地去关联父子path
 *     做法: 在遍历的过程中，创建一个节点 NodePath, 不断地去关联path
 *
 * 实现scope的思路:
 *    前提:   path.scope 记录着整条作用域链，包括声明的变量和对该声明的引用
 *           👉 能生成 scope 的 AST 叫做 block，比如 FunctionDeclaration 就是一个 block
 *           scope 中记录着 bindings, 也就是声明，每个声明会记录在哪儿声明的，哪里引用的
 *    做法:  遇到 block 节点，创建 scope 的时候，遍历作用域中的所有声明(VariableDeclaration、FunctionDeclaration)， 记录该 binding 到 scope 中。
 * https://astexplorer.net/
 */

// 维护一个 map 数据，标识 AST节点中那些属性是可以遍历的
const { visitorKeys } = require("./types/index");
const NodePath = require("./path/NodePath");

/**
 *
 * example:
    traverse(ast, {
        enter: xxx,
        Identifier(node) {
            node.name = 'b';
        },
        exit: xxx,
    });
 * @param {*} node - AST节点
 * @param {*} visitor - 用户自定义的visitor对象
 * @param {*} parent - 父节点 用来记录节点对应的路径
 * @param {*} parentPath - 路径
 * @param {*} key - 当前节点对应到父节点的属性
 * @param {*} listKey - 如果父节点的属性是数组，listKey对应下标
 */
const traverse = function (node, visitor, parent, parentPath, key, listKey) {
  const defination = visitorKeys.get(node.type);

  let visitorFn = visitor && visitor[node.type];
  const path = new NodePath(node, parent, parentPath, key, listKey);

  visitor.enter && visitor.enter(path);

  if (typeof visitorFn === "function") {
    visitorFn(path);
  }

  if (node.__shouldSkip) {
    delete node.__shouldSkip;
    return;
  }

  if (defination && defination.visitor) {
    defination.visitor.forEach((key) => {
      const prop = node[key];
      if (Array.isArray(prop)) {
        prop.forEach((childNode, childIndex) => {
          traverse(childNode, visitor, node, path, key, childIndex);
        });
      } else {
        traverse(prop, visitor, node, path, key);
      }
    });
  }

  visitor.exit && visitor.exit(path);
};

module.exports = traverse;
