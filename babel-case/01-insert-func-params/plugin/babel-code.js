const parser = require("@babel/parser"); // parse 阶段使用
const traverse = require("@babel/traverse").default; // traverse 阶段使用
const generate = require("@babel/generator").default; // generator 阶段使用
const types = require("@babel/types"); // 工具方法

const sourceCode = `
    console.log(1);

    function info() {
        console.info(2);
    }

    export default class People {
        say () {
            console.debug(3);
        }
        render () {
            return <div>{console.error(4)}</div>
        }
    }
`;

// 将源代码转化成 AST 🌲
const ast = parser.parse(sourceCode, {
  sourceType: "unambiguous", // 以什么方式进行解析 unambiguous - 不区分module还是script
  plugins: ["jsx"],
});

// console.log(ast);
const targetCalleeName = ["log", "info", "error", "debug"].map(
  (item) => `console.${item}`
);
// traverse(ast, {
//     CallExpression(path, state) {
//         if (types.isMemberExpression(path.node.callee)  // callee 是一个 MemberExpression 表达式
//             && path.node.callee.object.name === 'console'
//             && ['log', 'info', 'error', 'debug'].includes(path.node.callee.property.name)) {
//                 const { line, column } = path.node.loc.start;
//                 path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`));
//             }
//     }
// })
// https://astexplorer.net/
traverse(ast, {
  // visitor
  CallExpression(path, state) {
    // const calleeName = generate(path.node.callee).code;
    const calleeName = path.get("callee").toString(); // arguments.callee 会指向函数本身
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      path.node.arguments.unshift(
        types.stringLiteral(`filename: (${line}, ${column})`) // 如果是多个 AST 节点的话建议使用 @babel/template
      );
    }
  },
});

const { code } = generate(ast);
console.log(code);
