package routes

import (
	"gmonad/controllers"
	"gmonad/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	r.Use(middlewares.Cors())
	r.POST("/events", controllers.CreateEvent)
	r.GET("/events", controllers.QueryEvents)
}
