package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
)

// JWT 密钥
var jwtSecret = viper.GetString("jwt.secret")

// 结构体定义 JWT 负载
type Claims struct {
	Uid         uint     `json:"uid"`
	Email       string   `json:"email"`
	Avatar      string   `json:"avatar"`
	Username    string   `json:"username"`
	Github      string   `json:"github"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

// 生成 JWT 令牌
func GenerateToken(uid uint, email, avatar, username, github string, permissions []string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour * 7)
	claims := Claims{
		Uid:         uid,
		Email:       email,
		Avatar:      avatar,
		Username:    username,
		Github:      github,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret)) // 生成 Token
}

// 解析 JWT 令牌
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	return claims, nil
}
