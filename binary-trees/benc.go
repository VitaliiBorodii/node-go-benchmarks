/* The Computer Language Benchmarks Game
 * http://benchmarksgame.alioth.debian.org/
 *
 * based on Go program by The Go Authors.
 * based on C program by Kevin Carson
 * flag.Arg hack by Isaac Gouy
 * modified by Jamil Djadala to use goroutines
 * modified by Chai Shushan
 * *reset*
 *
 */

package benc

import (
	"fmt"
	"sync"
	"time"
)

var minDepth = 4

func Benc(n int) (response []string) {
	var start = time.Now()
	maxDepth := n
	if minDepth+2 > n {
		maxDepth = minDepth + 2
	}
	stretchDepth := maxDepth + 1

	check_l := bottomUpTree(stretchDepth).ItemCheck()
	response = append(response, fmt.Sprintf("stretch tree of depth %d\t check: %d\n", stretchDepth, check_l))

	longLivedTree := bottomUpTree(maxDepth)

	result_trees := make([]int, maxDepth+1)
	result_check := make([]int, maxDepth+1)

	var wg sync.WaitGroup
	for depth_l := minDepth; depth_l <= maxDepth; depth_l += 2 {
		wg.Add(1)
		go func(depth int) {
			iterations := 1 << uint(maxDepth-depth+minDepth)
			check := 0

			for i := 1; i <= iterations; i++ {
				check += bottomUpTree(depth).ItemCheck()
			}
			result_trees[depth] = iterations
			result_check[depth] = check

			wg.Done()
		}(depth_l)
	}
	wg.Wait()

	for depth := minDepth; depth <= maxDepth; depth += 2 {
		response = append(response, fmt.Sprintf("%d\t trees of depth %d\t check: %d\n",
			result_trees[depth], depth, result_check[depth],
		))
	}
	response = append(response, fmt.Sprintf("long lived tree of depth %d\t check: %d\n",
		maxDepth, longLivedTree.ItemCheck(),
	))

	response = append(response, fmt.Sprintf("Execution took: %d ms\n", time.Since(start)/time.Millisecond))
	return response
}

func bottomUpTree(depth int) *Node {
	if depth <= 0 {
		return &Node{nil, nil}
	}
	return &Node{
		bottomUpTree(depth - 1),
		bottomUpTree(depth - 1),
	}
}

type Node struct {
	left, right *Node
}

func (self *Node) ItemCheck() int {
	if self.left == nil {
		return 1
	}
	return 1 + self.left.ItemCheck() + self.right.ItemCheck()
}
