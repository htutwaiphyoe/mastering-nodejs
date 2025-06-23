exports.add = function add(a, b) {
  return a + b;
};

exports.sub = function sub(a, b) {
  return a - b;
};

exports.mul = function mul(a, b) {
  return a * b;
};

exports.div = function div(a, b) {
  return a / b;
};

// Default
module.exports = function () {
  console.log('Hey, I am default');
};

// 1. Named Exports
// 2. Default Exports
