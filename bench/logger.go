package benc

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"path"
	"path/filepath"
	"strconv"
	"time"
)

type RequestInfo struct {
	Url       string
	Method    string
	Argument  string
	UserAgent string
}

type Result struct {
	Result []string
	Error  error
}

type writeResult struct {
	Result string
	Error  error
}

type readResult struct {
	Result []byte
	Error  error
}

func generateUUID() string {
	timestamp := strconv.FormatInt(time.Now().UnixNano() / int64(time.Millisecond), 16)
	rand1 := strconv.FormatInt(rand.Int63(), 16)
	rand2 := strconv.FormatInt(rand.Int63(), 16)
	ff := "gola"
	fs := timestamp[len(timestamp) - 4:]
	sf := rand1[len(rand1) - 4:]
	ss := rand2[len(rand2) - 4:]
	return fmt.Sprintf("%s-%s-%s-%s", ff, fs, sf, ss)

}

func writeFile(content []byte, c chan <- writeResult) {
	fileName := generateUUID()
	filePath, err := filepath.Abs(path.Join("./logs", fmt.Sprintf("%s.json", fileName)))

	if err != nil {
		c <- writeResult{"", err}
		return
	}

	err = ioutil.WriteFile(filePath, content, 0644)

	c <- writeResult{filePath, err}
}

func readFile(filePath string, c chan <- readResult) {
	result, err := ioutil.ReadFile(filePath)
	c <- readResult{result, err}
}

func Logger(r RequestInfo) Result {
	t1 := time.Now().UnixNano() / int64(time.Millisecond)

	requestInfo := []string{
		fmt.Sprintf("url: %s\n", (r.Url)),
		fmt.Sprintf("method: %s\n", (r.Method)),
		fmt.Sprintf("argument: %s\n", r.Argument),
		fmt.Sprintf("timestamp: %s\n", strconv.FormatInt(t1, 10)),
		fmt.Sprintf("user-agent: %s\n", r.UserAgent),
	}

	writeChan := make(chan writeResult)

	jsonW, _ := json.Marshal(requestInfo)

	go writeFile(jsonW, writeChan)

	resultWrite := <-writeChan

	if resultWrite.Error != nil {
		return Result{nil, resultWrite.Error}
	}

	readChan := make(chan readResult)

	go readFile(resultWrite.Result, readChan)

	resultRead := <-readChan

	if resultRead.Error != nil {
		return Result{nil, resultRead.Error}
	}

	response := []string{}

	_ = json.Unmarshal(resultRead.Result, &response)

	response = append(response, fmt.Sprintf("log: %s\n", resultWrite.Result))
	response = append(response, fmt.Sprintf("Execution time: %d ms\n", (time.Now().UnixNano() / int64(time.Millisecond)) - t1))

	return Result{response, nil}
}
