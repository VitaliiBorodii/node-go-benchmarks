package benc

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type WriteResult struct {
	Result string
	Error  error
}

type ReadResult struct {
	Result []byte
	Error  error
}

func generateUUID() string {
	first := strconv.FormatInt(time.Now().UnixNano()/int64(time.Millisecond), 16)
	second := strconv.FormatInt(rand.Int63(), 16)
	first = first[len(first)-4:]
	second = second[len(second)-8:]
	ff := "gola"
	fs := first
	sf := second[4:]
	ss := second[:4]
	return fmt.Sprintf("%s-%s-%s-%s", ff, fs, sf, ss)

}

func writeFile(content []byte, c chan<- WriteResult) {
	fileName := generateUUID()
	filePath, err := filepath.Abs(path.Join("./logs", fmt.Sprintf("%s.json", fileName)))

	if err != nil {
		c <- WriteResult{Error: err}
		return
	}

	err = ioutil.WriteFile(filePath, content, 0644)

	c <- WriteResult{filePath, err}
}

func readFile(filePath string, c chan<- ReadResult) {
	result, err := ioutil.ReadFile(filePath)
	c <- ReadResult{result, err}
}

func errorHandler(w http.ResponseWriter, e error) {
	http.Error(w, fmt.Sprintf("Internal Server Error: %s", e.Error()), http.StatusInternalServerError)
}

func Logger(w http.ResponseWriter, r *http.Request) {
	t1 := time.Now().UnixNano() / int64(time.Millisecond)

	pathSlice := strings.Split(r.URL.Path, "/")
	arg := pathSlice[len(pathSlice)-1]
	requestInfo := []string{
		fmt.Sprintf("url: %s\n", (r.URL.Path)),
		fmt.Sprintf("method: %s\n", (r.Method)),
		fmt.Sprintf("argument: %s\n", arg),
		fmt.Sprintf("timestamp: %s\n", strconv.FormatInt(t1, 10)),
		fmt.Sprintf("user-agent: %s\n", r.Header.Get("user-agent")),
	}

	writeChan := make(chan WriteResult)

	jsonW, err := json.Marshal(requestInfo)

	if err != nil {
		errorHandler(w, err)
		return
	}

	go writeFile(jsonW, writeChan)

	resultWrite := <-writeChan

	if resultWrite.Error != nil {
		errorHandler(w, resultWrite.Error)
		return
	}

	readChan := make(chan ReadResult)

	go readFile(resultWrite.Result, readChan)

	resultRead := <-readChan

	if resultRead.Error != nil {
		errorHandler(w, resultRead.Error)
		return
	}

	response := []string{}

	err = json.Unmarshal(resultRead.Result, &response)

	if err != nil {
		errorHandler(w, err)
		return
	}

	response = append(response, fmt.Sprintf("log: %s\n", resultWrite.Result))
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	response = append(response, fmt.Sprintf("Request time: %d\n", (time.Now().UnixNano()/int64(time.Millisecond))-t1))

	jsonR, err := json.Marshal(response)
	if err != nil {
		errorHandler(w, err)
		return
	}
	w.Write([]byte(fmt.Sprintf("%s\n", jsonR)))
}
