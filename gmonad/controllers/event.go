package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateEvent(c *gin.Context) {
	var req CreateEventRequest

	// 将 JSON 请求体绑定到 event 结构体
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	startT, _ := utils.ParseTime(req.StartTime)
	endT, _ := utils.ParseTime(req.EndTime)

	var event = models.Event{
		Title:       req.Title,
		Description: req.Desc,
		EventMode:   req.EventMode,
		Location:    req.Location,
		Link:        req.Link,
		StartTime:   startT,
		EndTime:     endT,
		CoverImg:    req.CoverImg,
		Tags:        req.Tags,
		Twitter:     req.Twitter,
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, ok := uid.(int)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	event.UserId = uint(userId)
	// 创建数据库记录
	if err := event.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", event)
}

func GetEvent(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var event models.Event
	event.ID = uint(id)

	if err = event.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Event", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", event)
}

func QueryEvents(c *gin.Context) {
	keyword := c.Query("keyword")
	tag := c.Query("tag")
	location := c.Query("location")
	eventMode := c.Query("event_mode")
	order := c.DefaultQuery("order", "desc")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	status, _ := strconv.Atoi(c.DefaultQuery("status", "0"))

	publishStatus, _ := strconv.Atoi(c.DefaultQuery("publish_status", "0"))

	filter := models.EventFilter{
		Keyword:       keyword,
		Tag:           tag,
		Location:      location,
		EventMode:     eventMode,
		OrderDesc:     order == "desc",
		Page:          page,
		PageSize:      pageSize,
		Status:        status,
		PublishStatus: publishStatus,
	}

	events, total, err := models.QueryEvents(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryEventsResponse{
		Events:   events,
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}

func DeleteEvent(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}
	var event models.Event
	event.ID = uint(id)

	if err = event.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Event", nil)
		return
	}

	if err := event.Delete(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete event", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "delete success", nil)
}

func UpdateEvent(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var event models.Event
	event.ID = uint(id)

	if err = event.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Event", nil)
		return
	}

	startT, _ := utils.ParseTime(req.StartTime)
	endT, _ := utils.ParseTime(req.EndTime)

	event.Title = req.Title
	event.Description = req.Desc
	event.EventMode = req.EventMode
	event.Location = req.Location
	event.Link = req.Link
	event.StartTime = startT
	event.EndTime = endT
	event.CoverImg = req.CoverImg
	event.Tags = req.Tags
	event.Twitter = req.Twitter

	if err := event.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update event", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", event)
}

func UpdateEventPublishStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateEventPublishStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var event models.Event
	event.ID = uint(id)

	if err = event.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Event", nil)
		return
	}

	if event.PublishStatus != 1 && event.PublishStatus != 2 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid status", nil)
		return
	}

	// TODO: 2 -> 1 ?
	event.PublishStatus = req.PublishStatus

	if err := event.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update event", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", event)
}
