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
	}

	// 创建数据库记录
	if err := event.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", event)
}

func QueryEvents(c *gin.Context) {
	keyword := c.Query("keyword")
	tag := c.Query("tag")
	location := c.Query("location")
	eventMode := c.Query("event_mode")
	order := c.DefaultQuery("order", "desc")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	status, _ := strconv.Atoi(c.DefaultQuery("status", "0"))

	filter := models.EventFilter{
		Keyword:   keyword,
		Tag:       tag,
		Location:  location,
		EventMode: eventMode,
		OrderDesc: order == "desc",
		Page:      page,
		PageSize:  pageSize,
		Status:    status,
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
