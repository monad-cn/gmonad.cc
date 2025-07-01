package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func QueryCategories(c *gin.Context) {
	keyword := c.Query("keyword")
	order := c.DefaultQuery("order", "desc")

	parentId, _ := strconv.Atoi(c.Query("parent_id"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	filter := models.CategoryFilter{
		Keyword:   keyword,
		ParentId:  uint(parentId),
		OrderDesc: order == "desc",
		Page:      page,
		PageSize:  pageSize,
	}

	categories, total, err := models.QueryCategories(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryCategoriesResponse{
		Categories: categories,
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}
