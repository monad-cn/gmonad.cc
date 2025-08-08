package models

import (
	"gmonad/config"
)

var db = config.DB

func init() {
	db.AutoMigrate(&Permission{})
	db.AutoMigrate(&PermissionGroup{})
	db.AutoMigrate(&Role{})
	db.AutoMigrate(&User{})
	db.AutoMigrate(&Event{})
	db.AutoMigrate(&Recap{})
	db.AutoMigrate(&Article{})
	db.AutoMigrate(&Testnet{})
	db.AutoMigrate(&Validator{})
	db.AutoMigrate(&Category{})
	db.AutoMigrate(&Dapp{})
	db.AutoMigrate(&Tutorial{})
	db.AutoMigrate(&Feedback{})
	db.AutoMigrate(&Post{})
	db.AutoMigrate(&DailyStats{})

	InitRolesAndPermissions()
	InitCategories()
}
