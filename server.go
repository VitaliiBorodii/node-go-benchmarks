package main

import (
	"github.com/gorilla/mux"


	"./binary-trees"

	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"runtime"
)

const (
	BENCH = "/bench/"
	BINARY_TREES = "/binary-trees"
)

func binaryTreesHandler(w http.ResponseWriter, r *http.Request) {
	index := len(BINARY_TREES) + len(BENCH)
	path := r.URL.Path[index:]
	n, err := strconv.ParseInt(path, 10, 64)

	if err != nil {
		http.Error(w, fmt.Sprintf("Bad Request: `%s` is not a number", path), http.StatusBadRequest)
		return
	}

	if (n > 25) {
		http.Error(w, fmt.Sprintf("Bad Request: `n` must be lower then 25 (got %d)", n), http.StatusBadRequest)
		return
	}

	result := benc.Benc(int(n))

	b, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}

	w.Write([]byte(fmt.Sprintf("%s\n", string(b))))
}

func main() {
	numCPUs := runtime.NumCPU()
	runtime.GOMAXPROCS(numCPUs * 2)
	fmt.Println("Running within", numCPUs, "CPU cores")

	r := mux.NewRouter()

	bench := r.PathPrefix(BENCH)
	bench.Subrouter().HandleFunc(BINARY_TREES + "/{key}", binaryTreesHandler)

	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("public"))))
	http.Handle("/", r)

	fmt.Println("Server is listening at http://localhost:8001")
	http.ListenAndServe(":8001", nil)
}
