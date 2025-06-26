package jobs

import (
	"fmt"
	"gmonad/chain"
	"gmonad/models"
	"log"
)

var TaskHandlers = map[string]func(){
	"testnet":   HandleTestnetData,
	"validator": HandleValidatorData,
}

func HandleTestnetData() {
	lastBlockNum, avgBlockTime, err := chain.GetTestnetData(10)
	if err != nil {
		log.Println(err)
		return
	}

	var testnet = models.Testnet{
		BlockNum:     lastBlockNum.Uint64(),
		AvgBlockTime: fmt.Sprintf("%.1f", avgBlockTime),
	}

	if err := testnet.Create(); err != nil {
		log.Println(err)
	}
	return
}

func HandleValidatorData() {
	validators, err := chain.GetValidatorData("testnet") // testnet-1
	if err != nil {
		log.Println(err)
		return
	}

	var validator = models.Validator{
		T1Validators: validators,
	}

	if err := validator.Create(); err != nil {
		log.Println(err)
	}
	return
}
