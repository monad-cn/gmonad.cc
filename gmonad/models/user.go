package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string    `gorm:"unique;not null" json:"email"`
	Username string    `json:"username"`
	Avatar   string    `json:"avatar"`
	Github   string    `json:"github"`
	Twitter  string    `json:"twitter"`
	Uid      uint      `json:"-"` // OAUTH
	RoleID   uint      `json:"-"`
	Role     *Role     `gorm:"foreignKey:RoleID" json:"-"`
	Events   []Event   `gorm:"foreignKey:UserId" json:"events"`
	Articles []Article `gorm:"foreignKey:PublisherId"  json:"articles"`
	Posts    []Post    `gorm:"foreignKey:UserId" json:"posts"`
}

func GetUserByUid(uid uint) (*User, error) {
	var u User
	if err := db.Where("uid = ?", uid).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func GetUserById(id uint) (*User, error) {
	var u User
	if err := db.Where("id = ?", id).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func CreateUser(u *User) error {
	var role Role
	if err := db.Where("name = ?", "content_creator").First(&role).Error; err != nil {
		return err
	}

	// 设置默认角色 ID
	u.RoleID = role.ID

	if err := db.Create(u).Error; err != nil {
		return err
	}
	return nil
}

func UpdateUser(u *User) error {
	if err := db.Save(u).Error; err != nil {
		return err
	}
	return nil
}

func GetUserByEmail(u *User) error {
	if err := db.Where("email = ?", u.Email).First(u).Error; err != nil {
		return err
	}
	return nil
}

func GetUserWithPermissions(uid uint) ([]string, error) {
	var user User
	err := db.Preload("Role").
		Preload("Role.Permissions").
		Preload("Role.PermissionGroups.Permissions").
		First(&user, uid).Error
	if err != nil {
		return nil, err
	}

	permSet := map[string]struct{}{}

	// 角色直接权限
	for _, p := range user.Role.Permissions {
		permSet[p.Name] = struct{}{}
	}

	// 权限组权限
	for _, pg := range user.Role.PermissionGroups {
		for _, p := range pg.Permissions {
			permSet[p.Name] = struct{}{}
		}
	}

	perms := make([]string, 0, len(permSet))
	for name := range permSet {
		perms = append(perms, name)
	}
	return perms, nil
}

type Follow struct {
	gorm.Model
	FollowerID  uint `gorm:"not null;index" json:"follower_id"`  // 关注者
	FollowingID uint `gorm:"not null;index" json:"following_id"` // 被关注者

	Follower  User `gorm:"foreignKey:FollowerID" json:"follower"`
	Following User `gorm:"foreignKey:FollowingID" json:"following"`
}

// 关注
func FollowUser(followerID, followingID uint) error {
	follow := Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}
	return db.Create(&follow).Error
}

// 取消关注
func UnfollowUser(followerID, followingID uint) error {
	return db.Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Delete(&Follow{}).Error
}

// 检查是否已关注
func IsFollowing(followerID, followingID uint) (bool, error) {
	var follow Follow
	err := db.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&follow).Error
	if err == gorm.ErrRecordNotFound {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

type FollowState struct {
	UserID      uint `json:"user_id"`
	IsFollowing bool `json:"is_following"`
}

// 批量检查是否关注
func GetFollowingStates(followerID uint, userIDs []uint) ([]FollowState, error) {
	// 默认全部 false
	states := make([]FollowState, 0, len(userIDs))
	stateMap := make(map[uint]bool, len(userIDs))
	for _, id := range userIDs {
		stateMap[id] = false
	}

	// 查找已关注的
	var follows []Follow
	if err := db.Where("follower_id = ? AND following_id IN ?", followerID, userIDs).
		Find(&follows).Error; err != nil {
		return nil, err
	}

	for _, f := range follows {
		stateMap[f.FollowingID] = true
	}

	// 转换为数组
	for _, id := range userIDs {
		states = append(states, FollowState{
			UserID:      id,
			IsFollowing: stateMap[id],
		})
	}

	return states, nil
}
