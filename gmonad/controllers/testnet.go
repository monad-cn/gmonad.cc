package controllers

import (
	"gmonad/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func GetStatistics(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		http.Error(c.Writer, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	interval := viper.GetUint("timer.sse")
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.Request.Context().Done():
			return
		case t := <-ticker.C:
			// 构造 SSE 数据
			blockNum, avgBlockTime, validators, _ := models.GetStatistics()

			var resp StatisticResponse
			resp.BlockNum = blockNum
			resp.AvgBlockTime = avgBlockTime
			resp.Validators = validators
			resp.Timestamp = t.Unix()
			data := resp.ToSSE()

			c.Writer.Write([]byte(data))
			flusher.Flush()
		}
	}
}
