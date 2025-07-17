package chain

import (
	"context"
	"errors"
	"gmonad/config"
	"log"
	"math/big"
	"sort"
	"sync"

	"github.com/ethereum/go-ethereum/core/types"
)

func GetTestnetData(blockCount int) (*big.Int, float64, error) {
	ctx := context.Background()
	// 设置要获取的区块数量

	// 获取最新区块号
	latestBlock, err := config.MonadClient.BlockByNumber(ctx, nil)
	if err != nil {
		return nil, 0, err
	}
	latestNumber := latestBlock.Number()

	// 创建 channel 和 wait group
	blocks := make(chan *types.Block, blockCount)
	var wg sync.WaitGroup

	// 启动并发请求
	for i := 0; i < blockCount; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			blockNum := new(big.Int).Sub(latestNumber, big.NewInt(int64(i)))
			block, err := config.MonadClient.BlockByNumber(ctx, blockNum)
			if err != nil {
				log.Printf("获取区块 %v 出错: %v", blockNum, err)
				return
			}
			blocks <- block
		}(i)
	}

	// 等待并关闭通道
	go func() {
		wg.Wait()
		close(blocks)
	}()

	// 收集区块并按 block number 排序
	var blockList []*types.Block
	for block := range blocks {
		blockList = append(blockList, block)
	}

	// 排序：从旧到新
	sort.Slice(blockList, func(i, j int) bool {
		return blockList[i].Number().Cmp(blockList[j].Number()) < 0
	})

	// 计算时间差
	if len(blockList) < 2 {
		return nil, 0, errors.New("blocks < 2")
	}

	var totalDiff uint64
	for i := 1; i < len(blockList); i++ {
		t1 := blockList[i-1].Time()
		t2 := blockList[i].Time()
		diff := t2 - t1
		totalDiff += diff
	}

	avg := float64(totalDiff) / float64(len(blockList)-1)
	return latestNumber, avg, nil
}
