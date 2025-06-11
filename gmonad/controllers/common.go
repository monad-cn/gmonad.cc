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
}

type QueryEventsResponse struct {
	Events   []models.Event `json:"events"`
	Page     int            `json:"page"`
	PageSize int            `json:"page_size"`
	Total    int64          `json:"total"`
}
