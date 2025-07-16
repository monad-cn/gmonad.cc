package models

import (
	"errors"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Tutorial struct {
	gorm.Model
	Title         string         `json:"title"`
	Description   string         `json:"description"`
	Content       string         `gorm:"type:text" json:"content"`
	SourceLink    string         `json:"source_link"`
	CoverImg      string         `json:"cover_img"`
	Tags          pq.StringArray `gorm:"type:text[]" json:"tags"`
	Author        string         `json:"author"`
	PublisherId   uint           `json:"publisher_id"`
	Publisher     *User          `gorm:"foreignKey:PublisherId" json:"publisher"`
	PublishTime   *time.Time     `json:"publish_time"`
	PublishStatus uint           `gorm:"default:1" json:"publish_status"` // 0:全部 1:待审核 2:已发布
	DappId        *uint          `json:"dapp_id"`
	Dapp          *Dapp          `gorm:"foreignKey:DappId" json:"dapp"`
	ViewCount     uint           `gorm:"default:0" json:"view_count"`
}

func (t *Tutorial) Create() error {
	return db.Create(t).Error
}

func (t *Tutorial) GetByID() error {
	if err := db.Preload("Publisher").Preload("Dapp").First(t, t.ID).Error; err != nil {
		return err
	}

	// 更新浏览量（+1）
	// TODO: handle in controller
	return db.Model(t).Update("view_count", gorm.Expr("view_count + ?", 1)).Error
}

func (t *Tutorial) Update() error {
	if t.ID == 0 {
		return errors.New("missing Tutorial ID")
	}
	return db.Save(t).Error
}

func (t *Tutorial) Delete() error {
	if t.ID == 0 {
		return errors.New("missing Tutorial ID")
	}
	return db.Delete(t).Error
}

type TutorialFilter struct {
	Keyword       string // 标题或描述关键词
	Tag           string // 包含某个 tag
	DappId        uint
	PublisherId   int
	OrderDesc     bool // 是否按发布时间排序
	PublishStatus int  // 发布状态
	Page          int  // 当前页码，从 1 开始
	PageSize      int  // 每页数量，建议默认 10
}

func QueryTutorials(filter TutorialFilter) ([]Tutorial, int64, error) {
	var tutorials []Tutorial
	var total int64

	query := db.Preload("Dapp").Model(&Tutorial{})

	if filter.Keyword != "" {
		likePattern := "%" + filter.Keyword + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", likePattern, likePattern)
	}

	if filter.Tag != "" {
		query = query.Where("? = ANY (tags)", filter.Tag)
	}

	if filter.DappId != 0 {
		query = query.Where("dapp_id = ?", filter.DappId)
	}

	if filter.PublisherId != 0 {
		query = query.Where("publisher_id = ?", filter.PublisherId)
	}

	if filter.PublishStatus != 0 {
		query = query.Where("publish_status = ?", filter.PublishStatus)
	}

	// 统计总数（不加 limit 和 offset）
	query.Count(&total)

	// 排序
	if filter.OrderDesc {
		query = query.Order("publish_time desc")
	} else {
		query = query.Order("publish_time asc")
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

	err := query.Find(&tutorials).Error
	return tutorials, total, err
}
