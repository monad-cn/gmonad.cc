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
	Category    Category       `gorm:"foreignKey:CategoryId" json:"category"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	UserId      uint           `json:"user_id"`
	User        User           `gorm:"foreignKey:UserId"`
}

func (d *Dapp) Create() error {
	return db.Create(d).Error
}

func (d *Dapp) GetByID(id uint) error {
	return db.Preload("Category").First(d, id).Error
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
	Keyword   string
	Tag       string
	Category  string
	OrderDesc bool // 是否按创建时间倒序
	Page      int  // 当前页码，从 1 开始
	PageSize  int  // 每页数量，建议默认 10
}

func QueryDapps(filter DappFilter) ([]Dapp, int64, error) {
	var dapps []Dapp
	var total int64

	query := db.Preload("Category").Model(&Dapp{})

	if filter.Keyword != "" {
		likePattern := "%" + filter.Keyword + "%"
		query = query.Where("name LIKE ? OR description LIKE ?", likePattern, likePattern)
	}

	if filter.Tag != "" {
		query = query.Where("? = ANY (tags)", filter.Tag)
	}

	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
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
