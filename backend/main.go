package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Load represents a Turvo load
type Load struct {
	ID          string  `json:"id"`
	Reference   string  `json:"reference"`
	Origin      string  `json:"origin"`
	Destination string  `json:"destination"`
	Status      string  `json:"status"`
	Weight      float64 `json:"weight"`
	CreatedAt   string  `json:"created_at"`
}

// CreateLoadRequest represents the request body for creating a new load
type CreateLoadRequest struct {
	Reference   string  `json:"reference" binding:"required"`
	Origin      string  `json:"origin" binding:"required"`
	Destination string  `json:"destination" binding:"required"`
	Weight      float64 `json:"weight" binding:"required"`
}

func main() {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		// Get all loads
		api.GET("/loads", getLoads)
		
		// Create a new load
		api.POST("/loads", createLoad)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.Run(":8080")
}

// getLoads returns all loads from Turvo
func getLoads(c *gin.Context) {
	// TODO: Implement actual Turvo API integration
	// For now, return mock data
	loads := []Load{
		{
			ID:          "load-001",
			Reference:   "REF-2024-001",
			Origin:      "Los Angeles, CA",
			Destination: "New York, NY",
			Status:      "In Transit",
			Weight:      5000.0,
			CreatedAt:   "2024-01-15T10:30:00Z",
		},
		{
			ID:          "load-002",
			Reference:   "REF-2024-002",
			Origin:      "Chicago, IL",
			Destination: "Miami, FL",
			Status:      "Delivered",
			Weight:      3000.0,
			CreatedAt:   "2024-01-14T14:20:00Z",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    loads,
	})
}

// createLoad creates a new load in Turvo
func createLoad(c *gin.Context) {
	var req CreateLoadRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	// TODO: Implement actual Turvo API integration
	// For now, return a mock response
	newLoad := Load{
		ID:          "load-003",
		Reference:   req.Reference,
		Origin:      req.Origin,
		Destination: req.Destination,
		Status:      "Created",
		Weight:      req.Weight,
		CreatedAt:   "2024-01-16T09:00:00Z",
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    newLoad,
		"message": "Load created successfully",
	})
} 