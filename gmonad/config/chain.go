package config

import (
	"log"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/spf13/viper"
)

var MonadClient *ethclient.Client

func ConnectChain() {
	rpcUrl := viper.GetString("rpc.monadTestnet")

	var err error
	MonadClient, err = ethclient.Dial(rpcUrl)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Monad Testnet connection established")
}
