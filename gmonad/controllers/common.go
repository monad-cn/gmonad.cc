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
}
