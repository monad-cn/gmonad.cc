package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreatePost(c *gin.Context) {
	var req CreatePostRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	var post = models.Post{
		Title:       req.Title,
		Description: req.Description,
		Tags:        req.Tags,
		Twitter:     req.Twitter,
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	post.UserId = userId

	if err := post.Create(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "create success", post)
}

func GetPost(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var post models.Post
	post.ID = uint(id)

	if err = post.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid post", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", post)
}

func DeletePost(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}
	var post models.Post
	post.ID = uint(id)

	if err = post.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid post", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	if post.UserId != userId {
		utils.ErrorResponse(c, http.StatusUnauthorized, "not author", nil)
		return
	}

	if err := post.Delete(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete post", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "delete success", nil)
}

func UpdatePost(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	var req UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input data", nil)
		return
	}

	var post models.Post
	post.ID = uint(id)

	if err = post.GetByID(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid post", nil)
		return
	}

	uid, ok := c.Get("uid")
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized", nil)
		return
	}

	userId, _ := uid.(uint)
	if post.UserId != userId {
		utils.ErrorResponse(c, http.StatusUnauthorized, "not author", nil)
		return
	}

	post.Title = req.Title
	post.Description = req.Description
	post.Tags = req.Tags
	post.Twitter = req.Twitter

	if err := post.Update(); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update post", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", post)
}

func QueryPosts(c *gin.Context) {
	keyword := c.Query("keyword")
	// tag := c.Query("tag")
	userId, _ := strconv.Atoi(c.Query("user_id"))
	order := c.DefaultQuery("order", "desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "6"))

	filter := models.PostFilter{
		Keyword:   keyword,
		UserId:    uint(userId),
		OrderDesc: order == "desc",
		Page:      page,
		PageSize:  pageSize,
	}

	posts, total, err := models.QueryPosts(filter)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var response = QueryPostsResponse{
		Posts:    posts,
		Page:     page,
		PageSize: pageSize,
		Total:    total,
	}

	utils.SuccessResponse(c, http.StatusOK, "query success", response)
}
