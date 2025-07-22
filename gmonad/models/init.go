package models

import (
	"gmonad/config"
)

var db = config.DB

func init() {
	db.AutoMigrate(&Event{})
	db.AutoMigrate(&Article{})
	db.AutoMigrate(&User{})
	db.AutoMigrate(&Role{})
	db.AutoMigrate(&Permission{})
	db.AutoMigrate(&PermissionGroup{})
	db.AutoMigrate(&Testnet{})
	db.AutoMigrate(&Validator{})
	db.AutoMigrate(&Category{})
	db.AutoMigrate(&Dapp{})
	db.AutoMigrate(&Tutorial{})
	db.AutoMigrate(&Feedback{})
	db.AutoMigrate(&Post{})

	InitRolesAndPermissions()
	InitCategories()
}
