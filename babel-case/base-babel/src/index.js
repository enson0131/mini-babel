import { pick } from 'lodash';
const d = pick({a: 1, b: 2}, 'a');
console.log(`d===>`, d);
