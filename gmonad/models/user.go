package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Uid          uint   `json:"uid"`
	Avatar       string `json:"avatar"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Github       string `json:"github"`
	OauthToken   string `json:"-"`
	OauthTokenId string `json:"-"` // for oauth request
}

func CreateUser(u *User) error {
	if err := db.Create(u).Error; err != nil {
		return err
	}
	return nil
}

func GetUserByToken(token string) (*User, error) {
	var u User
	if err := db.Where("oauth_token = ?", token).Last(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func UpdateUser(u *User) error {
	if err := db.Save(u).Error; err != nil {
		return err
	}
	return nil
}
