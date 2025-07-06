package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	TurvoAPIKey      string
	TurvoClientName  string
	TurvoClientSecret string
	TurvoBaseURL     string

	TurvoOAuthClientID     string
	TurvoOAuthClientSecret string
	TurvoOAuthUsername     string
	TurvoOAuthPassword     string
	TurvoOAuthScope        string
	TurvoOAuthType         string
	TurvoXApiKey           string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists
	godotenv.Load()
	config := &Config{
		TurvoAPIKey:      getEnv("TURVO_API_KEY", ""),
		TurvoClientName:  getEnv("TURVO_CLIENT_NAME", ""),
		TurvoClientSecret: getEnv("TURVO_CLIENT_SECRET", ""),
		TurvoBaseURL:     getEnv("TURVO_BASE_URL", ""),

		TurvoOAuthClientID:     getEnv("TURVO_OAUTH_CLIENT_ID", ""),
		TurvoOAuthClientSecret: getEnv("TURVO_OAUTH_CLIENT_SECRET", ""),
		TurvoOAuthUsername:     getEnv("TURVO_OAUTH_USERNAME", ""),
		TurvoOAuthPassword:     getEnv("TURVO_OAUTH_PASSWORD", ""),
		TurvoOAuthScope:        getEnv("TURVO_OAUTH_SCOPE", ""),
		TurvoOAuthType:         getEnv("TURVO_OAUTH_TYPE", ""),
		TurvoXApiKey:           getEnv("TURVO_X_API_KEY", ""),
	}
	
	// Debug: Log the loaded config (without sensitive data)
	fmt.Printf("DEBUG: Loaded config - BaseURL: %s, ClientID: %s, Username: %s, XApiKey: %s\n", 
		config.TurvoBaseURL, 
		config.TurvoOAuthClientID, 
		config.TurvoOAuthUsername, 
		config.TurvoXApiKey)
	
	return config
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
} 