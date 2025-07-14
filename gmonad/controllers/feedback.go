package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateFeedback(c *gin.Context) {
	var req CreateFeedbackRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	var feedback = models.Feedback{
		Content: req.Content,
		Url:     req.Url,
		Email:   req.Email,
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	feedback.UserId = &userId

	// 创建数据库记录
	if err := feedback.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", feedback)
}

func QueryFeedbacks(c *gin.Context) {
	order := c.DefaultQuery("order", "desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	filter := models.FeedbackFilter{
		OrderDesc: order == "desc",
		Page:      page,
		PageSize:  pageSize,
	}

	feedbacks, total, err := models.QueryFeedback(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryFeedbackResponse{
		Feedbacks: feedbacks,
		Page:      page,
		PageSize:  pageSize,
		Total:     total,
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}
