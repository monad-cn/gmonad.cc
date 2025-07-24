package models

import (
	"errors"

	"gorm.io/gorm"
)

type Recap struct {
	gorm.Model
	Content   string `gorm:"type:text" json:"content"`
	Video     string `json:"video"`
	Recording string `json:"recording"`
	Twitter   string `json:"twitter"`
	EventId   uint   `json:"event_id"`
	Event     *Event `gorm:"foreignKey:EventId" json:"event"`
	UserId    uint   `json:"user_id"`
	User      *User  `gorm:"foreignKey:UserId" json:"user"`
}

func (r *Recap) Create() error {
	return db.Create(r).Error
}

func (r *Recap) GetByID(id uint) error {
	return db.Preload("User").First(r, id).Error
}

func (r *Recap) GetByEventId(eventId uint) error {
	return db.Preload("User").Where("event_id = ?", eventId).First(r).Error
}

func (r *Recap) Update() error {
	if r.ID == 0 {
		return errors.New("missing ID")
	}
	return db.Save(r).Error
}

func (r *Recap) Delete() error {
	if r.ID == 0 {
		return errors.New("missing ID")
	}
	return db.Delete(r).Error
}
