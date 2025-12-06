package models

import (
	"errors"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Title                string         `json:"title"`
	Description          string         `json:"description"`
	EventMode            string         `json:"event_mode"`
	EventType            string         `json:"event_type"`
	Location             string         `json:"location"`
	Link                 string         `json:"link"`
	RegistrationDeadline *time.Time     `json:"registration_deadline"`
	RegistrationLink     string         `json:"registration_link"`
	StartTime            time.Time      `json:"start_time"`
	EndTime              time.Time      `json:"end_time"`
	CoverImg             string         `json:"cover_img"`
	Tags                 pq.StringArray `gorm:"type:text[]" json:"tags"`
	Participants         uint           `json:"participants"`
	Status               uint           `gorm:"default:0" json:"status"`         // 0: 未开始，1: 进行中 2: 已结束 TODO: 定时器更新状态？
	PublishStatus        uint           `gorm:"default:1" json:"publish_status"` // 0: 所有  1: 待审核 2: 已发布
	PublishTime          *time.Time     `json:"publish_time"`
	Twitter              string         `json:"twitter"`
	UserId               uint           `json:"user_id"`
	User                 *User          `gorm:"foreignKey:UserId"`
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
	Keyword       string // 标题或描述关键词
	Tag           string // 包含某个 tag
	Location      string
	EventMode     string
	EventType     string
	OrderDesc     bool // 是否按创建时间倒序
	Page          int  // 当前页码，从 1 开始
	PageSize      int  // 每页数量，建议默认 10
	Status        int
	PublishStatus int
	StartDate     *time.Time
	EndDate       *time.Time
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

	if filter.EventMode != "" {
		query = query.Where("event_mode = ?", filter.EventMode)
	}

	if filter.EventType != "" {
		query = query.Where("event_type = ?", filter.EventType)
	}

	if filter.Status != 3 {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.PublishStatus != 0 {
		query = query.Where("publish_status = ?", filter.PublishStatus)
	}

	if filter.Location != "" {
		query = query.Where("location LIKE  ?", "%"+filter.Location+"%")
	}

	if filter.StartDate != nil {
		query = query.Where("events.created_at BETWEEN ? AND ?", filter.StartDate, filter.EndDate)
	}

	// 统计总数（不加 limit 和 offset）
	query.Count(&total)

	// 排序
	if filter.OrderDesc {
		query = query.Order("start_time desc")
	} else {
		query = query.Order("start_time asc")
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
