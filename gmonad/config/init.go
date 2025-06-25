package config

import (
	"fmt"

	"github.com/spf13/viper"
)

func init() {
	viper.SetConfigName("config") // 配置文件名称（不带扩展名）
	viper.SetConfigType("yaml")   // 配置文件格式
	viper.AddConfigPath("./")     // 配置文件路径

	if err := viper.ReadInConfig(); err != nil {
		panic(fmt.Errorf("Fatal error config file: %w \n", err))
	}

	ConnectDB()
}
