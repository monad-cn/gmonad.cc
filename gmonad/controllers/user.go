package controllers

import (
	"fmt"
	"gmonad/logger"
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func UpdateUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Log.Errorf("Invalid request: %v", err)
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request. Please try again later.", nil)
		return
	}

	user, err := models.GetUserById(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "no user", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}
	userId, _ := uid.(uint)

	if user.ID != userId {
		utils.ErrorResponse(c, http.StatusUnauthorized, "permission denied.", nil)
		return
	}

	user.Email = req.Email
	user.Username = req.Username
	user.Avatar = req.Avatar
	user.Github = req.Github

	if err := models.UpdateUser(user); err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "success fail", nil)
		return
	}
	fmt.Println(user)
	utils.SuccessResponse(c, http.StatusOK, "success update", user)
}
