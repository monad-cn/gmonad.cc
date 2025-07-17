package chain

import (
	"encoding/json"
	"errors"
	"gmonad/utils"
	"sort"
	"time"

	"github.com/spf13/viper"
)

type ValidatorData struct {
	Timestamp        time.Time `json:"timestamp"`
	Epoch            string    `json:"epoch"`
	NodeID           string    `json:"node_id"`
	DisplayName      string    `json:"display_name"`
	ValIndex         int       `json:"val_index"`
	Stake            string    `json:"stake"`
	IPAddress        string    `json:"ip_address"`
	ObserverNodeID   string    `json:"observer_node_id"`
	ObserverNodeType string    `json:"observer_node_type"`
}

type ValidatorResponse struct {
	Data []ValidatorData `json:"data"`
}

// 按 ValIndex 倒序排序
func SortValidatorsByValIndexDesc(validators []ValidatorData) {
	sort.Slice(validators, func(i, j int) bool {
		return validators[i].ValIndex > validators[j].ValIndex
	})
}

func GetValidatorData(netname string) (uint, error) {
	url := viper.GetString("validator.url")

	var params = utils.HTTPRequestParams{
		URL:    url + netname,
		Method: "GET",
	}

	result, err := utils.SendHTTPRequest(params)
	if err != nil {
		return 0, err
	}

	var resp ValidatorResponse
	if err := json.Unmarshal([]byte(result), &resp); err != nil {
		return 0, err
	}

	if len(resp.Data) == 0 {
		return 0, errors.New("err request")
	}

	return uint(len(resp.Data)), nil
}
