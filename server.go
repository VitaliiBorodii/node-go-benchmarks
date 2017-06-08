package main

import (
	"github.com/gorilla/mux"

	. "./bench"

	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"io"
)

const (
	BENCH = "/bench/"
	BINARY_TREES = "/binary-trees"
)

func serveIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./public/index.html")
}

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

	result := BinaryTrees(int(n))

	b, err := json.Marshal(result)
	if err != nil {
		panic(err)
	}

	w.Write([]byte(fmt.Sprintf("%s\n", string(b))))
}

func routesHandler(w http.ResponseWriter, r *http.Request) {

	links := [...]string{
		BINARY_TREES,
	}

	response := "<pre>"

	for _, link := range links {
		response += fmt.Sprintf("<a href='%s/'>%s/</a></br>", link, link)
	}

	response += "</pre>"

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	io.WriteString(w, response)
}

func main() {

	r := mux.NewRouter()

	bench := r.PathPrefix(BENCH)
	subBench := bench.Subrouter()

	subBench.HandleFunc(BINARY_TREES + "/{key}", binaryTreesHandler)

	public := r.PathPrefix("/").Subrouter()
	public.HandleFunc(BINARY_TREES + "/", serveIndex)


	public.HandleFunc("/", routesHandler)

	http.Handle("/", r)

	fmt.Println("Server is listening at http://localhost:8001")
	http.ListenAndServe(":8001", nil)
}
