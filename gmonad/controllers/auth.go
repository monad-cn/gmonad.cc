package controllers

import (
	"fmt"
	"gmonad/models"
	"gmonad/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Username string `json:"username"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid args!", nil)
		return
	}

	var user models.User
	user.Email = req.Email
	if err := models.GetUserByEmail(&user); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "user is not exist!", nil)
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		utils.ErrorResponse(c, http.StatusBadRequest, "password err", nil)
		fmt.Println("pe")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "login success", user)
}
