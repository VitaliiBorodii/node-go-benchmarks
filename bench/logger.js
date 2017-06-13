const fs = require('fs')
const path = require('path')

generateUUID = () => {
  const first = Date.now().toString(16).slice(-4)
  const second = Math.random().toString(16).slice(-8)
  const ff = 'node'
  const fs = first
  const sf = second.slice(0, 4)
  const ss = second.slice(4, 8)
  return `${ff}-${fs}-${sf}-${ss}`
}

const writeFile = (content) => {
  return new Promise((resolve, reject) => {
    const fileName = generateUUID()
    const filePath = path.join(process.cwd(), './logs', `${fileName}.json`)

    fs.writeFile(filePath, content, (err) => {
      if (err) {
        return reject(err)
      }
      resolve(filePath)
    })
  })
}

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

module.exports = (req, res, next) => {
  const t1 = Date.now()
  const requestInfo = [
    `url: ${decodeURI(req.originalUrl)}\n`,
    `method: ${req.method}\n`,
    `argument: ${req.params.arg}\n`,
    `timestamp: ${t1}\n`,
    `user-agent: ${req.headers['user-agent']}\n`
  ]

  writeFile(JSON.stringify(requestInfo))
    .then(filePath => {
      readFile(filePath)
        .then(content => {
          const data = JSON.parse(content)
          data.push(`log: ${filePath}\n`)
          data.push(`Request time: ${Date.now() - t1}\n`)
          res.json(data)
        })
        .catch(next)
    })
    .catch(next)
}
