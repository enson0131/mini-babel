/**
 * babel 的 parser 是基于 acorn 进行拓展的， 例如 Literal 拓展成 StringLiteral、NumberLiteral 等。
 * 同时实现了 jsx、typescript、flow 等语法插件的拓展
 */
const acorn = require("acorn");

const syntaxPlugins = {
  literal: require("./plugins/literal"),
  cvteKeyword: require("./plugins/cvteKeyword"),
};

const defaultOptions = {};

/**
 * babel 中的 parser 通过继承的方式去拓展插件
 * @param {*} code
 * @param {*} options
 * @returns
 */
function parse(code, options) {
  const resolvedOptions = Object.assign({}, defaultOptions, options);
  const newParser =
    (resolvedOptions.plugins &&
      resolvedOptions.plugins.reduce((Parser, pluginName) => {
        let plugin = syntaxPlugins[pluginName];
        return plugin ? Parser.extend(plugin) : plugin; // Parser.extend 内部会调用 plugin 方法并传入 Parser
      }, acorn.Parser)) ||
    acorn.Parser;

  return newParser.parse(code, {
    locations: true, // 保留 AST 源码中的位置信息，生成 sourcemap 的时候会用 （源码位置信息会存储在 loc 属性上）
  });
}

module.exports = {
  parse,
};
