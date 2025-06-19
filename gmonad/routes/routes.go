package routes

import (
	"gmonad/controllers"
	"gmonad/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	r.Use(middlewares.Cors())
	r.POST("/v1/events", controllers.CreateEvent)
	r.GET("/v1/events", controllers.QueryEvents)
	r.GET("/v1/events/:id", controllers.GetEvent)
	r.DELETE("/v1/events/:id", controllers.DeleteEvent)
	r.PUT("/v1/events/:id", controllers.UpdateEvent)
	r.PUT("/v1/events/:id/status", middlewares.JWT("event:review"), controllers.UpdateEventPublishStatus)
	r.POST("/v1/login", controllers.Login)
}
