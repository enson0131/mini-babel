const parser = require("../src/parser");
const traverse = require("../src/traverse");
const generate = require("../src/generator");
const fs = require("fs-extra");
const path = require("path");

const sourceCode = fs.readFileSync(
  path.join(__dirname, "../sourceCode/index.js"),
  {
    encoding: "utf-8",
  }
);

const ast = parser.parse(sourceCode, {
  plugins: ["literal"], // 通过传入的 plugins 决定使用什么插件
});

fs.outputJSON(path.join(__dirname, "../build/build.json"), ast);

traverse(ast, {
  Program(path) {
    Object.entries(path.scope.binding).forEach(([id, binding]) => {
      // 目前只对标识符进行 treeSharking
      if (!binding.referenced) {
        binding.path.remove(); // 实现 treeSharking
      }
    });
  },
});

const { code, map } = generate(ast, sourceCode, "test.js");

fs.outputFile(path.join(__dirname, "../build/test.min.js"), code);
fs.outputFile(path.join(__dirname, "../build/test.map.json"), map);
