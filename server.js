const http = require('http');
const util = require('util');
const benc = require('./binary-trees/benc.js');
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

const serveFile = (req, res, filePath) => {
  fs.createReadStream(filePath).pipe(res);
};

const serveFolder = (req, res, folderPath) => {
  fs.readdir(folderPath, (err, files) => {

    if (err) {
      res.writeHead(500);
      return res.end(err.message);
    }

    if (~files.indexOf('index.html')) {
      return serveFile(req, res, path.join(folderPath, 'index.html'));
    }

    const response = `<pre>${files
      .map(f => `<a href="${path.join(req.url, f, '/')}">${f}/</a>`)
      .join('</br>')}</pre>`;

    res.end(response);
  });
};

const serveStatic = (req, res) => {
  var fullPath = path.join(__dirname, './public', url.parse(req.url).pathname);

  fs.stat(fullPath, (err, stats) => {

    if (err) {
      res.writeHead(404);
      return res.end(err.message);
    }

    stats.isDirectory() ? serveFolder(req, res, fullPath) : serveFile(req, res, fullPath);
  })
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
  res.end(JSON.stringify(benc.Benc(n)))
};

routes.get(binaryURL, binaryTreesHandler);


if (cluster.isMaster) {
  console.log("Running within", numCPUs, "CPU cores");
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  console.log("Server is listening at http://localhost:8002")

} else {

  http.createServer((req, res) => {
      if (!routes.route(req, res)) {
        serveStatic(req, res);
      }
    })
    .listen(8002);
}


