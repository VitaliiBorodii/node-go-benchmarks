package main

import (
	"github.com/gorilla/mux"

	. "./bench"

	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"io"
	"path/filepath"
	"strings"
)

const (
	BENCH = "/bench/"
	BINARY_TREES = "/binary-trees"
)

func serveFile(fileName string, w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, filepath.Join("./public/", fileName))
}

func serveIndex(w http.ResponseWriter, r *http.Request) {
	serveFile("index.html", w, r)
}

func serveJS(w http.ResponseWriter, r *http.Request) {
	serveFile("main.js", w, r)
}

func serveCSS(w http.ResponseWriter, r *http.Request) {
	serveFile("main.css", w, r)
}

func binaryTreesHandler(w http.ResponseWriter, r *http.Request) {
	pathSlice := strings.Split(r.URL.Path, "/")
	arg := pathSlice[len(pathSlice) - 1]

	n, err := strconv.ParseInt(arg, 10, 64)

	if err != nil {
		http.Error(w, fmt.Sprintf("Bad Request: `%s` is not a number", arg), http.StatusBadRequest)
		return
	}

	if (n > 25) {
		http.Error(w, fmt.Sprintf("Bad Request: `argument` must be lower or equal then 25 (got %d)", n), http.StatusBadRequest)
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

	benchRouter := r.PathPrefix(BENCH).Subrouter()

	publicRouter := r.PathPrefix("/").Subrouter()
	publicRouter.HandleFunc("/", routesHandler)
	publicRouter.HandleFunc("/{*}.js", serveJS)
	publicRouter.HandleFunc("/{*}.css", serveCSS)

	publicRouter.HandleFunc(BINARY_TREES + "/", serveIndex)
	benchRouter.HandleFunc(BINARY_TREES + "/{arg}", binaryTreesHandler)

	http.Handle("/", r)

	fmt.Println("Server is listening at http://localhost:8001")
	http.ListenAndServe(":8001", nil)
}
