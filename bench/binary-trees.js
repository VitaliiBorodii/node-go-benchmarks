/* The Computer Language Benchmarks Game
 http://benchmarksgame.alioth.debian.org/
 contributed by Isaac Gouy
 *reset*
 */
const util = require('util');

class TreeNode {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  itemCheck() {
    if (this.left == null) return 1;
    return 1 + this.left.itemCheck() + this.right.itemCheck();
  }
}

const bottomUpTree = (depth) => {
  const arg = depth > 0 ? bottomUpTree(depth - 1) : null;
  return new TreeNode(arg, arg);
};

module.exports = (n = 0) => {
  const start = Date.now();
  const response = [];


  const minDepth = 4;
  const maxDepth = Math.max(minDepth + 2, n);
  const stretchDepth = maxDepth + 1;

  let check = bottomUpTree(stretchDepth).itemCheck();

  response.push(util.format("stretch tree of depth %d\t check: %d\n", stretchDepth, check ));

  const longLivedTree = bottomUpTree(maxDepth);

  for (let depth = minDepth; depth <= maxDepth; depth += 2) {
    const iterations = 1 << (maxDepth - depth + minDepth);

    check = 0;
    for (let i = 1; i <= iterations; i++) {
      check += bottomUpTree(depth).itemCheck();
    }
    response.push(util.format("%d\t trees of depth %d\t check: %d\n", iterations, depth, check));
  }

  response.push(util.format("long lived tree of depth %d\t check: %d\n", maxDepth, longLivedTree.itemCheck()));
  response.push(util.format("Execution took: %d ms\n", Date.now() - start));

  return response;
};
