package jobs

import (
	"errors"
	"log"
	"time"

	"github.com/spf13/viper"
)

type Task struct {
	Name        string
	Interval    uint
	ConfigField string
	RunFunc     func()
}

func (t *Task) GetInterval() error {
	if t.Name != "validator" && t.Name != "testnet" {
		return errors.New("invalid task!")
	}

	argName := t.ConfigField + "." + t.Name + "IntervalSeconds"
	interval := viper.GetUint(argName)
	if interval == 0 {
		return errors.New("invalid timer interval!")
	}

	t.Interval = interval
	return nil
}

func (t *Task) BindRunFunc() error {
	handler, ok := TaskHandlers[t.Name]
	if !ok {
		return errors.New("no handler for task: " + t.Name)
	}
	t.RunFunc = handler
	return nil
}

func (t *Task) Run() {
	if t.RunFunc == nil {
		log.Printf("No RunFunc bound for task %s\n", t.Name)
		return
	}
	t.RunFunc()
}

func StartTimerTask(t *Task) {
	ticker := time.NewTicker(time.Duration(t.Interval) * time.Second)

	go func() {
		for {
			select {
			case <-ticker.C:
				t.Run()
			}
		}
	}()
}

func HandleTask() {
	var testnetTask = Task{
		Name:        "testnet",
		ConfigField: "timer",
	}
	err := testnetTask.GetInterval()
	if err != nil {
		log.Fatalln(err)
	}
	testnetTask.BindRunFunc()
	StartTimerTask(&testnetTask)

	var validatorTask = Task{
		Name:        "validator",
		ConfigField: "timer",
	}
	err = validatorTask.GetInterval()
	if err != nil {
		log.Fatalln(err)
	}
	validatorTask.BindRunFunc()
	StartTimerTask(&validatorTask)
}
