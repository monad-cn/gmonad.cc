package controllers

import (
	"encoding/json"
	"fmt"
	"gmonad/logger"
	"gmonad/models"
	"gmonad/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func HandleLogin(c *gin.Context) {
	var req SignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Log.Errorf("Invalid request: %v", err)
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request. Please try again later.", nil)
		return
	}

	var accessRequest AccessTokenRequest
	accessRequest.ClientId = viper.GetString("oauth.clientId")
	accessRequest.ClientSecret = viper.GetString("oauth.clientSecret")
	accessRequest.Code = req.Code

	var reqArgs utils.HTTPRequestParams
	reqArgs.URL = viper.GetString("oauth.accessApi")
	reqArgs.Method = "POST"
	reqArgs.Body = accessRequest

	var result string
	var err error
	result, err = utils.SendHTTPRequest(reqArgs)
	if err != nil {
		logger.Log.Errorf("ServerError: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Network error, please try again later.", nil)
		return
	}

	var tokenResp AccessTokenResponse
	err = json.Unmarshal([]byte(result), &tokenResp)
	if err != nil {
		logger.Log.Errorf("ServerError: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Network error, please try again later.", nil)
		return
	}

	if tokenResp.Status != 200 {
		logger.Log.Errorf("ServerError: %v", tokenResp)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Network error, please try again later.", nil)
		return
	}

	accessToken := tokenResp.Data.Token
	reqArgs.URL = viper.GetString("oauth.getUser")
	reqArgs.Method = "GET"

	header := make(map[string]string)
	header["Authorization"] = fmt.Sprintf("Bearer %s", accessToken)
	reqArgs.Headers = header

	userResult, err := utils.SendHTTPRequest(reqArgs)
	if err != nil {
		logger.Log.Errorf("SendHTTPRequest err: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Network error, please try again later.", nil)
		return
	}

	var resp GetUserResponse
	err = json.Unmarshal([]byte(userResult), &resp)
	if err != nil {
		logger.Log.Errorf("Unmarshal err: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Network error, please try again later.", nil)
		return
	}

	if resp.Status != 200 {
		logger.Log.Errorf("ServerError: %v", resp)
		utils.ErrorResponse(c, http.StatusInternalServerError, resp.Message, nil)
		return
	}

	var user *models.User

	userId := resp.Data.Uid
	user, err = models.GetUserByUid(userId)
	if err == nil {
		user.Uid = resp.Data.Uid
		user.Avatar = resp.Data.Avatar
		user.Email = resp.Data.Email
		user.Username = resp.Data.UserName
		user.Github = resp.Data.Github
		err = models.UpdateUser(user)
	} else {
		var u models.User
		u.Uid = resp.Data.Uid
		u.Avatar = resp.Data.Avatar
		u.Email = resp.Data.Email
		u.Username = resp.Data.UserName
		u.Github = resp.Data.Github
		user = &u
		err = models.CreateUser(user)
	}

	if err != nil {
		logger.Log.Errorf("ServerError: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Network error, please try again later.", nil)
		return
	}

	perms, err := models.GetUserWithPermissions(user.ID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "get permissions error", nil)
		return
	}

	var loginResp LoginResponse
	loginResp.User = *user
	loginResp.Permissions = perms

	token, err := utils.GenerateToken(user.ID, user.Email, user.Avatar, user.Username, user.Github, perms)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "generate token error", nil)
		return
	}
	loginResp.Token = token
	utils.SuccessResponse(c, http.StatusOK, "success", loginResp)
}
