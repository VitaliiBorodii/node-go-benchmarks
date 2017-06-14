/* The Computer Language Benchmarks Game
 http://benchmarksgame.alioth.debian.org/
 contributed by Isaac Gouy
 *reset*
 */

class TreeNode {
  constructor(left, right) {
    this.left = left
    this.right = right
  }

  itemCheck() {
    if (this.left == null) return 1
    return 1 + this.left.itemCheck() + this.right.itemCheck()
  }
}

const bottomUpTree = (depth) => {
  const arg = depth > 0 ? bottomUpTree(depth - 1) : null
  return new TreeNode(arg, arg)
}

module.exports = (n = 0) => {
  const start = Date.now()
  const response = []


  const minDepth = 4
  const maxDepth = Math.max(minDepth + 2, n)
  const stretchDepth = maxDepth + 1

  let check = bottomUpTree(stretchDepth).itemCheck()

  response.push(`stretch tree of depth ${stretchDepth}\t check: ${check}\n`)

  const longLivedTree = bottomUpTree(maxDepth)

  for (let depth = minDepth; depth <= maxDepth; depth += 2) {
    const iterations = 1 << (maxDepth - depth + minDepth)

    check = 0
    for (let i = 1; i <= iterations; i++) {
      check += bottomUpTree(depth).itemCheck()
    }
    response.push(`${iterations}\t trees of depth ${depth}\t check: ${check}\n`)
  }

  response.push(`long lived tree of depth ${maxDepth}\t check: ${longLivedTree.itemCheck()}\n`)
  response.push(`Execution took: ${Date.now() - start} ms\n`)

  return response
}
