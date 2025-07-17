package middlewares

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/ratelimit"
)

// LeakyBucketRateLimiter 创建一个基于漏桶算法的限流中间件
func LeakyBucketRateLimiter(rate int) gin.HandlerFunc {
	// 每秒可以处理的请求数量
	rl := ratelimit.New(rate) // 每秒 rate 个请求

	return func(c *gin.Context) {
		rl.Take() // 等待直到有足够的空间进行处理
		c.Next()
	}
}
