package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"unique;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Github   string `json:"github"`
}

func CreateUser(u *User) error {
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
