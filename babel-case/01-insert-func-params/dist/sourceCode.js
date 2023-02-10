console.log("sourceCode.js: (1, 0)", `1`);

function info() {
  console.info("sourceCode.js: (5, 4)", `2`);
}

export default class People {
  say() {
    console.debug("sourceCode.js: (10, 8)", 3);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, console.error("sourceCode.js: (13, 22)", 4));
  }

}