package controllers

import (
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
		utils.ErrorResponse(c, http.StatusUnauthorized, "update fail", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success update", user)
}

// 关注用户
func FollowUser(c *gin.Context) {
	// 目标用户 id
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid user id", nil)
		return
	}
	followingID := uint(id)

	// 当前用户 id
	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}
	followerID, _ := uid.(uint)

	if followerID == followingID {
		utils.ErrorResponse(c, http.StatusBadRequest, "cannot follow yourself", nil)
		return
	}

	// 检查目标用户是否存在
	_, err = models.GetUserById(followingID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "target user not found", nil)
		return
	}

	// 检查是否已关注
	isFollowing, err := models.IsFollowing(followerID, followingID)
	if err != nil {
		logger.Log.Errorf("check follow failed: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "internal error", nil)
		return
	}
	if isFollowing {
		utils.ErrorResponse(c, http.StatusBadRequest, "already following", nil)
		return
	}

	if err := models.FollowUser(followerID, followingID); err != nil {
		logger.Log.Errorf("failed to follow: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to follow", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "follow success", nil)
}

// 取消关注
func UnfollowUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid user id", nil)
		return
	}
	followingID := uint(id)

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}
	followerID, _ := uid.(uint)
	if followerID == followingID {
		utils.ErrorResponse(c, http.StatusBadRequest, "cannot unfollow yourself", nil)
		return
	}

	// 检查目标用户是否存在
	_, err = models.GetUserById(followingID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "target user not found", nil)
		return
	}

	// 检查是否已关注
	isFollowing, err := models.IsFollowing(followerID, followingID)
	if err != nil {
		logger.Log.Errorf("check follow failed: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "internal error", nil)
		return
	}
	if !isFollowing {
		utils.ErrorResponse(c, http.StatusBadRequest, "not following", nil)
		return
	}

	// 取消关注		
	if err := models.UnfollowUser(followerID, followingID); err != nil {
		logger.Log.Errorf("failed to unfollow: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to unfollow", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "unfollow success", nil)
}
