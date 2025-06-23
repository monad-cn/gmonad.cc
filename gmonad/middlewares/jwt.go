package middlewares

import (
	"net/http"
	"strings"

	"gmonad/models"
	"gmonad/utils"

	"github.com/gin-gonic/gin"
)

func JWT(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Please log in to continue!", nil)
			c.Abort()
			return
		}

		parts := strings.Split(tokenString, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authentication failed, please try again.", nil)
			c.Abort()
			return
		}

		// 解析 Token
		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authentication failed, please try again.", nil)
			c.Abort()
			return
		}

		perms, err := models.GetUserWithPermissions(claims.Uid)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized action", nil)
			c.Abort()
			return
		}

		if isEqual := utils.StringSlicesEqual(perms, claims.Permissions); !isEqual {
			utils.ErrorResponse(c, http.StatusForbidden, " permission change", nil)
			c.Abort()
			return
		}

		// TODO: check in controller handle?
		permSet := utils.ToSet(claims.Permissions)
		if _, ok := permSet[permission]; !ok {
			utils.ErrorResponse(c, http.StatusForbidden, "Unauthorized permission", nil)
			c.Abort()
			return
		}

		c.Set("uid", claims.Uid)
		c.Set("permissions", claims.Permissions)
		c.Next()
	}
}
