package controllers

import (
	"gmonad/models"
	"gmonad/utils"
	"net/http"
	"strconv"
	"strings"
	"time"

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

	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	filter := models.PostFilter{
		Keyword:   keyword,
		UserId:    uint(userId),
		OrderDesc: order == "desc",
		Page:      page,
		PageSize:  pageSize,
	}

	uid, ok := c.Get("uid")
	if ok {
		userId, _ := uid.(uint)
		filter.FollowingOf = userId
		filter.Hybrid = true
	}

	var start, end time.Time
	start, _ = time.Parse("2006-01-02", startDate)
	end, _ = time.Parse("2006-01-02", endDate)

	if !start.IsZero() && !end.IsZero() {
		newEnd := end.AddDate(0, 0, 1)
		filter.StartDate = &start
		filter.EndDate = &newEnd
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

func PostsStats(c *gin.Context) {
	stats, err := models.GetPostStats(6)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "query success", stats)
}

// 点赞
func LikePost(c *gin.Context) {
	idParam := c.Param("id")
	postId, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	userId := c.GetUint("uid")
	if err := models.LikePost(uint(postId), userId); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "like success", nil)
}

// 取消点赞
func UnlikePost(c *gin.Context) {
	idParam := c.Param("id")
	postId, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	userId := c.GetUint("uid")
	if err := models.UnlikePost(uint(postId), userId); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "unlike success", nil)
}

// 收藏
func FavoritePost(c *gin.Context) {
	idParam := c.Param("id")
	postId, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	userId := c.GetUint("uid")
	if err := models.FavoritePost(uint(postId), userId); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "favorite success", nil)
}

// 取消收藏
func UnfavoritePost(c *gin.Context) {
	idParam := c.Param("id")
	postId, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid ID", nil)
		return
	}

	userId := c.GetUint("uid")
	if err := models.UnfavoritePost(uint(postId), userId); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "unfavorite success", nil)
}

type PostStatus struct {
	PostID    uint `json:"post_id"`
	Liked     bool `json:"liked"`
	Favorited bool `json:"favorited"`
}

type PostStatusResponse struct {
	Status   []PostStatus `json:"status"`
	Followed []uint       `json:"followed"`
}

func GetPostStatus(c *gin.Context) {
	idsStr := c.Query("ids")
	if idsStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "ids parameter required", nil)
		return
	}

	idStrs := strings.Split(idsStr, ",")
	var postIDs []uint
	for _, s := range idStrs {
		id64, err := strconv.ParseUint(strings.TrimSpace(s), 10, 64)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "invalid id: "+s, nil)
			return
		}
		postIDs = append(postIDs, uint(id64))
	}

	userID := c.GetUint("uid")

	status, err := models.GetUserPostStatuses(userID, postIDs)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	likedSet := make(map[uint]bool, len(status.Liked))
	for _, id := range status.Liked {
		likedSet[id] = true
	}

	favoritedSet := make(map[uint]bool, len(status.Favorited))
	for _, id := range status.Favorited {
		favoritedSet[id] = true
	}

	following, err := models.GetUserFollowStatusForPosts(userID, postIDs)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to get follow status", nil)
		return
	}

	var respStatus []PostStatus
	for _, pid := range postIDs {
		respStatus = append(respStatus, PostStatus{
			PostID:    pid,
			Liked:     likedSet[pid],
			Favorited: favoritedSet[pid],
		})
	}

	resp := PostStatusResponse{
		Status:   respStatus,
		Followed: following,
	}

	utils.SuccessResponse(c, http.StatusOK, "get success", resp)
}
