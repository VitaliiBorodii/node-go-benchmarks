This repo is created for capabilities comparison of **Node.js** and **go**lang

The purpose of it - is to learn strong sides of both program languages and determine their weak spots and bottlenecks.

Most of the benchmark code is taken from [here](https://benchmarksgame.alioth.debian.org/u64q/compare.php?lang=go&lang2=node)

I only changed code a little (optimized what I could) to make it importable from web server.

This was my primary interest - not just to run the code and see how long will it take, but to see how it can work in client-server application.

`go get ./...` - to install **go** dependencies

`nmp i` - to install **Node.js** dependencies

then 

`npm run go-server` - to run **go** server

`npm run node-server` - to run **Node.js** server
