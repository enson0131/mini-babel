const { SourceMapGenerator } = require("source-map");

// Printer 类打印每种 AST 的打印逻辑
class Printer {
  constructor(source, fileName) {
    this.buf = "";
    this.printLine = 1; // 打印第几行
    this.printColumn = 0; // 第几列

    this.sourceMapGenerator = new SourceMapGenerator({
      // 创建一个 SourceMapGenerator 对象
      file: fileName + ".map.json",
    });

    this.fileName = fileName;
    this.sourceMapGenerator.setSourceContent(fileName, source); // sourcemap 需要指定源文件内容
  }
  /**
   * 将源代码转化为 AST 时, 在 AST 中的节点会记录源代码的行/列
   *
   * 通过 ast 打印成目标代码的时候，会记录相对应的 目标代码的行列
   *
   * 这样的话就会有目标代码行列和源代码的行列的映射关系
   * @param {*} node
   * @memberof Printer
   */
  addMapping(node) {
    if (node.loc) {
      // sourcemap 就是由一个个 mapping 组成的，打印每个 AST 节点的时候添加一下 mapping，最终就生成了 sourcemap。
      this.sourceMapGenerator.addMapping({
        generated: {
          // 目标节点和源代码行列的映射
          line: this.printLine,
          column: this.printColumn,
        },
        source: this.fileName,
        original: node.loc && node.loc.start,
      });
    }
  }

  space() {
    this.buf += " ";
    this.printColumn++;
  }

  nextLine() {
    this.buf += "\n";
    this.printLine++;
    this.printColumn = 0;
  }

  Program(node) {
    this.addMapping(node);
    node.body.forEach((item) => {
      this[item.type](item) + ";";
      this.printColumn++;
      this.nextLine();
    });
  }

  ExpressionStatement(node) {
    this.addMapping(node);

    this[node.expression.type](node.expression);
  }

  VariableDeclaration(node) {
    if (!node.declarations.length) {
      return;
    }

    this.addMapping(node);

    this.buf += node.kind; // let/const/var
    this.space();
    node.declarations.forEach((declaration, index) => {
      if (index != 0) {
        this.buf += ",";
        this.printColumn++;
      }
      this[declaration.type](declaration);
    });
    this.buf += ";";
    this.printColumn++;
  }

  VariableDeclarator(node) {
    this.addMapping(node);
    this[node.id.type](node.id); // 标识符
    this.buf += "=";
    this.printColumn++;
    console.log(`node====>`, node);
    this[node.init.type](node.init); // 字面量
  }

  Identifier(node) {
    this.addMapping(node);
    this.buf += node.name;
  }

  FunctionDeclaration(node) {
    this.addMapping(node);

    this.buf += `function ${node.id.name}(${node.params
      .map((item) => item.name)
      .join(",")}){`;
    this.nextLine();
    this[node.body.type](node.body);
    this.buf += "}";
    this.nextLine();
  }

  // 函数调用
  CallExpression(node) {
    this.addMapping(node);
    this[node.callee.type](node.callee);
    this.buf += "(";
    node.arguments.forEach((item, index) => {
      if (index > 0) this.buf += ", ";
      this[item.type](item);
    });
    this.buf += ")";
  }

  // 表达式语句
  ExpressStatement(node) {
    this.addMapping(node);
    this[node.expression.type](node.expression);
  }

  // return 语句
  ReturnStatement(node) {
    this.addMapping(node);
    this.buf += "return ";
    node.argument && this[node.argument.type](node.argument);
  }

  BlockStatement(node) {
    this.addMapping(node);

    node.body.forEach((item) => {
      this.buf += "    ";
      this.printColumn += 4;
      this[item.type](item);
      this.nextLine();
    });
  }

  BinaryExpression(node) {
    this.addMapping(node);
    this[node.left.type](node.left);
    this.buf += node.operator;
    this[node.right.type](node.right);
  }

  NumericLiteral(node) {
    this.addMapping(node);
    this.buf += node.value;
  }

  MemberExpression(node) {
    this.addMapping(node);
    this[node.object.type](node.object);
    this.buf += ".";
    this[node.property.type](node.property);
  }
}

class Generator extends Printer {
  constructor(source, fileName) {
    super(source, fileName);
  }

  generate(node) {
    this[node.type](node); // 疯狂递归

    return {
      code: this.buf,
      map: this.sourceMapGenerator.toString(), // 生成 source-map
    };
  }
}

function generate(node, source, fileName) {
  return new Generator(source, fileName).generate(node);
}

module.exports = generate;
