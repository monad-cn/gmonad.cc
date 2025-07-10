package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func CreateDapp(c *gin.Context) {
	var req CreateDappRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	if req.CategoryId == 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid category id", nil)
		return
	}

	var dapp = models.Dapp{
		Name:        req.Name,
		Description: req.Description,
		X:           req.X,
		Logo:        req.Logo,
		Site:        req.Site,
		CoverImg:    req.CoverImg,
		CategoryId:  req.CategoryId,
		Tags:        req.Tags,
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

	dapp.UserId = userId
	// 创建数据库记录
	if err := dapp.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", dapp)
}

func GetDapp(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var dapp models.Dapp
	dapp.ID = uint(id)

	if err = dapp.GetByID(); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid dapp", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", dapp)
}

func QueryDapps(c *gin.Context) {
	keyword := c.Query("keyword")
	tag := c.Query("tag")
	order := c.DefaultQuery("order", "desc")
	isFeature, _ := strconv.Atoi(c.DefaultQuery("is_feature", "0"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	mainCategoriesStr := c.Query("main_category")
	subCategoriesStr := c.Query("sub_category")

	mainCategories := ParseUintIDs(mainCategoriesStr)
	subCategories := ParseUintIDs(subCategoriesStr)

	filter := models.DappFilter{
		Keyword:        keyword,
		Tag:            tag,
		MainCategories: mainCategories,
		SubCategories:  subCategories,
		IsFeature:      uint(isFeature),
		OrderDesc:      order == "desc",
		Page:           page,
		PageSize:       pageSize,
	}

	dapps, total, err := models.QueryDapps(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryDappsResponse{
		Dapps:    dapps,
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}

func DeleteDapp(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}
	var dapp models.Dapp
	dapp.ID = uint(id)

	if err = dapp.GetByID(); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid dapp", nil)
		return
	}

	if err := dapp.Delete(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete dapp", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "delete success", nil)
}

func ParseUintIDs(commaStr string) []uint {
	var ids []uint
	if commaStr == "" {
		return ids
	}

	idsSlice := strings.Split(commaStr, ",")
	for _, idStr := range idsSlice {
		idStr = strings.TrimSpace(idStr)
		if idStr == "" {
			continue
		}
		id, err := strconv.ParseUint(idStr, 10, 32)
		if err == nil {
			ids = append(ids, uint(id))
		}
	}
	return ids
}
