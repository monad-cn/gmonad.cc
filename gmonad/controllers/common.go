package controllers

type CreateEventRequest struct {
	Title     string   `json:"title" binding:"required"`
	Desc      string   `json:"desc" binding:"required"`
	Categary  string   `json:"categary" binding:"required"`
	Location  string   `json:"location"`
	Link      string   `json:"link"`
	StartTime string   `json:"start_time" binding:"required"`
	EndTime   string   `json:"end_time" binding:"required"`
	CoverImg  string   `json:"cover_img" binding:"required"`
	Tags      []string `json:"tags"`
}

type QueryEventsResponse struct {
	Data     interface{} `json:"data"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
	Total    int64       `json:"total"`
}
