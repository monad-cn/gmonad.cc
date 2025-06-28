package models

import "gorm.io/gorm"

type Permission struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
}

type PermissionGroup struct {
	gorm.Model
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Permissions []Permission `gorm:"many2many:permission_group_permissions;"`
}

type Role struct {
	gorm.Model
	Name             string            `json:"name"`
	Description      string            `json:"description"`
	Permissions      []Permission      `gorm:"many2many:role_permissions;"`
	PermissionGroups []PermissionGroup `gorm:"many2many:role_permission_groups;"`
}

func InitRolesAndPermissions() error {
	var count int64
	if err := db.Model(&Permission{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil // 已初始化
	}

	// 1. 创建权限
	permissions := []Permission{
		{Name: "blog:write", Description: "创作博客"},
		{Name: "blog:review", Description: "审核博客"},
		{Name: "blog:delete", Description: "删除博客"},
		{Name: "blog:publish", Description: "发布博客"},
		{Name: "event:write", Description: "新建活动"},
		{Name: "event:review", Description: "审核活动"},
		{Name: "event:delete", Description: "删除活动"},
		{Name: "event:publish", Description: "发布活动"},
	}
	if err := db.Create(&permissions).Error; err != nil {
		return err
	}

	// 2. 创建权限组
	permissionGroups := []PermissionGroup{
		{Name: "博客作者", Description: "博客创作权限组"},
		{Name: "博客管理员", Description: "博客管理权限组"},
		{Name: "活动创建者", Description: "活动创建权限组"},
		{Name: "活动管理员", Description: "活动管理权限组"},
		{Name: "内容管理员", Description: "内容管理权限组"},
		{Name: "超级管理员", Description: "拥有所有权限"},
	}
	if err := db.Create(&permissionGroups).Error; err != nil {
		return err
	}

	// 3. 关联权限到权限组
	// helper 函数：按权限名查权限ID
	getPermByName := func(name string) (Permission, error) {
		var p Permission
		err := db.Where("name = ?", name).First(&p).Error
		return p, err
	}

	// 博客创作者：创作博客，删除博客
	blogWrite, _ := getPermByName("blog:write")
	blogDelete, _ := getPermByName("blog:delete")
	err := db.Model(&permissionGroups[0]).Association("Permissions").Append(&blogWrite, &blogDelete)
	if err != nil {
		return err
	}

	// 博客管理员：创作博客，审核博客，发布博客
	blogReview, _ := getPermByName("blog:review")
	blogPublish, _ := getPermByName("blog:publish")
	err = db.Model(&permissionGroups[1]).Association("Permissions").Append(&blogWrite, &blogReview, &blogDelete, &blogPublish)
	if err != nil {
		return err
	}

	// 活动创建：新建活动
	eventWrite, _ := getPermByName("event:write")
	err = db.Model(&permissionGroups[2]).Association("Permissions").Append(&eventWrite)
	if err != nil {
		return err
	}

	// 活动管理：新建活动，审核活动，发布活动
	eventReview, _ := getPermByName("event:review")
	eventDelete, _ := getPermByName("event:delete")
	eventPublish, _ := getPermByName("event:publish")
	err = db.Model(&permissionGroups[3]).Association("Permissions").Append(&eventWrite, &eventReview, &eventDelete, &eventPublish)
	if err != nil {
		return err
	}

	// 内容管理员：拥有所有内容管理权限
	err = db.Model(&permissionGroups[4]).Association("Permissions").Append(&permissions)
	if err != nil {
		return err

	}
	// 超级管理员：拥有所有权限
	err = db.Model(&permissionGroups[5]).Association("Permissions").Append(&permissions)
	if err != nil {
		return err
	}

	// 4. 创建示例角色并关联权限和权限组
	roles := []Role{
		{Name: "blog_writer", Description: "博客作者角色"},
		{Name: "blog_admin", Description: "博客管理员角色"},
		{Name: "event_creator", Description: "活动创建角色"},
		{Name: "event_admin", Description: "活动管理员角色"},
		{Name: "content_admin", Description: "内容管理员角色"},
		{Name: "super_admin", Description: "超级管理员角色"},
	}

	if err := db.Create(&roles).Error; err != nil {
		return err
	}

	// 关联角色与权限组（角色继承权限组权限）
	err = db.Model(&roles[0]).Association("PermissionGroups").Append(&permissionGroups[0]) // 博客作者
	if err != nil {
		return err
	}

	err = db.Model(&roles[1]).Association("PermissionGroups").Append(&permissionGroups[1]) // 博客管理员
	if err != nil {
		return err
	}

	err = db.Model(&roles[2]).Association("PermissionGroups").Append(&permissionGroups[2]) // 活动创建者
	if err != nil {
		return err
	}

	err = db.Model(&roles[3]).Association("PermissionGroups").Append(&permissionGroups[3]) // 活动管理员
	if err != nil {
		return err
	}

	err = db.Model(&roles[4]).Association("PermissionGroups").Append(&permissionGroups[4]) // 内容管理员
	if err != nil {
		return err
	}
	err = db.Model(&roles[5]).Association("PermissionGroups").Append(&permissionGroups[5]) // 超级管理员
	if err != nil {
		return err
	}

	return nil
}
