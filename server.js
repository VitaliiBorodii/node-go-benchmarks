const http = require('http');
const util = require('util');
const binaryTrees = require('./bench/binary-trees');
const cluster = require('cluster');
const path = require('path');
const fs = require('fs');
const url = require('url');

const router = require('http-router');
const numCPUs = require('os').cpus().length;

const routes = router.createRouter();

const BENCH = "/bench/";
const BINARY_TREES = "/binary-trees";

const binaryURL = path.join(BENCH + BINARY_TREES + '/:id');

const serveIndex = (req, res) => {
  fs.createReadStream(path.join(__dirname, './public/index.html')).pipe(res);
};

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
    res.end(util.format('Bad Request: `n` must be lower then 25 (got %d)', n));
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

routes.get(binaryURL, binaryTreesHandler);
routes.get('/', routesHandler);
routes.get(BINARY_TREES + '/', serveIndex); //@TODO; find a way to optimize this!!
routes.get(BINARY_TREES + '/:?', serveIndex);


if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  console.log("Server is listening at http://localhost:8002")

} else {

  http.createServer((req, res) => {
      if (!routes.route(req, res)) {
        res.writeHead(501);
        res.end(http.STATUS_CODES[501] + '\n');
      }
    })
    .listen(8002);
}


