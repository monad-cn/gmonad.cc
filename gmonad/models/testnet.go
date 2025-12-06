package models

import (
	"errors"

	"gorm.io/gorm"
)

type Testnet struct {
	gorm.Model
	BlockNum     uint64 `json:"block_num"`
	AvgBlockTime string `json:"avg_block_time"`
	Contracts    uint   `json:"contracts"`
}

func (t *Testnet) Create() error {
	return db.Create(t).Error
}

func (t *Testnet) Update() error {
	if t.ID == 0 {
		return errors.New("missing Testnet ID")
	}
	return db.Save(t).Error
}

func (t *Testnet) GetLatest() error {
	return db.Order("block_num desc").Find(t).Error
}

type Validator struct {
	gorm.Model
	T1Validators uint `json:"t1_validators"`
	T2Validators uint `json:"t2_validators"`
}

func (v *Validator) Create() error {
	return db.Create(v).Error
}

func (v *Validator) Update() error {
	if v.ID == 0 {
		return errors.New("missing Validator ID")
	}
	return db.Save(v).Error
}

func (v *Validator) GetLatest() error {
	return db.Order("created_at desc").Find(v).Error
}

func GetStatistics() (uint64, string, uint, error) {
	var testnet Testnet
	if err := testnet.GetLatest(); err != nil {
		return 0, "", 0, err
	}

	var validator Validator
	if err := validator.GetLatest(); err != nil {
		return 0, "", 0, err
	}

	return testnet.BlockNum, testnet.AvgBlockTime, validator.T1Validators, nil
}
