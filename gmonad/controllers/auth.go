package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
		return
	}

	// get permissions
	perms, err := user.GetUserWithPermissions()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "get permissions error", nil)
		return
	}

	var resp LoginResponse
	resp.User = user
	resp.Permissions = perms

	token, err := utils.GenerateToken(user.ID, user.Email, user.Avatar, perms)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "generate token error", nil)
		return
	}
	resp.Token = token

	utils.SuccessResponse(c, http.StatusOK, "login success", resp)
}
