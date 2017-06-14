// The Computer Language Benchmarks Game
// http://benchmarksgame.alioth.debian.org/
//
// contributed by Ian Osgood
// modified for Node.js by Isaac Gouy

const A = (i, j) => 1 / ((i + j) * (i + j + 1) / 2 + i + 1)

const Au = (u, v) => {
  for (let i = 0; i < u.length; ++i) {
    let t = 0
    for (let j = 0; j < u.length; ++j) {
      t += A(i, j) * u[j]
    }
    v[i] = t
  }
}

const Atu = (u, v) => {
  for (let i = 0; i < u.length; ++i) {
    let t = 0
    for (let j = 0; j < u.length; ++j) {
      t += A(j, i) * u[j]
    }
    v[i] = t
  }
}

const AtAu = (u, v, w) => {
  Au(u, w)
  Atu(w, v)
}

module.exports = (n) => {
  const start = Date.now()
  const response = []

  const u = new Float64Array(n)
  const v = new Float64Array(n)
  const w = new Float64Array(n)
  let vv = 0
  let vBv = 0
  let i

  for (i = 0; i < n; ++i) {
    u[i] = 1
    v[i] = w[i] = 0
  }

  for (i = 0; i < 10; ++i) {
    AtAu(u, v, w)
    AtAu(v, u, w)
  }

  for (i = 0; i < n; ++i) {
    vBv += u[i] * v[i]
    vv += v[i] * v[i]
  }

  response.push(`Result: ${Math.sqrt(vBv / vv).toFixed(9)}\n`)
  response.push(`Execution took: ${Date.now() - start} ms\n`)

  return response
}