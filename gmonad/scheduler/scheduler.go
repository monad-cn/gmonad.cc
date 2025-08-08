package scheduler

import (
	"gmonad/models"
	"log"

	"github.com/robfig/cron/v3"
)

func StartScheduler() {
	c := cron.New()

	// 每天凌晨 00:10 执行（避免并发、写入未完成）
	_, err := c.AddFunc("10 0 * * *", func() {
		log.Println("Running daily stats task...")
		err := models.CollectDailyStats()
		if err != nil {
			log.Println("Daily stats task failed:", err)
		}
	})
	if err != nil {
		log.Fatal("Failed to schedule daily task:", err)
	}

	c.Start()
	log.Println("Cron scheduler started.")
}
