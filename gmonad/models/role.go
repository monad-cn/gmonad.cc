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
		{Name: "tutorial:write", Description: "创作教程"},
		{Name: "tutorial:review", Description: "审核教程"},
		{Name: "tutorial:delete", Description: "删除教程"},
		{Name: "tutorial:publish", Description: "发布教程"},
		{Name: "event:write", Description: "新建活动"},
		{Name: "event:review", Description: "审核活动"},
		{Name: "event:delete", Description: "删除活动"},
		{Name: "event:publish", Description: "发布活动"},
		{Name: "dapp:write", Description: "增加Dapp"},
		{Name: "dapp:review", Description: "审核Dapp"},
		{Name: "dapp:delete", Description: "删除Dapp"},
		{Name: "dapp:publish", Description: "发布Dapp"},
	}
	if err := db.Create(&permissions).Error; err != nil {
		return err
	}

	// 2. 创建权限组
	permissionGroups := []PermissionGroup{
		{Name: "博客作者", Description: "博客创作权限组"},
		{Name: "博客管理员", Description: "博客管理权限组"},
		{Name: "教程作者", Description: "教程创作权限组"},
		{Name: "教程管理员", Description: "教程管理权限组"},
		{Name: "活动创建者", Description: "活动创建权限组"},
		{Name: "活动管理员", Description: "活动管理权限组"},
		{Name: "内容创作者", Description: "内容创作者权限组"},
		{Name: "内容管理员", Description: "内容管理权限组"},
		{Name: "Dapp管理员", Description: "Dapp管理权限组"},
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

	// 博客管理员：可以审核博客
	blogReview, _ := getPermByName("blog:review")
	blogPublish, _ := getPermByName("blog:publish")
	blogPermissions := []*Permission{&blogWrite, &blogReview, &blogDelete, &blogPublish}
	err = db.Model(&permissionGroups[1]).Association("Permissions").Append(blogPermissions)
	if err != nil {
		return err
	}

	// 教程创作者：创作教程，删除教程
	tutorialWrite, _ := getPermByName("tutorial:write")
	tutorialDelete, _ := getPermByName("tutorial:delete")
	err = db.Model(&permissionGroups[2]).Association("Permissions").Append(&tutorialWrite, &tutorialDelete)
	if err != nil {
		return err
	}

	// 教程管理员：可以审核教程
	tutorialReview, _ := getPermByName("tutorial:review")
	tutorialPublish, _ := getPermByName("tutorial:publish")
	tutorialPermissions := []*Permission{&tutorialWrite, &tutorialReview, &tutorialDelete, &tutorialPublish}
	err = db.Model(&permissionGroups[3]).Association("Permissions").Append(tutorialPermissions)
	if err != nil {
		return err
	}

	// 活动创建：新建活动
	eventWrite, _ := getPermByName("event:write")
	err = db.Model(&permissionGroups[4]).Association("Permissions").Append(&eventWrite)
	if err != nil {
		return err
	}

	// 活动管理：新建活动，审核活动，发布活动
	eventReview, _ := getPermByName("event:review")
	eventDelete, _ := getPermByName("event:delete")
	eventPublish, _ := getPermByName("event:publish")
	eventPermissions := []*Permission{&eventWrite, &eventReview, &eventDelete, &eventPublish}
	err = db.Model(&permissionGroups[5]).Association("Permissions").Append(eventPermissions)
	if err != nil {
		return err
	}

	// 内容创作者
	contentPermissions := []*Permission{&blogWrite, &blogDelete, &tutorialWrite, &tutorialDelete}
	err = db.Model(&permissionGroups[6]).Association("Permissions").Append(contentPermissions)
	if err != nil {
		return err

	}

	// 内容管理员：拥有所有内容管理权限
	err = db.Model(&permissionGroups[7]).Association("Permissions").Append(blogPermissions, tutorialPermissions)
	if err != nil {
		return err

	}

	dappWrite, _ := getPermByName("dapp:write")
	dappReview, _ := getPermByName("dapp:review")
	dappDelete, _ := getPermByName("dapp:delete")
	dappPublish, _ := getPermByName("dapp:publish")
	dappPermissions := []*Permission{&dappWrite, &dappReview, &dappDelete, &dappPublish}
	err = db.Model(&permissionGroups[8]).Association("Permissions").Append(dappPermissions)
	if err != nil {
		return err

	}

	// 超级管理员：拥有所有权限
	err = db.Model(&permissionGroups[9]).Association("Permissions").Append(blogPermissions, tutorialPermissions, eventPermissions, dappPermissions)
	if err != nil {
		return err
	}

	// 4. 创建示例角色并关联权限和权限组
	roles := []Role{
		{Name: "blog_writer", Description: "博客作者角色"},
		{Name: "blog_admin", Description: "博客管理员角色"},
		{Name: "tutorial_writer", Description: "教程作者角色"},
		{Name: "tutorial_admin", Description: "教程管理员角色"},
		{Name: "event_creator", Description: "活动创建角色"},
		{Name: "event_admin", Description: "活动管理员角色"},
		{Name: "content_creator", Description: "内容创作者角色"},
		{Name: "content_admin", Description: "内容管理员角色"},
		{Name: "dapp_admin", Description: "Dapp管理员角色"},
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

	err = db.Model(&roles[2]).Association("PermissionGroups").Append(&permissionGroups[2]) // 教程作者
	if err != nil {
		return err
	}

	err = db.Model(&roles[3]).Association("PermissionGroups").Append(&permissionGroups[3]) // 教程管理员
	if err != nil {
		return err
	}

	err = db.Model(&roles[4]).Association("PermissionGroups").Append(&permissionGroups[4]) // 活动创建者
	if err != nil {
		return err
	}

	err = db.Model(&roles[5]).Association("PermissionGroups").Append(&permissionGroups[5]) // 活动管理员
	if err != nil {
		return err
	}

	err = db.Model(&roles[6]).Association("PermissionGroups").Append(&permissionGroups[6]) // 内容创作者
	if err != nil {
		return err
	}

	err = db.Model(&roles[7]).Association("PermissionGroups").Append(&permissionGroups[7]) // 内容管理员
	if err != nil {
		return err
	}

	err = db.Model(&roles[8]).Association("PermissionGroups").Append(&permissionGroups[8]) // Dapp 管理员
	if err != nil {
		return err
	}

	err = db.Model(&roles[9]).Association("PermissionGroups").Append(&permissionGroups[9]) // 超级管理员
	if err != nil {
		return err
	}

	return nil
}
