const { declare } = require("@babel/helper-plugin-utils");
const importModule = require("@babel/helper-module-imports");
const { NodePath } = require("@babel/traverse");

const autoTrackPlugin = declare((api, options) => {
  api.assertVersion(7); // 设置babel的版本是7

  return {
    visitor: {
      // 整个程序的节点
      Program: {
        // enter 是在遍历当前节点的子节点前调用
        enter(path, state) {
          // 在根结点的 enter 钩子获取声明节点
          path.traverse({
            // @babel/traverse
            // 在获取到声明节点时，通过 traverse - 操作 AST
            ImportDeclaration(curPath) {
              // import 声明的操作 import a from 'a'
              const requirePath = curPath.get("source").node.value;
              if (requirePath === options.trackerPath) {
                const specifier = curPath.get("specifiers.0");
                /// import specifiers有 3 种形式，ImportSpecifier ,ImportNamespaceSpecifier,ImportDefaultSpecifier
                // 获取specifiers类型是否是 命名空间类型，类似 import * as UI from 'xxx-ui' 这种
                if (specifier.isImportSpecifier()) {
                  state.trackerImportId = specifier.toString(); // 记录一下引入的值 例如 import {a} from ‘moduleA’ 👉 a 就是 trackerImportId
                } else if (specifier.isImportNamespaceSpecifier()) {
                  state.trackerImportId = specifier.get("local").toString(); // import * as a from ‘moduleA’ 的场景
                } else if (specifier.isImportDefaultSpecifier()) {
                  state.trackerImportId = specifier.toString(); // import a from ‘moduleA’ 的场景
                }
                // path.stop(); // 重置遍历 fix: 注释掉，避免影响后面函数声明逻辑的执行
              }
            },
          });

          console.log(`state.trackerImportId`, state.trackerImportId);
          if (!state.trackerImportId) {
            // 没有模块则引入模块
            state.trackerImportId = importModule.addDefault(path, "tracker", {
              nameHint: path.scope.generateUid("tracker"), // 通过 generateUid 生产唯一的id
            }).name; // 获取模块名称   import a from 'a';
            state.trackerAST = api.template.statement(
              `${state.trackerImportId}()`
            )(); // https://babeljs.io/docs/en/babel-template
          }
        },
      },
      "ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration"(
        path,
        state
      ) {
        const bodyPath = path.get("body");
        if (bodyPath.isBlockStatement()) {
          bodyPath.node.body.unshift(state.trackerAST);
        } else {
          // () => a; // 针对没有函数体的场景
          const ast = api.template.statement(
            // @babel/template
            `{${state.trackerImportId}(); return PREV_BODY}`
          )({ PREV_BODY: bodyPath.node });
          bodyPath.replaceWith(ast);
        }
      },
    },
  };
});
module.exports = autoTrackPlugin;
