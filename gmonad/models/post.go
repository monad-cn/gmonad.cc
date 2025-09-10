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
	Title         string         `json:"title"`
	Description   string         `json:"description"`
	Twitter       string         `json:"twitter"`
	Tags          pq.StringArray `gorm:"type:text[]" json:"tags"`
	ViewCount     uint           `json:"view_count"`
	UserId        uint           `json:"user_id"`
	User          *User          `gorm:"foreignKey:UserId" json:"user"`
	LikeCount     uint           `json:"like_count"`
	FavoriteCount uint           `json:"favorite_count"`
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

	Page      int
	PageSize  int
	OrderDesc bool

	// ------------------------
	// Hybrid Feed
	// ------------------------
	Hybrid      bool // true 表示混合流模式（关注流 + 自然流）
	FollowingOf uint // 当前登录用户 ID，用于查询关注流
}

func QueryPosts(filter PostFilter) ([]Post, int64, error) {
	var posts []Post
	var total int64

	// 分页 limit
	pageSize := filter.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	page := filter.Page
	if page < 1 {
		page = 1
	}

	// 判断是否 hybrid 模式（关注流 + 自然流混合）
	if filter.Hybrid && filter.FollowingOf != 0 {
		// 70%关注流，30%自然流
		followLimit := int(float64(pageSize) * 0.7)

		// 查询关注流
		var followPosts []Post
		followQuery := db.Preload("User").Model(&Post{}).Joins("LEFT JOIN users ON users.id = posts.user_id")
		if filter.Keyword != "" {
			likePattern := "%" + strings.ToLower(filter.Keyword) + "%"
			followQuery = followQuery.Where(`
				LOWER(posts.title) LIKE ? OR
				LOWER(posts.description) LIKE ? OR
				LOWER(users.username) LIKE ?
			`, likePattern, likePattern, likePattern)
		}
		if filter.UserId != 0 {
			followQuery = followQuery.Where("user_id = ?", filter.UserId)
		}
		if filter.StartDate != nil {
			followQuery = followQuery.Where("posts.created_at BETWEEN ? AND ?", filter.StartDate, filter.EndDate)
		}
		followQuery = followQuery.Where("posts.user_id IN (?)",
			db.Model(&Follow{}).Select("following_id").Where("follower_id = ?", filter.FollowingOf),
		)
		followQuery = followQuery.Order("created_at desc").Order("view_count desc").Limit(50)
		if err := followQuery.Find(&followPosts).Error; err != nil {
			return nil, 0, err
		}

		// 查询自然流
		var globalPosts []Post
		globalQuery := db.Preload("User").Model(&Post{}).Joins("LEFT JOIN users ON users.id = posts.user_id")
		if filter.Keyword != "" {
			likePattern := "%" + strings.ToLower(filter.Keyword) + "%"
			globalQuery = globalQuery.Where(`
				LOWER(posts.title) LIKE ? OR
				LOWER(posts.description) LIKE ? OR
				LOWER(users.username) LIKE ?
			`, likePattern, likePattern, likePattern)
		}
		if filter.UserId != 0 {
			globalQuery = globalQuery.Where("user_id = ?", filter.UserId)
		}
		if filter.StartDate != nil {
			globalQuery = globalQuery.Where("posts.created_at BETWEEN ? AND ?", filter.StartDate, filter.EndDate)
		}
		globalQuery = globalQuery.Where("posts.user_id NOT IN (?)",
			db.Model(&Follow{}).Select("following_id").Where("follower_id = ?", filter.FollowingOf),
		)
		globalQuery = globalQuery.Order("created_at desc").Order("view_count desc").Limit(50)
		if err := globalQuery.Find(&globalPosts).Error; err != nil {
			return nil, 0, err
		}

		// 按比例混合
		fIdx, gIdx := 0, 0
		for len(posts) < pageSize {
			if fIdx < len(followPosts) && len(posts) < followLimit {
				posts = append(posts, followPosts[fIdx])
				fIdx++
			}
			if gIdx < len(globalPosts) && len(posts) < pageSize {
				posts = append(posts, globalPosts[gIdx])
				gIdx++
			}
			if fIdx >= len(followPosts) && gIdx >= len(globalPosts) {
				break
			}
		}

		// 统计总数（可选，近似值）
		total = int64(len(posts))
		return posts, total, nil
	}

	// 非 hybrid 模式，原有逻辑
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

	// 统计总数
	query.Count(&total)

	// 排序
	if filter.OrderDesc {
		query = query.Order("created_at desc")
	} else {
		query = query.Order("created_at asc")
	}
	query = query.Order("view_count desc")

	// 分页
	offset := (page - 1) * pageSize
	query = query.Offset(offset).Limit(pageSize)

	err := query.Find(&posts).Error
	return posts, total, err
}

// func QueryPosts(filter PostFilter) ([]Post, int64, error) {
// 	var posts []Post
// 	var total int64

// 	query := db.Preload("User").Model(&Post{}).Joins("LEFT JOIN users ON users.id = posts.user_id")

// 	if filter.Keyword != "" {
// 		likePattern := "%" + strings.ToLower(filter.Keyword) + "%"
// 		query = query.Where(`
//         LOWER(posts.title) LIKE ? OR
//         LOWER(posts.description) LIKE ? OR
//         LOWER(users.username) LIKE ?
//     `, likePattern, likePattern, likePattern)
// 	}

// 	if filter.UserId != 0 {
// 		query = query.Where("user_id = ?", filter.UserId)
// 	}

// 	if filter.StartDate != nil {
// 		query = query.Where("posts.created_at BETWEEN ? AND ?", filter.StartDate, filter.EndDate)
// 	}

// 	// 统计总数（不加 limit 和 offset）
// 	query.Count(&total)

// 	// 排序
// 	if filter.OrderDesc {
// 		query = query.Order("created_at desc")
// 	} else {
// 		query = query.Order("created_at asc")
// 	}

// 	query = query.Order("view_count desc")

// 	// 分页
// 	if filter.Page < 1 {
// 		filter.Page = 1
// 	}
// 	if filter.PageSize <= 0 {
// 		filter.PageSize = 10
// 	}
// 	offset := (filter.Page - 1) * filter.PageSize
// 	query = query.Offset(offset).Limit(filter.PageSize)

// 	err := query.Find(&posts).Error
// 	return posts, total, err
// }

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

type PostLike struct {
	gorm.Model
	PostID uint `gorm:"uniqueIndex:idx_user_post;not null"`
	UserID uint `gorm:"uniqueIndex:idx_user_post;not null"`
}

type PostFavorite struct {
	gorm.Model
	PostID uint `gorm:"uniqueIndex:idx_user_post_favorite;not null"`
	UserID uint `gorm:"uniqueIndex:idx_user_post_favorite;not null"`
}

// 点赞
func LikePost(postID, userID uint) error {
	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	var like PostLike
	err := tx.Unscoped().
		Where("post_id = ? AND user_id = ?", postID, userID).
		First(&like).Error
	if err == nil {
		if like.DeletedAt.Valid {
			// 恢复软删除记录
			err = tx.Unscoped().Model(&like).Update("deleted_at", nil).Error
			if err != nil {
				tx.Rollback()
				return err
			}

			err = tx.Model(&Post{}).
				Where("id = ?", postID).
				UpdateColumn("like_count", gorm.Expr("like_count + ?", 1)).Error
			if err != nil {
				tx.Rollback()
				return err
			}

			return tx.Commit().Error
		}

		// 已点赞
		tx.Rollback()
		return errors.New("already liked")
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return err
	}

	// 新建点赞记录
	like = PostLike{PostID: postID, UserID: userID}
	err = tx.Create(&like).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Model(&Post{}).
		Where("id = ?", postID).
		UpdateColumn("like_count", gorm.Expr("like_count + ?", 1)).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// 取消点赞
func UnlikePost(postID, userID uint) error {
	res := db.Where("post_id = ? AND user_id = ?", postID, userID).Delete(&PostLike{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected > 0 {
		if err := db.Model(&Post{}).
			Where("id = ?", postID).
			UpdateColumn("like_count", gorm.Expr("like_count - ?", 1)).Error; err != nil {
			return err
		}
	}
	return nil
}

// 收藏
func FavoritePost(postID, userID uint) error {
	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	var fav PostFavorite
	err := tx.Unscoped().
		Where("post_id = ? AND user_id = ?", postID, userID).
		First(&fav).Error
	if err == nil {
		if fav.DeletedAt.Valid {
			err = tx.Unscoped().Model(&PostFavorite{}).
				Where("id = ?", fav.ID).
				Update("deleted_at", nil).Error
			if err != nil {
				tx.Rollback()
				return err
			}

			err = tx.Model(&Post{}).
				Where("id = ?", postID).
				UpdateColumn("favorite_count", gorm.Expr("favorite_count + ?", 1)).Error
			if err != nil {
				tx.Rollback()
				return err
			}

			return tx.Commit().Error
		}

		tx.Rollback()
		return errors.New("already favorited")
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return err
	}

	fav = PostFavorite{PostID: postID, UserID: userID}
	err = tx.Create(&fav).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Model(&Post{}).
		Where("id = ?", postID).
		UpdateColumn("favorite_count", gorm.Expr("favorite_count + ?", 1)).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// 取消收藏
func UnfavoritePost(postID, userID uint) error {
	res := db.Where("post_id = ? AND user_id = ?", postID, userID).
		Delete(&PostFavorite{})
	if res.Error != nil {
		return res.Error
	}

	if res.RowsAffected > 0 {
		if err := db.Model(&Post{}).
			Where("id = ?", postID).
			UpdateColumn("favorite_count", gorm.Expr("favorite_count - ?", 1)).Error; err != nil {
			return err
		}
	}

	return nil
}

type PostStatus struct {
	Liked     []uint
	Favorited []uint
}

// 获取用户对一组帖子ID的点赞和收藏状态
func GetUserPostStatuses(userID uint, postIDs []uint) (PostStatus, error) {
	var likedPostIDs []uint
	if err := db.Model(&PostLike{}).
		Where("user_id = ? AND post_id IN ?", userID, postIDs).
		Pluck("post_id", &likedPostIDs).Error; err != nil {
		return PostStatus{}, err
	}

	var favoritedPostIDs []uint
	if err := db.Model(&PostFavorite{}).
		Where("user_id = ? AND post_id IN ?", userID, postIDs).
		Pluck("post_id", &favoritedPostIDs).Error; err != nil {
		return PostStatus{}, err
	}

	return PostStatus{
		Liked:     likedPostIDs,
		Favorited: favoritedPostIDs,
	}, nil

}

// 查询用户是否关注了这些帖子作者
func GetUserFollowStatusForPosts(userID uint, postIDs []uint) ([]uint, error) {
	// 查出作者ID
	var authorIDs []uint
	if err := db.Model(&Post{}).
		Where("id IN ?", postIDs).
		Pluck("user_id", &authorIDs).Error; err != nil {
		return nil, err
	}

	// 去重
	authorMap := make(map[uint]struct{})
	for _, id := range authorIDs {
		authorMap[id] = struct{}{}
	}
	uniqueAuthors := make([]uint, 0, len(authorMap))
	for id := range authorMap {
		uniqueAuthors = append(uniqueAuthors, id)
	}

	// 查询是否关注
	var following []uint
	if len(uniqueAuthors) > 0 {
		if err := db.Model(&Follow{}).
			Where("follower_id = ? AND following_id IN ?", userID, uniqueAuthors).
			Pluck("following_id", &following).Error; err != nil {
			return nil, err
		}
	}

	return following, nil
}
