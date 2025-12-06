package models

import (
	"errors"
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	Title         string         `json:"title"`
	Description   string         `json:"description"`
	Content       string         `gorm:"type:text" json:"content"`
	SourceLink    string         `json:"source_link"`
	SourceType    string         `json:"source_type"`
	CoverImg      string         `json:"cover_img"`
	Tags          pq.StringArray `gorm:"type:text[]" json:"tags"`
	Category      string         `json:"category"`
	Author        string         `json:"author"`
	Translator    string         `json:"translator"`
	PublisherId   uint           `json:"publisher_id"`
	Publisher     *User          `gorm:"foreignKey:PublisherId" json:"publisher"`
	PublishTime   *time.Time     `json:"publish_time"`
	PublishStatus uint           `gorm:"default:1" json:"publish_status"` // 0:全部 1:待审核 2:已发布
	ViewCount     uint           `gorm:"default:0" json:"view_count"`
}

func (a *Article) Create() error {
	return db.Create(a).Error
}

func (a *Article) GetByID(id uint) error {
	if err := db.Preload("Publisher").First(a, id).Error; err != nil {
		return err
	}

	// 更新浏览量（+1）
	// TODO: handle in controller
	return db.Model(a).Update("view_count", gorm.Expr("view_count + ?", 1)).Error
}

func (a *Article) Update() error {
	if a.ID == 0 {
		return errors.New("missing Article ID")
	}
	return db.Save(a).Error
}

func (a *Article) Delete() error {
	if a.ID == 0 {
		return errors.New("missing Article ID")
	}
	return db.Delete(a).Error
}

type ArticleFilter struct {
	Keyword       string // 标题或描述关键词
	Tag           string // 包含某个 tag
	Author        string // 作者
	Category      string // 分类
	OrderDesc     bool   // 是否按发布时间排序
	PublishStatus int    // 发布状态
	PublisherId   int
	Page          int // 当前页码，从 1 开始
	PageSize      int // 每页数量，建议默认 10
}

func QueryArticles(filter ArticleFilter) ([]Article, int64, error) {
	var articles []Article
	var total int64

	query := db.Preload("Publisher").Model(&Article{})

	if filter.Keyword != "" {
		likePattern := "%" + filter.Keyword + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", likePattern, likePattern)
	}

	if filter.Tag != "" {
		query = query.Where("? = ANY (tags)", filter.Tag)
	}

	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}

	if filter.PublishStatus != 0 {
		query = query.Where("publish_status = ?", filter.PublishStatus)
	}

	if filter.PublisherId != 0 {
		query = query.Where("publisher_id = ?", filter.PublisherId)
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

	err := query.Find(&articles).Error
	return articles, total, err
}
