const { basename } = require("path");

const targetCalleeName = ["log", "info", "error", "debug"].map(
  (item) => `console.${item}`
);

// 这里的 types 就是 babel/types, template 就是 babel/template
const parametersInsertPlugin = ({ types, template }) => {
  return {
    visitor: {
      // 类似于 traverse
      CallExpression(path, state) {
        if (path.node.isParametersInsertNew) return;

        const calleeName = path.get("callee").toString();
        if (targetCalleeName.includes(calleeName)) {
          path.node.isParametersInsertNew = true; // 避免多次编译，重复插入
          const { line, column } = path.node.loc.start;
          const filename =
            basename(state.file.opts.filename) || "unkown filename";
          path.node.arguments.unshift(
            types.stringLiteral(`${filename}: (${line}, ${column})`)
          );
        }
      },
    },
  };
};

module.exports = parametersInsertPlugin;
