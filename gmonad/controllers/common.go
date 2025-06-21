package controllers

import "gmonad/models"

type CreateEventRequest struct {
	Title     string   `json:"title" binding:"required"`
	Desc      string   `json:"desc" binding:"required"`
	EventMode string   `json:"event_mode" binding:"required"`
	Location  string   `json:"location"`
	Link      string   `json:"link"`
	StartTime string   `json:"start_time" binding:"required"`
	EndTime   string   `json:"end_time" binding:"required"`
	CoverImg  string   `json:"cover_img" binding:"required"`
	Tags      []string `json:"tags"`
	Twitter   string   `json:"twitter" binding:"required"`
}

type QueryEventsResponse struct {
	Events   []models.Event `json:"events"`
	Page     int            `json:"page"`
	PageSize int            `json:"page_size"`
	Total    int64          `json:"total"`
}

type UpdateEventRequest struct {
	Title     string   `json:"title" binding:"required"`
	Desc      string   `json:"desc" binding:"required"`
	EventMode string   `json:"event_mode" binding:"required"`
	Location  string   `json:"location"`
	Link      string   `json:"link"`
	StartTime string   `json:"start_time" binding:"required"`
	EndTime   string   `json:"end_time" binding:"required"`
	CoverImg  string   `json:"cover_img" binding:"required"`
	Tags      []string `json:"tags"`
	Twitter   string   `json:"twitter" binding:"required"`
}

type UpdateEventPublishStatusRequest struct {
	PublishStatus uint `json:"publish_status"`
}

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
