const acorn = require('acorn');
const Parser = acorn.Parser;
const tt = acorn.tokTypes;
const TokenType = acorn.TokenType;

Parser.acorn.keywordTypes["cvte"] = new TokenType("cvte", { keyword: "cvte"});

module.exports = function(Parser) {
    return class extends Parser {
      parse(program) {
        // 关键字
        let newKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this const class extends export import super";
        newKeywords += " cvte";
        this.keywords = new RegExp("^(?:" + newKeywords.replace(/ /g, "|") + ")$")
        return(super.parse(program));
      }
  
      parseStatement(context, topLevel, exports) {
        var starttype = this.type;
  
        if (starttype == Parser.acorn.keywordTypes["cvte"]) {
          var node = this.startNode();
          return this.parseCvteStatement(node);
        } else {
          return(super.parseStatement(context, topLevel, exports));
        }
      }
  
      parseCvteStatement(node) {
        this.next();
        return this.finishNode({value: 'cvte'}, 'CvteStatement');
      };
    }
  }