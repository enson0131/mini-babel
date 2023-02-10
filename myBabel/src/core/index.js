const types = require('@babel/types');
const parser = require('../parser');
const traverse = require('../traverse');
const generate = require('../generator');
const template = require('@babel/template').default;

/**
 * 实现一个 transformSync
 * 注意: 
 *   1 先执行 plugin 后执行 preset
 *   2 plugin 从前往后执行
 *   3 preset 从后往前执行
 * @param {*} code 
 * @param {*} options 
 */
function transformSync(code, options) {
    const ast = parser.parse(code, options.parserOpts); // parser 是通过继承的方式拓展

    const pluginAPI = {
        types,
        template
    }

    const visitors = {};

    options.plugins && options.plugins.forEach(([plugin, options]) => {
        const res = plugin(pluginAPI, options);
        Object.assign(visitors, res.visitor); // 简单合并
    });

    options.presets && options.presets.reverse().forEach(([plugin, options]) => {
        const res = plugin(pluginAPI, options);
        Object.assign(visitors, res.visitor);
    });

    traverse(ast, visitors);

    return generate(ast, code, options.fileName);
}

module.exports = {
    transformSync
}