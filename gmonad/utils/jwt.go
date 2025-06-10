package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
)

// JWT 密钥
var jwtSecret = viper.GetString("jwt.secret")

// 结构体定义 JWT 负载
type Claims struct {
	OauthToken string `json:"oauth_token"`
	jwt.RegisteredClaims
}

// 生成 JWT 令牌
func GenerateToken(accessToken string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour * 7)
	claims := Claims{
		OauthToken: accessToken,
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
	if err != nil {
		return nil, err
	}

	// 获取 Claims
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, err
}
