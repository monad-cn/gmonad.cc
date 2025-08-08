package routes

import (
	"gmonad/controllers"
	"gmonad/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	r.Use(middlewares.Cors())

	r.POST("/v1/login", controllers.HandleLogin)

	user := r.Group("v1/users")
	{
		user.PUT("/:id", middlewares.JWT(""), controllers.UpdateUser)
	}

	event := r.Group("/v1/events")
	{
		event.POST("", middlewares.JWT("event:write"), controllers.CreateEvent)
		event.DELETE("/:id", middlewares.JWT("event:delete"), controllers.DeleteEvent)
		event.PUT("/:id", middlewares.JWT("event:write"), controllers.UpdateEvent)
		event.GET("", controllers.QueryEvents)
		event.GET("/:id", controllers.GetEvent)
		event.PUT("/:id/status", middlewares.JWT("event:review"), controllers.UpdateEventPublishStatus)

		// 发布博客是用户默认权限， 这里任何用户都可以添加recap
		event.POST("/recap", middlewares.JWT("blog:write"), controllers.CreateReacp)
		event.DELETE("/recap/:id", middlewares.JWT("blog:delete"), controllers.DeleteRecap)
		event.PUT("/recap/:id", middlewares.JWT("blog:write"), controllers.UpdateRecap)
		event.GET("/recap", controllers.GetRecap)
	}
	blog := r.Group("/v1/blogs")
	{
		blog.POST("", middlewares.JWT("blog:write"), controllers.CreateArticle)
		blog.DELETE("/:id", middlewares.JWT("blog:delete"), controllers.DeleteArticle)
		blog.PUT("/:id", middlewares.JWT("blog:write"), controllers.UpdateArticle)
		blog.GET("/:id", controllers.GetArticle)
		blog.GET("", controllers.QueryArticles)
		blog.PUT("/:id/status", middlewares.JWT("blog:review"), controllers.UpdateArticlePublishStatus)
	}
	dapp := r.Group("/v1/dapps")
	{
		dapp.POST("", middlewares.JWT("dapp:write"), controllers.CreateDapp)
		dapp.DELETE("/:id", middlewares.JWT("dapp:delete"), controllers.DeleteDapp)
		dapp.GET("/:id", controllers.GetDapp)
		dapp.GET("/categories", controllers.QueryCategories)
		dapp.GET("", controllers.QueryDapps)
	}
	tutorial := r.Group("/v1/tutorials")
	{
		tutorial.POST("", middlewares.JWT("tutorial:write"), controllers.CreateTutorial)
		tutorial.DELETE("/:id", middlewares.JWT("tutorial:delete"), controllers.DeleteTutorial)
		tutorial.PUT("/:id", middlewares.JWT("tutorial:write"), controllers.UpdateTutorial)
		tutorial.GET("/:id", controllers.GetTutorial)
		tutorial.GET("", controllers.QueryTutorials)
		tutorial.PUT("/:id/status", middlewares.JWT("tutorial:review"), controllers.UpdateTutorialPublishStatus)
	}
	feedback := r.Group("/v1/feedbacks")
	{
		feedback.POST("", middlewares.JWT(""), controllers.CreateFeedback)
		feedback.GET("", controllers.QueryFeedbacks)
	}
	post := r.Group("/v1/posts")
	{
		post.POST("", middlewares.JWT("blog:write"), controllers.CreatePost)
		post.DELETE("/:id", middlewares.JWT("blog:delete"), controllers.DeletePost)
		post.GET("/:id", controllers.GetPost)
		post.PUT("/:id", middlewares.JWT("blog:write"), controllers.UpdatePost)
		post.GET("", controllers.QueryPosts)
		post.GET("/stats", controllers.PostsStats)
	}
	r.GET("/v1/statistics/stream", controllers.GetStatistics)
	r.GET("/v1/stats", controllers.StatsOverview)
}
