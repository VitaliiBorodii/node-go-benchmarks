const http = require('http');
const util = require('util');
const cluster = require('cluster');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');

const binaryTrees = require('./bench/binary-trees');

const app = express();

const BENCH = "/bench/";
const BINARY_TREES = "/binary-trees";

const serveFile = (fileName, req, res) => fs.createReadStream(path.join(__dirname, './public/', fileName)).pipe(res);
const serveIndex = serveFile.bind(null, 'index.html');
const serveJS = serveFile.bind(null, 'main.js');
const serveCSS = serveFile.bind(null, 'main.css');

const binaryTreesHandler = (req, res) => {

  const n = parseInt(req.params.arg);

  if (isNaN(n)) {
    return res.status(400).send(util.format('Bad Request: `%s` is not a number', req.params.arg));
  }

  if (n > 25) {
    return res.status(400).send(util.format('Bad Request: `argument` must be lower or equal then 25 (got %d)', n));
  }

  res.status(200).json(binaryTrees(n));
};

const routesHandler = (req, res) => {
  const links = [
    BINARY_TREES
  ];

  let response = '<pre>';

  links.forEach(link => {
    response += `<a href="${link}/">${link}/</a></br>`;
  });

  response += '</pre>';

  res.status(200).send(response);
};

const staticRouter = express.Router();
const benchRouter = express.Router();

staticRouter.get('/', routesHandler);
staticRouter.get('*.js', serveJS);
staticRouter.get('*.css', serveCSS);

staticRouter.get(BINARY_TREES + '/*', serveIndex);
benchRouter.get(`${BINARY_TREES}/:arg`, binaryTreesHandler);

app.use('/', staticRouter);
app.use(BENCH, benchRouter);

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
  console.log("Server is listening at http://localhost:8002")

} else {

  http.createServer(app)
    .listen(8002);
}


