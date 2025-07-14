package models

import "gorm.io/gorm"

type Feedback struct {
	gorm.Model
	Content string
	Url     string
	Email   string
	UserId  *uint `json:"user_id"`
	User    *User `gorm:"foreignKey:UserId" json:"user"`
}

func (f *Feedback) Create() error {
	return db.Create(f).Error
}

type FeedbackFilter struct {
	OrderDesc bool
	Page      int // 当前页码，从 1 开始
	PageSize  int // 每页数量，建议默认 10
}

func QueryFeedback(filter FeedbackFilter) ([]Feedback, int64, error) {
	var feedbacks []Feedback
	var total int64

	query := db.Preload("User").Model(&Feedback{})

	// 统计总数（不加 limit 和 offset）
	query.Count(&total)

	// 排序
	if filter.OrderDesc {
		query = query.Order("created_at desc")
	} else {
		query = query.Order("created_at asc")
	}

	// 分页
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 {
		filter.PageSize = 10
	}
	offset := (filter.Page - 1) * filter.PageSize
	query = query.Offset(offset).Limit(filter.PageSize)

	err := query.Find(&feedbacks).Error
	return feedbacks, total, err
}
