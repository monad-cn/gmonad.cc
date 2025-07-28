package models

import (
	"time"
	"errors"
	"strings"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Twitter     string         `json:"twitter"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	ViewCount   uint           `json:"view_count"`
	UserId      uint           `json:"user_id"`
	User        *User          `gorm:"foreignKey:UserId" json:"user"`
}

func (p *Post) Create() error {
	return db.Create(p).Error
}

func (p *Post) GetByID(id uint) error {
	if err := db.Preload("User").First(p, id).Error; err != nil {
		return err
	}
	return db.Model(p).Update("view_count", gorm.Expr("view_count + ?", 1)).Error
}

func (p *Post) Update() error {
	if p.ID == 0 {
		return errors.New("missing ID")
	}
	return db.Save(p).Error
}

func (p *Post) Delete() error {
	if p.ID == 0 {
		return errors.New("missing ID")
	}
	return db.Delete(p).Error
}

type PostFilter struct {
	Keyword   string
	UserId    uint
	StartDate *time.Time
	EndDate   *time.Time
	OrderDesc bool
	Page      int
	PageSize  int
}

func QueryPosts(filter PostFilter) ([]Post, int64, error) {
	var posts []Post
	var total int64

	query := db.Preload("User").Model(&Post{}).Joins("LEFT JOIN users ON users.id = posts.user_id")

	if filter.Keyword != "" {
		likePattern := "%" + strings.ToLower(filter.Keyword) + "%"
		query = query.Where(`
        LOWER(posts.title) LIKE ? OR
        LOWER(posts.description) LIKE ? OR
        LOWER(users.username) LIKE ?
    `, likePattern, likePattern, likePattern)
	}

	if filter.UserId != 0 {
		query = query.Where("user_id = ?", filter.UserId)
	}

	if filter.StartDate != nil {
		query = query.Where("posts.created_at BETWEEN ? AND ?", filter.StartDate, filter.EndDate)
	}

	// 统计总数（不加 limit 和 offset）
	query.Count(&total)

	// 排序
	if filter.OrderDesc {
		query = query.Order("created_at desc")
	} else {
		query = query.Order("created_at asc")
	}

	query = query.Order("view_count desc")

	// 分页
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 {
		filter.PageSize = 10
	}
	offset := (filter.Page - 1) * filter.PageSize
	query = query.Offset(offset).Limit(filter.PageSize)

	err := query.Find(&posts).Error
	return posts, total, err
}
