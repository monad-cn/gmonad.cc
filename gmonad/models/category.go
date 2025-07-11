package models

import (
	"errors"
	"log"

	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	Name        string     `gorm:"type:varchar(50);not null" json:"name"`
	Desc        string     `json:"desc"`
	FullName    string     `json:"full_name"`
	IsOnlyMonad uint       `gorm:"default:0" json:"is_only_monad"` // 0: no, 1: yes
	ParentId    *uint      `gorm:"index" json:"parent_id"`         // 父分类ID（0表示顶层）
	Parent      *Category  `gorm:"foreignKey:ParentId;references:ID" json:"parent"`
	Children    []Category `gorm:"foreignKey:ParentId" json:"children"`
}

func (c *Category) Create() error {
	return db.Create(c).Error
}

func (c *Category) GetByID(id uint) error {
	return db.Preload("Children").First(c, id).Error
}

func (c *Category) Update() error {
	if c.ID == 0 {
		return errors.New("missing ID")
	}
	return db.Save(c).Error
}

func (c *Category) Delete() error {
	if c.ID == 0 {
		return errors.New("missing ID")
	}
	return db.Delete(c).Error
}

type CategoryFilter struct {
	Keyword   string
	ParentId  uint
	OrderDesc bool // 是否按创建时间倒序
	Page      int  // 当前页码，从 1 开始
	PageSize  int  // 每页数量，建议默认 10
}

func QueryCategories(filter CategoryFilter) ([]Category, int64, error) {
	var categories []Category
	var total int64

	query := db.Model(&Category{}).Preload("Children")

	if filter.Keyword != "" {
		likePattern := "%" + filter.Keyword + "%"
		query = query.Where("name LIKE ? OR desc LIKE ?", likePattern, likePattern)
	}

	if filter.ParentId == 0 { // 一级目录
		query = query.Where("parent_id is NULL")
	} else {
		// 具体查询
		query = query.Where("parent_id = ?", filter.ParentId)
	}

	// TODO: 二级目录

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

	err := query.Find(&categories).Error
	return categories, total, err
}

func InitCategories() {
	// 一级分类
	appCategory := "App"
	infraCategory := "Infra"

	// App 的子分类
	appSubCategories := []string{
		"AI", "Betting", "DeFi", "DePIN", "Gaming", "Governance",
		"NFT", "Other Apps", "Payments", "Prediction Market", "RWA", "Social",
	}

	// Infra 的子分类
	infraSubCategories := []string{
		"Account Abstraction", "Analytics", "Cross-Chain", "Dev Tooling", "Gaming Infra",
		"Identity", "Indexer", "Onramp", "Oracle", "Other Infra", "Privacy", "RPC", "Stablecoin", "Wallet", "Zero-Knowledge",
	}

	// 检查并创建 App
	var appCat Category
	if err := db.Where("name = ? ", appCategory).First(&appCat).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			appCat = Category{Name: appCategory}
			db.Create(&appCat)
			log.Println("Created category: App")
		} else {
			log.Fatalf("Query App category failed: %v", err)
		}
	}

	// 检查并创建 Infra
	var infraCat Category
	if err := db.Where("name = ? ", infraCategory).First(&infraCat).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			infraCat = Category{Name: infraCategory}
			db.Create(&infraCat)
			log.Println("Created category: Infra")
		} else {
			log.Fatalf("Query Infra category failed: %v", err)
		}
	}

	// 添加 App 的子分类
	for _, sub := range appSubCategories {
		var existSub Category
		if err := db.Where("name = ? AND parent_id = ?", sub, appCat.ID).First(&existSub).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				subCat := Category{Name: sub, ParentId: &appCat.ID, FullName: appCat.Name + "-" + sub}
				db.Create(&subCat)
				log.Printf("Created sub-category under App: %s", sub)
			} else {
				log.Fatalf("Query App sub-category failed: %v", err)
			}
		}
	}

	// 添加 Infra 的子分类
	for _, sub := range infraSubCategories {
		var existSub Category
		if err := db.Where("name = ? AND parent_id = ?", sub, infraCat.ID).First(&existSub).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				subCat := Category{Name: sub, ParentId: &infraCat.ID, FullName: infraCat.Name + "-" + sub}
				db.Create(&subCat)
				log.Printf("Created sub-category under Infra: %s", sub)
			} else {
				log.Fatalf("Query Infra sub-category failed: %v", err)
			}
		}
	}

	log.Println("Category initialization finished.")
}
