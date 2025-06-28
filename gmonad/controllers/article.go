package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateArticle(c *gin.Context) {
	var req CreateArticleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var article = models.Article{
		Title:       req.Title,
		Description: req.Desc,
		Content:     req.Content,
		Category:    req.Category,
		CoverImg:    req.CoverImg,
		Tags:        req.Tags,
		SourceLink:  req.SourceLink,
		Author:      req.Author,
		Translator:  req.Translator,
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	article.PublisherId = uint(userId)
	// 创建数据库记录
	if err := article.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", article)
}

func GetArticle(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var article models.Article
	article.ID = uint(id)

	if err = article.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid Article", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", article)
}

func QueryArticles(c *gin.Context) {
	keyword := c.Query("keyword")
	tag := c.Query("tag")
	author := c.Query("author")
	category := c.Query("category")
	order := c.DefaultQuery("order", "desc")
	publishStatus, _ := strconv.Atoi(c.DefaultQuery("publish_status", "0"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	filter := models.ArticleFilter{
		Keyword:       keyword,
		Tag:           tag,
		Author:        author,
		Category:      category,
		PublishStatus: publishStatus,
		OrderDesc:     order == "desc",
		Page:          page,
		PageSize:      pageSize,
	}

	articles, total, err := models.QueryArticles(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryArticlesResponse{
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	}
	if category == "blog" {
		response.Blogs = articles
	} else {
		response.Guides = articles
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}

func DeleteArticle(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}
	var article models.Article
	article.ID = uint(id)

	if err = article.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid article", nil)
		return
	}

	if err := article.Delete(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete article", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "delete success", nil)
}

func UpdateArticle(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var article models.Article
	article.ID = uint(id)

	if err = article.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid article", nil)
		return
	}

	article.Title = req.Title
	article.Description = req.Desc
	article.Content = req.Content
	article.Category = req.Category
	article.SourceLink = req.SourceLink
	article.CoverImg = req.CoverImg
	article.Tags = req.Tags
	article.Author = req.Author

	if err := article.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update article", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", article)
}

func UpdateArticlePublishStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdateBlogPublishStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var article models.Article
	article.ID = uint(id)

	if err = article.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid artcile", nil)
		return
	}

	if article.PublishStatus != 1 && article.PublishStatus != 2 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid status", nil)
		return
	}

	// TODO: 2 -> 1 ?
	now := time.Now()
	article.PublishStatus = req.PublishStatus
	article.PublishTime = &now

	if err := article.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update article", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", article)
}
