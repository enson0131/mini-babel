"use strict";

var _pick2 = _interopRequireDefault(require("lodash/pick"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var d = (0, _pick2["default"])({
  a: 1,
  b: 2
}, 'a');
console.log("d===>", d);