package utils

import (
	"github.com/gin-gonic/gin"
)

// 成功响应
func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, gin.H{
		"code":    200,
		"message": message,
		"data":    data,
	})
}

// 错误响应
func ErrorResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, gin.H{
		"code":    500,
		"message": message,
		"data":    data,
	})
}
