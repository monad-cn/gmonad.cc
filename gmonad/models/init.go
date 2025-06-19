package models

import (
	"gmonad/config"
)

var db = config.DB

func init() {
	db.AutoMigrate(&Event{})
	db.AutoMigrate(&User{})
}
