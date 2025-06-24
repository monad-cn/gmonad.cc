package utils

import (
	"errors"
	"math/big"
	"regexp"
	"sort"
	"time"
)

func ToSet(arr []string) map[string]struct{} {
	set := make(map[string]struct{})
	for _, s := range arr {
		set[s] = struct{}{}
	}
	return set
}

func IsWithinLast24Hours(t time.Time) bool {
	// 获取当前时间
	now := time.Now()
	// 计算当前时间与给定时间的差值
	duration := now.Sub(t)

	// 如果时间差小于24小时，则该时间在24小时内
	return duration <= 24*time.Hour
}

// GetGitRank 从传入的 SVG 内容中提取 GitHub 排名
func GetGitRank(content string) (string, error) {
	// 匹配<title>标签中的内容
	reTitle := regexp.MustCompile(`<title.*?>(.*?)</title>`)
	titleMatch := reTitle.FindStringSubmatch(content)

	// 如果没有匹配到<title>标签内容，返回错误
	if len(titleMatch) < 2 {
		return "", errors.New("failed to find <title> tag in content")
	}

	// 提取标题内容
	title := titleMatch[1]

	// 匹配Rank: 后面的排名字母（如 A）
	reRank := regexp.MustCompile(`Rank:\s*(\w)`)
	rankMatch := reRank.FindStringSubmatch(title)

	// 如果没有找到排名，返回错误
	if len(rankMatch) < 2 {
		return "", errors.New("failed to find rank in title")
	}

	// 返回提取到的排名
	return rankMatch[1], nil
}

func DecimalToBigInt(amount float64) *big.Int {
	decimals := 18

	value := new(big.Float).SetFloat64(amount)

	multiplier := new(big.Float).SetInt(new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals)), nil))
	value.Mul(value, multiplier)

	result := new(big.Int)
	value.Int(result)
	return result
}

func ParseTime(s string) (time.Time, error) {
	const layout = "2006-01-02 15:04:05"
	t, err := time.ParseInLocation(layout, s, time.Local)
	if err != nil {
		return time.Time{}, errors.New("时间格式错误，应为：YYYY-MM-DD HH:MM:SS")
	}
	return t, nil
}

func StringSlicesEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	aCopy := append([]string(nil), a...)
	bCopy := append([]string(nil), b...)

	sort.Strings(aCopy)
	sort.Strings(bCopy)

	for i := range aCopy {
		if aCopy[i] != bCopy[i] {
			return false
		}
	}
	return true
}
