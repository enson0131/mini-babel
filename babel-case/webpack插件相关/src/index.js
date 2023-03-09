// 主要验证 lodash-webpack-plugin
// 相关链接 https://github.com/lodash/lodash-webpack-plugin
import { clamp } from 'lodash';

/**
 * clamp函数，包含number（需要判断的值）upper（上边界）lower（下边界）三个参数。如果number超出上边界或下边界，会返回距离number差值最小的边界值。如果包含在两个边界值中，则返回number
 */
console.log(`a====>`, clamp(10, 5, 20)); // 10
console.log(`b====>`, clamp('123', '5', '20')); // 20

console.log(`c====>`, clamp('123', '1', '20')); // 20
console.log(`d====>`, clamp(123, 1, 20)); // 20