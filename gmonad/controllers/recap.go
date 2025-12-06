package controllers

import (
	"fmt"
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateReacp(c *gin.Context) {
	var req CreateRecapRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid args", nil)
		return
	}

	var recap = models.Recap{
		Content:   req.Content,
		Video:     req.Video,
		Recording: req.Recording,
		Twitter:   req.Twitter,
		EventId:   req.EventId,
	}

	var event models.Event
	event.ID = req.EventId

	if err := event.GetByID(req.EventId); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "event is not exist!", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, ok := uid.(uint)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	recap.UserId = userId
	// 创建数据库记录
	if err := recap.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", recap)
}

func GetRecap(c *gin.Context) {
	eventId, _ := strconv.Atoi(c.Query("event_id"))

	var event models.Event
	event.ID = uint(eventId)
	if err := event.GetByID(uint(eventId)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "event is not exist!", nil)
		return
	}

	var recap models.Recap
	recap.EventId = event.ID

	if err := recap.GetByEventId(event.ID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "recap is not exist!", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", recap)
}

func UpdateRecap(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateRecapRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var recap models.Recap
	recap.ID = uint(id)

	if err = recap.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid recap", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	if userId != recap.UserId {
		utils.ErrorResponse(c, http.StatusUnauthorized, "not author", nil)
		return
	}

	recap.Content = req.Content
	recap.Video = req.Video
	recap.Recording = req.Recording
	recap.Twitter = req.Twitter

	if err := recap.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update recap", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", recap)
}

func DeleteRecap(c *gin.Context) {
	eventIdStr := c.Param("eventId")
	eventId, _ := strconv.ParseUint(eventIdStr, 10, 64)

	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var event models.Event
	event.ID = uint(eventId)

	if err := event.GetByID(uint(eventId)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "event is not exist!", nil)
		return
	}

	var recap models.Recap
	recap.ID = uint(id)

	if err = recap.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid recap", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	if userId != recap.UserId {
		utils.ErrorResponse(c, http.StatusUnauthorized, "not author", nil)
		return
	}

	if err := recap.Delete(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete recap", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "delete success", nil)
}
