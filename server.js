const http = require('http');
const util = require('util');
const cluster = require('cluster');
const path = require('path');
const fs = require('fs');
const express = require('express');


const app = express();
const binaryTrees = require('./bench/binary-trees');

const numCPUs = require('os').cpus().length;
const BENCH = "/bench/";
const BINARY_TREES = "/binary-trees";

const binaryURL = path.join(BENCH + BINARY_TREES + '/:id');

const serveFile = (fileName, req, res) => fs.createReadStream(path.join(__dirname, './public/', fileName)).pipe(res);

const serveIndex = serveFile.bind(null, 'index.html');
const serveJS = serveFile.bind(null, 'main.js');
const serveCSS = serveFile.bind(null, 'main.css');

const binaryTreesHandler = (req, res) => {
  const path = req.url.split('/')[1];

  const n = parseInt(req.params.id);

  if (isNaN(n)) {
    res.writeHead(400, {'Content-Type': 'text/plain'});
    res.end(util.format('Bad Request: `%s` is not a number', path));
    return
  }

  if (n > 25) {
    res.writeHead(400, {'Content-Type': 'text/plain'});
    res.end(util.format('Bad Request: `argument` must be lower or equal then 25 (got %d)', n));
    return
  }

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(binaryTrees(n)))
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

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(response);
};

app.get(binaryURL, binaryTreesHandler);
app.get('/', routesHandler);
app.get('*.js', serveJS);
app.get('*.css', serveCSS);
app.get(BINARY_TREES + '/*', serveIndex);

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  console.log("Server is listening at http://localhost:8002")

} else {

  http.createServer(app)
    .listen(8002);
}


