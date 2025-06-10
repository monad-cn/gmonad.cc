package models

import (
	"errors"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Categary    string         `json:"categary"`
	Location    string         `json:"location"`
	Link        string         `json:"link"`
	StartTime   time.Time      `json:"start_time"`
	EndTime     time.Time      `json:"end_time"`
	CoverImg    string         `json:"cover_img"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
}

func (e *Event) Create() error {
	return db.Create(e).Error
}

func (e *Event) GetByID(id uint) error {
	return db.First(e, id).Error
}

func (e *Event) Update() error {
	if e.ID == 0 {
		return errors.New("missing event ID")
	}
	return db.Save(e).Error
}

func (e *Event) Delete() error {
	if e.ID == 0 {
		return errors.New("missing event ID")
	}
	return db.Delete(e).Error
}

type EventFilter struct {
	Keyword   string // 标题或描述关键词
	Tag       string // 包含某个 tag
	OrderDesc bool   // 是否按创建时间倒序
	Page      int    // 当前页码，从 1 开始
	PageSize  int    // 每页数量，建议默认 10
}

func QueryEvents(filter EventFilter) ([]Event, int64, error) {
	var events []Event
	var total int64

	query := db.Model(&Event{})

	if filter.Keyword != "" {
		likePattern := "%" + filter.Keyword + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", likePattern, likePattern)
	}

	if filter.Tag != "" {
		query = query.Where("? = ANY (tags)", filter.Tag)
	}

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

	err := query.Find(&events).Error
	return events, total, err
}
