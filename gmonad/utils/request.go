package utils

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type HTTPRequestParams struct {
	URL     string
	Method  string
	Headers map[string]string
	Body    interface{}
}

func SendHTTPRequest(params HTTPRequestParams) (string, error) {
	var reqBody []byte
	var err error
	if params.Body != nil {
		reqBody, err = json.Marshal(params.Body)
		if err != nil {
			return "", err
		}
	}

	// 创建请求
	req, err := http.NewRequest(params.Method, params.URL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	// 添加头部信息
	for key, value := range params.Headers {
		req.Header.Set(key, value)
	}

	// 设置内容类型为JSON（常用）
	if req.Body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}
