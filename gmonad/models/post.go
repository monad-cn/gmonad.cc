package models

import (
	"errors"
	"strings"
	"time"

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

type PostStats struct {
	TotalPosts      int64            `json:"total_posts"`
	ActiveUserCount int64            `json:"active_user_count"`
	WeeklyPostCount int64            `json:"weekly_post_count"`
	WeeklyHotPosts  []Post           `json:"weekly_hot_posts"`
	AllTimeHotPosts []Post           `json:"all_time_hot_posts"`
	TopActiveUsers  []ActiveUserStat `json:"top_active_users"`
}

type ActiveUserStat struct {
	ID        uint   `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	Avatar    string `json:"avatar"`
	PostCount int64  `json:"post_count"`
}

func GetPostStats(limit int) (*PostStats, error) {
	var stats PostStats
	var err error

	startOfWeek := time.Now().Truncate(24*time.Hour).AddDate(0, 0, -6)

	// 合并查询：总帖子数、本周帖子数、活跃用户数
	type result struct {
		TotalPosts  int64
		WeeklyPosts int64
		ActiveUsers int64
	}

	var res result
	err = db.Raw(`
			SELECT 
				(SELECT COUNT(*) FROM posts) AS total_posts,
				(SELECT COUNT(*) FROM posts WHERE created_at >= ?) AS weekly_posts,
				(SELECT COUNT(DISTINCT user_id) FROM posts) AS active_users
		`, startOfWeek).Scan(&res).Error
	if err != nil {
		return nil, err
	}

	stats.TotalPosts = res.TotalPosts
	stats.WeeklyPostCount = res.WeeklyPosts
	stats.ActiveUserCount = res.ActiveUsers

	// 获取本周热门帖子
	err = db.Preload("User").
		Where("created_at >= ?", startOfWeek).
		Order("view_count desc").
		Limit(limit).
		Find(&stats.WeeklyHotPosts).Error
	if err != nil {
		return nil, err
	}

	// 获取总热门帖子
	err = db.Preload("User").
		Order("view_count desc").
		Limit(limit).
		Find(&stats.AllTimeHotPosts).Error
	if err != nil {
		return nil, err
	}

	// 获取发帖最多的用户列表（活跃用户）
	err = db.Model(&User{}).
		Select("users.id, users.email, users.username, users.avatar, COUNT(posts.id) AS post_count").
		Joins("JOIN posts ON posts.user_id = users.id").
		Where("posts.deleted_at IS NULL").
		Group("users.id").
		Order("post_count DESC").
		Limit(limit).
		Scan(&stats.TopActiveUsers).Error
	if err != nil {
		return nil, err
	}

	return &stats, nil
}
