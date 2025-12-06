package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateTutorial(c *gin.Context) {
	var req CreateTutorialRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	var tutorial = models.Tutorial{
		Title:       req.Title,
		Description: req.Desc,
		Content:     req.Content,
		Author:      req.Author,
		CoverImg:    req.CoverImg,
		Tags:        req.Tags,
		SourceLink:  req.SourceLink,
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	tutorial.PublisherId = uint(userId)

	var dapp models.Dapp
	if req.DappId != 0 {
		dapp.ID = req.DappId
		if err := dapp.GetByID(); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "dapp not exist", nil)
			return
		}
		tutorial.DappId = &dapp.ID
	}

	// 创建数据库记录
	if err := tutorial.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", tutorial)
}

func GetTutorial(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var tutorial models.Tutorial
	tutorial.ID = uint(id)

	if err = tutorial.GetByID(); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Tutorial", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", tutorial)
}

func QueryTutorials(c *gin.Context) {
	keyword := c.Query("keyword")
	tag := c.Query("tag")
	order := c.DefaultQuery("order", "desc")
	dappId, _ := strconv.Atoi(c.DefaultQuery("dapp_id", "0"))
	publishStatus, _ := strconv.Atoi(c.DefaultQuery("publish_status", "0"))
	userId, _ := strconv.Atoi(c.Query("user_id"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	filter := models.TutorialFilter{
		Keyword:       keyword,
		Tag:           tag,
		DappId:        uint(dappId),
		PublisherId:   userId,
		PublishStatus: publishStatus,
		OrderDesc:     order == "desc",
		Page:          page,
		PageSize:      pageSize,
	}

	tutorials, total, err := models.QueryTutorials(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryTutorialsResponse{
		Tutorials: tutorials,
		Page:      page,
		PageSize:  pageSize,
		Total:     total,
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}

func DeleteTutorial(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}
	var tutorial models.Tutorial
	tutorial.ID = uint(id)

	if err = tutorial.GetByID(); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid tutorial", nil)
		return
	}

	// uid, ok := c.Get("uid")
	// if !ok {
	// 	utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
	// 	return
	// }

	// userId, _ := uid.(uint)
	// if tutorial.PublisherId != userId {
	// 	utils.ErrorResponse(c, http.StatusUnauthorized, "not author", nil)
	// 	return
	// }

	if err := tutorial.Delete(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete tutorial", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "delete success", nil)
}

func UpdateTutorial(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateTutorialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var tutorial models.Tutorial
	tutorial.ID = uint(id)

	if err = tutorial.GetByID(); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid tutorial", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	if tutorial.PublisherId != userId {
		utils.ErrorResponse(c, http.StatusUnauthorized, "not author", nil)
		return
	}

	var dapp models.Dapp
	if req.DappId != 0 {
		dapp.ID = req.DappId
		if err := dapp.GetByID(); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "dapp not exist", nil)
			return
		}
		tutorial.DappId = &dapp.ID
	}

	tutorial.Title = req.Title
	tutorial.Description = req.Desc
	tutorial.Content = req.Content
	tutorial.Author = req.Author
	tutorial.SourceLink = req.SourceLink
	tutorial.CoverImg = req.CoverImg
	tutorial.Tags = req.Tags
	tutorial.PublishStatus = 1 // 编辑更新后需要重新审核

	if err := tutorial.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update tutorial", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", tutorial)
}

func UpdateTutorialPublishStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateTutorialPublishStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var tutorial models.Tutorial
	tutorial.ID = uint(id)

	if err = tutorial.GetByID(); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid tutorial", nil)
		return
	}

	if tutorial.PublishStatus != 1 && tutorial.PublishStatus != 2 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid status", nil)
		return
	}

	// TODO: 2 -> 1 ?
	now := time.Now()
	tutorial.PublishStatus = req.PublishStatus
	tutorial.PublishTime = &now

	if err := tutorial.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update tutorial", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", tutorial)
}
