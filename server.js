const http = require('http')
const util = require('util')
const cluster = require('cluster')
const path = require('path')
const fs = require('fs')
const os = require('os')
const express = require('express')

const binaryTrees = require('./bench/binary-trees')
const Logger = require('./bench/logger')

const endpoints = require('./benchmarks.json')
const app = express()

const BENCH = "/bench/"

const serveFile = (fileName, req, res) => fs.createReadStream(path.join(__dirname, './public/', fileName)).pipe(res)
const serveIndex = serveFile.bind(null, 'index.html')
const serveJS = serveFile.bind(null, 'main.js')
const serveCSS = serveFile.bind(null, 'main.css')

const loggerHandler = (req, res, next) => {
  Logger({
    url: req.baseUrl + req.url,
    method: req.method,
    argument: req.params.arg,
    userAgent: req.headers['user-agent']
  })
    .then(data => {
      res.json(data)
    })
    .catch(next)
}

const binaryTreesHandler = (req, res, next) => {

  const arg = req.params.arg
  const n = parseInt(arg)

  if (isNaN(n) || (n.toString() !== arg)) {
    return next({
      status: 400,
      message: util.format('Bad Request: `%s` is not a number', arg)
    })
  }

  if (n > 25) {
    return next({
      status: 400,
      message: util.format('Bad Request: `argument` must be lower or equal then 25 (got %d)', n)
    })
  }

  res.status(200).json(binaryTrees(n))
};

const routesHandler = (req, res) => {

  let response = '<pre>'

  Object.keys(endpoints).forEach(key => {
    const link = endpoints[key]
    response += `<a href="${link}">${link}</a></br>`
  });

  response += '</pre>'

  res.status(200).send(response)
};

const staticRouter = express.Router()
const benchRouter = express.Router()

staticRouter.get('/', routesHandler)
staticRouter.get('*.js', serveJS)
staticRouter.get('*.css', serveCSS)

Object.keys(endpoints).forEach((key) => {
  const url = endpoints[key]
  staticRouter.get(url, serveIndex)
})

benchRouter.get(`${endpoints.BINARY_TREES}:arg`, binaryTreesHandler)
benchRouter.get(`${endpoints.LOGGER}:arg`, loggerHandler)


app.use('/', staticRouter)
app.use(BENCH, benchRouter)


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next({
    status: 404,
    message: 'Not Found'
  })
})

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(err.status || 500)
    .send(err.message)
})

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork()
  }
  console.log("Server is listening at http://localhost:8002")

} else {

  http.createServer(app)
    .listen(8002)
}


