package controllers

import (
	"encoding/json"
	"fmt"
	"gmonad/models"
	"log"
)

// event
type CreateEventRequest struct {
	Title                string   `json:"title" binding:"required"`
	Desc                 string   `json:"desc" binding:"required"`
	EventMode            string   `json:"event_mode" binding:"required"`
	EventType            string   `json:"event_type" binding:"required"`
	Location             string   `json:"location"`
	Link                 string   `json:"link"`
	RegistrationLink     string   `json:"registration_link"`
	RegistrationDeadline string   `json:"registration_deadline"`
	StartTime            string   `json:"start_time" binding:"required"`
	EndTime              string   `json:"end_time" binding:"required"`
	CoverImg             string   `json:"cover_img" binding:"required"`
	Tags                 []string `json:"tags"`
	Twitter              string   `json:"twitter" binding:"required"`
}

type QueryEventsResponse struct {
	Events   []models.Event `json:"events"`
	Page     int            `json:"page"`
	PageSize int            `json:"page_size"`
	Total    int64          `json:"total"`
}

type UpdateEventRequest struct {
	Title                string   `json:"title" binding:"required"`
	Desc                 string   `json:"desc" binding:"required"`
	EventMode            string   `json:"event_mode" binding:"required"`
	EventType            string   `json:"event_type" binding:"required"`
	Location             string   `json:"location"`
	Link                 string   `json:"link"`
	StartTime            string   `json:"start_time" binding:"required"`
	EndTime              string   `json:"end_time" binding:"required"`
	CoverImg             string   `json:"cover_img" binding:"required"`
	Tags                 []string `json:"tags"`
	Twitter              string   `json:"twitter" binding:"required"`
	RegistrationLink     string   `json:"registration_link"`
	RegistrationDeadline string   `json:"registration_deadline"`
}

type UpdateEventPublishStatusRequest struct {
	PublishStatus uint `json:"publish_status"`
}

// login

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Username string `json:"username"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	models.User
	Permissions []string `json:"permissions"`
	Token       string   `json:"token"`
}

// OAUTH
type SignRequest struct {
	Code string `json:"code" binding:"required"`
}

type SignResponse struct {
	Token string `json:"token"`
}

type AccessTokenRequest struct {
	ClientId     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	Code         string `json:"code"`
}

// 定义响应的结构体
type AccessTokenResponse struct {
	Status int `json:"status"`
	Code   int `json:"code"`
	Data   struct {
		Token string `json:"token"`
	} `json:"data"`
	Time    int64  `json:"time"`
	Message string `json:"message"`
	ID      string `json:"id"`
}

// 定义数据部分的结构体
type UserData struct {
	Uid      uint   `json:"uid"`
	Avatar   string `json:"avatar"`
	UserName string `json:"user_name"`
	Email    string `json:"email"`
	Github   string `json:"github"`
}

// 定义顶层响应的结构体
type GetUserResponse struct {
	ID      string   `json:"id"`
	Status  int      `json:"status"`
	Code    int      `json:"code"`
	Data    UserData `json:"data"`
	Time    int64    `json:"time"`
	Message string   `json:"message"`
}

// article
type CreateArticleRequest struct {
	Title      string   `json:"title" binding:"required"`
	Desc       string   `json:"desc" binding:"required"`
	Content    string   `json:"content" binding:"required"`
	Category   string   `json:"category" binding:"required"`
	SourceLink string   `json:"source_link"`
	CoverImg   string   `json:"cover_img" binding:"required"`
	Tags       []string `json:"tags"`
	Author     string   `json:"author" binding:"required"`
	Translator string   `json:"translator"`
}

type QueryArticlesResponse struct {
	Blogs    []models.Article `json:"blogs"`
	Guides   []models.Article `json:"guides"`
	Page     int              `json:"page"`
	PageSize int              `json:"page_size"`
	Total    int64            `json:"total"`
}

type QueryBlogsResponse struct {
	Blogs    []models.Article `json:"blogs"`
	Page     int              `json:"page"`
	PageSize int              `json:"page_size"`
	Total    int64            `json:"total"`
}

type UpdateArticleRequest struct {
	Title      string   `json:"title" binding:"required"`
	Desc       string   `json:"desc" binding:"required"`
	Content    string   `json:"content" binding:"required"`
	Category   string   `json:"category" binding:"required"`
	SourceLink string   `json:"source_link"`
	CoverImg   string   `json:"cover_img" binding:"required"`
	Tags       []string `json:"tags"`
	Author     string   `json:"author" binding:"required"`
	Translator string   `json:"translator"`
}

type UpdateBlogPublishStatusRequest struct {
	PublishStatus uint `json:"publish_status"`
}

// statistic
type StatisticResponse struct {
	BlockNum     uint64 `json:"block_num"`
	AvgBlockTime string `json:"avg_block_time"`
	Validators   uint   `json:"validators"`
	Timestamp    int64  `json:"timestamp"`
}

func (s *StatisticResponse) ToSSE() string {
	data, err := json.Marshal(s)
	if err != nil {
		log.Println("json marshal error:", err)
		return ""
	}
	// 按照 SSE 协议格式：data: <json>\n\n
	return fmt.Sprintf("data: %s\n\n", data)
}

// Dapp
type CreateDappRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description" binding:"required"`
	X           string   `json:"x" binding:"required"`
	Logo        string   `json:"logo" binding:"required"`
	Site        string   `json:"site" binding:"required"`
	CoverImg    string   `json:"cover_img" binding:"required"`
	CategoryId  uint     `json:"category_id" binding:"required"`
	Tags        []string `json:"tags"`
}

type QueryDappsResponse struct {
	Dapps    []models.Dapp `json:"dapps"`
	Page     int           `json:"page"`
	PageSize int           `json:"page_size"`
	Total    int64         `json:"total"`
}

// category
type QueryCategoriesResponse struct {
	Categories []models.Category `json:"categories"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	Total      int64             `json:"total"`
}

// tutorial
type CreateTutorialRequest struct {
	Title      string   `json:"title" binding:"required"`
	Desc       string   `json:"desc" binding:"required"`
	Content    string   `json:"content" binding:"required"`
	Author     string   `json:"author" binding:"required"`
	DappId     uint     `json:"dapp_id"`
	SourceLink string   `json:"source_link"`
	CoverImg   string   `json:"cover_img" binding:"required"`
	Tags       []string `json:"tags"`
}

type QueryTutorialsResponse struct {
	Tutorials []models.Tutorial `json:"tutorials"`
	Page      int               `json:"page"`
	PageSize  int               `json:"page_size"`
	Total     int64             `json:"total"`
}

type UpdateTutorialRequest struct {
	Title      string   `json:"title" binding:"required"`
	Desc       string   `json:"desc" binding:"required"`
	Content    string   `json:"content" binding:"required"`
	Author     string   `json:"author" binding:"required"`
	DappId     uint     `json:"dapp_id"`
	SourceLink string   `json:"source_link"`
	CoverImg   string   `json:"cover_img" binding:"required"`
	Tags       []string `json:"tags"`
}

type UpdateTutorialPublishStatusRequest struct {
	PublishStatus uint `json:"publish_status" binding:"required"`
}

// feedback
type CreateFeedbackRequest struct {
	Content string `json:"content" binding:"required"`
	Url     string `json:"url"`
	Email   string `json:"email"`
}

type QueryFeedbackResponse struct {
	Feedbacks []models.Feedback `json:"feedbacks"`
	Page      int               `json:"page"`
	PageSize  int               `json:"page_size"`
	Total     int64             `json:"total"`
}

// Post
type CreatePostRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Tags        []string `json:"tags"`
	Twitter     string   `json:"twitter"`
}

type UpdatePostRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Tags        []string `json:"tags"`
	Twitter     string   `json:"twitter" binding:"required"`
}

type QueryPostsResponse struct {
	Posts    []models.Post `json:"posts"`
	Page     int           `json:"page"`
	PageSize int           `json:"page_size"`
	Total    int64         `json:"total"`
}

// recap
type CreateRecapRequest struct {
	Content   string `json:"content" binding:"required"`
	Video     string `json:"video"`
	Recording string `json:"recording"`
	Twitter   string `json:"twitter"`
	EventId   uint   `json:"event_id"`
}

type UpdateRecapRequest struct {
	Content   string `json:"content" binding:"required"`
	Video     string `json:"video"`
	Recording string `json:"recording"`
	Twitter   string `json:"twitter"`
}
