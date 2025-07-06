package config

import (
	"os"
)

// Config holds application configuration
type Config struct {
	TurvoAPIKey      string
	TurvoClientName  string
	TurvoClientSecret string
	TurvoBaseURL     string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		TurvoAPIKey:      getEnv("TURVO_API_KEY", "9VjKgnIlQS1255cn7cRvJ6jNf8Z4MElP1PGgBTsH"),
		TurvoClientName:  getEnv("TURVO_CLIENT_NAME", "publicapi"),
		TurvoClientSecret: getEnv("TURVO_CLIENT_SECRET", "secret"),
		TurvoBaseURL:     getEnv("TURVO_BASE_URL", "https://my-sandbox-publicapi.turvo.com"),
	}
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
} 