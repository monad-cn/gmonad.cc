package models

import (
	"errors"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Dapp struct {
	gorm.Model
	Name        string         `json:"name"`
	Description string         `json:"description"`
	X           string         `json:"x"`
	Logo        string         `json:"logo"`
	Site        string         `json:"site"`
	CoverImg    string         `json:"cover_img"`
	CategoryId  uint           `json:"category_id"`
	Category    *Category      `gorm:"foreignKey:CategoryId" json:"category"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	UserId      uint           `json:"user_id"`
	User        *User          `gorm:"foreignKey:UserId"`
	Tutorials   []Tutorial     `gorm:"foreignKey:DappId" json:"tutorials"`
	IsFeature   uint           `gorm:"default:2" json:"is_feature"` // 0: all 1: 是 2:不是
}

func (d *Dapp) Create() error {
	return db.Create(d).Error
}

func (d *Dapp) GetByID() error {
	return db.Preload("Tutorials").Preload("Category").First(d, d.ID).Error
}

func (d *Dapp) Update() error {
	if d.ID == 0 {
		return errors.New("missing Dapp ID")
	}
	return db.Save(d).Error
}

func (d *Dapp) Delete() error {
	if d.ID == 0 {
		return errors.New("missing event ID")
	}
	return db.Delete(d).Error
}

type DappFilter struct {
	Keyword        string
	Tag            string
	MainCategories []uint
	SubCategories  []uint
	IsFeature      uint
	OrderDesc      bool // 是否按创建时间倒序
	Page           int  // 当前页码，从 1 开始
	PageSize       int  // 每页数量，建议默认 10
}

func QueryDapps(filter DappFilter) ([]Dapp, int64, error) {
	var dapps []Dapp
	var total int64

	query := db.Preload("Tutorials").Preload("Category").Model(&Dapp{})

	if len(filter.MainCategories) > 0 {
		query = query.Joins("JOIN categories ON categories.id = dapps.category_id").
			Where("categories.parent_id IN ?", filter.MainCategories)
	}

	if len(filter.SubCategories) > 0 {
		query = query.Where("dapps.category_id IN ?", filter.SubCategories)
	}

	if filter.Keyword != "" {
		likePattern := "%" + filter.Keyword + "%"
		query = query.Where("name LIKE ? OR description LIKE ?", likePattern, likePattern)
	}

	if filter.Tag != "" {
		query = query.Where("? = ANY (tags)", filter.Tag)
	}

	if filter.IsFeature != 0 {
		query = query.Where("is_feature = ?", filter.IsFeature)
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

	err := query.Find(&dapps).Error
	return dapps, total, err
}
