
let obj = { a: 1 };
const niter = 20;

let before,
  res,
  took;

for (let i = 0; i < niter; i++) {
  obj = { obj1: obj, obj2: obj }; // Doubles in size each iter
}

before = process.hrtime();
res = JSON.stringify(obj);
took = process.hrtime(before);
console.log(`JSON.stringify took ${took}`);

before = process.hrtime();
const res1 = res.indexOf('nomatch');
took = process.hrtime(before);
console.log(`Pure indexof took ${took}`);

before = process.hrtime();
res = JSON.parse(res);
took = process.hrtime(before);
console.log(`JSON.parse took ${took}`);
