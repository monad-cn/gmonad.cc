package main

import (
	"gmonad/jobs"
	"gmonad/logger"
	"gmonad/middlewares"
	"gmonad/routes"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	// 初始化日志
	logFile := viper.GetString("log.file")
	logLevel := viper.GetString("log.level")
	logger.Init(logFile, logLevel)

	jobs.HandleTask()

	r := gin.Default()
	r.Use(middlewares.Cors())
	routes.SetupRouter(r)
	r.Run(":8080")
}
