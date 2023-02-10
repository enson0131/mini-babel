/**
 * visitor 表示可以继续遍历的节点
 * isBlock 表示会生成作用域的节点
 */
const astDefinationsMap = new Map([ 
    ['Program', {visitor: ['body'], isBlock: true}],
    ['VariableDeclaration', {visitor: ['declarations']}],
    ['VariableDeclarator', {visitor: ['id', 'init']}],
    ['Identifier', {}],
    ['NumericLiteral', {}],
    ['FunctionDeclaration', {visitor: ['id', 'params', 'body'], isBlock: true}],
    ['BlockStatement', {visitor: ['body']}],
    ['ReturnStatement', {visitor: ['argument']}],
    ['BinaryExpression', {visitor: ['left', 'right']}],
    ['ExpressionStatement', {visitor: ['expression']}],
    ['CallExpression', {visitor: ['callee', 'arguments']}]
]); // 存放 AST 可以遍历的属性

const validations = {};

for (let name of astDefinationsMap.keys()) {
    validations['is' + name] = function(node) {
        return node.type === name;
    }
}

module.exports = {
    visitorKeys: astDefinationsMap,
    ...validations
}