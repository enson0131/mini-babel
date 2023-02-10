/**
 * 添加 Number 和 String 类型的标识符
 * https://astexplorer.net/
 * @param {*} Parser
 * @returns
 */
module.exports = function (Parser) {
  return class extends Parser {
    parseLiteral(...args) {
      const node = super.parseLiteral(...args);
      const type = typeof node.value;
      switch (type) {
        case "number":
          node.type = "NumericLiteral";
          break;
        case "string":
          node.type = "StringLiteral";
          break;
      }
      return node;
    }
  };
};
