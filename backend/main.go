package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"turvo-app/config"
	"turvo-app/services"
	"turvo-app/types"
)

func main() {
	r := gin.Default()

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize Turvo service
	turvoService := services.NewTurvoService(cfg)

	// Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(corsConfig))

	// API routes
	api := r.Group("/api")
	{
		// Get all loads
		api.GET("/loads", getLoads)
		
		// Create a new load
		api.POST("/loads", func(c *gin.Context) {
			createLoad(c, turvoService)
		})
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
	// For now, return mock data in Drumkit format
	loads := []types.Load{
		{
			ExternalTMSLoadID: "TURVO-001",
			FreightLoadID:     "FL-2024-001",
			Status:            "In Transit",
			Customer: types.Customer{
				ExternalTMSId: "CUST-001",
				Name:          "ABC Manufacturing",
				AddressLine1:  "123 Industrial Blvd",
				City:          "Los Angeles",
				State:         "CA",
				Zipcode:       "90210",
				Country:       "USA",
				Contact:       "John Smith",
				Phone:         "555-123-4567",
				Email:         "john@abcmfg.com",
				RefNumber:     "PO-2024-001",
			},
			BillTo: types.BillTo{
				ExternalTMSId: "BILL-001",
				Name:          "ABC Manufacturing",
				AddressLine1:  "123 Industrial Blvd",
				City:          "Los Angeles",
				State:         "CA",
				Zipcode:       "90210",
				Country:       "USA",
				Contact:       "John Smith",
				Phone:         "555-123-4567",
				Email:         "billing@abcmfg.com",
			},
			Pickup: types.Pickup{
				ExternalTMSId: "PICKUP-001",
				Name:          "ABC Manufacturing Warehouse",
				AddressLine1:  "123 Industrial Blvd",
				City:          "Los Angeles",
				State:         "CA",
				Zipcode:       "90210",
				Country:       "USA",
				Contact:       "Warehouse Manager",
				Phone:         "555-123-4568",
				Email:         "warehouse@abcmfg.com",
				BusinessHours: "8AM-5PM",
				RefNumber:     "WH-001",
				ReadyTime:     time.Now(),
				ApptTime:      time.Now().Add(24 * time.Hour),
				ApptNote:      "Call 30 minutes before arrival",
				Timezone:      "PST",
				WarehouseID:   "WH-001",
			},
			Consignee: types.Consignee{
				ExternalTMSId: "CONSIGNEE-001",
				Name:          "XYZ Distribution",
				AddressLine1:  "456 Delivery Ave",
				City:          "New York",
				State:         "NY",
				Zipcode:       "10001",
				Country:       "USA",
				Contact:       "Jane Doe",
				Phone:         "555-987-6543",
				Email:         "receiving@xyzdist.com",
				BusinessHours: "9AM-6PM",
				RefNumber:     "DC-001",
				MustDeliver:   "Yes",
				ApptTime:      time.Now().Add(72 * time.Hour),
				ApptNote:      "Inside delivery required",
				Timezone:      "EST",
				WarehouseID:   "DC-001",
			},
			Carrier: types.Carrier{
				MCNumber:     "MC123456",
				DOTNumber:    "DOT789012",
				Name:         "Fast Freight Inc",
				Phone:        "555-555-5555",
				Dispatcher:   "Mike Johnson",
				SCAC:         "FAST",
				Email:        "dispatch@fastfreight.com",
				DispatchCity: "Los Angeles",
				DispatchState: "CA",
			},
			RateData: types.RateData{
				CustomerRateType: "Flat Rate",
				CustomerNumHours: 48.0,
				CustomerLhRateUsd: 150.0,
				FSCPercent:       15.0,
				CarrierRateType:   "Flat Rate",
				CarrierNumHours:   48.0,
				CarrierLhRateUsd:  120.0,
				CarrierMaxRate:    5000.0,
				NetProfitUsd:      500.0,
				ProfitPercent:     10.0,
			},
			Specifications: types.Specifications{
				InPalletCount:      20,
				OutPalletCount:     20,
				NumCommodities:     5,
				TotalWeight:        5000.0,
				BillableWeight:     5000.0,
				PONums:             "PO-2024-001",
				Operator:           "John Smith",
				RouteMiles:         2789.0,
				LiftgatePickup:     false,
				LiftgateDelivery:   false,
				InsidePickup:       false,
				InsideDelivery:     true,
				Tarps:              false,
				Oversized:          false,
				Hazmat:             false,
				Straps:             true,
				Permits:            false,
				Escorts:            false,
				Seal:               true,
				CustomBonded:       false,
				Labor:              false,
			},
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    loads,
	})
}

// createLoad creates a new load in Turvo
func createLoad(c *gin.Context, turvoService *services.TurvoService) {
	var req types.CreateLoadRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("DEBUG: Failed to bind JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
		return
	}

	fmt.Printf("DEBUG: Received request successfully\n")

	// Convert request to Load format
	newLoad := types.Load{
		ExternalTMSLoadID: req.ExternalTMSLoadID,
		FreightLoadID:     req.FreightLoadID,
		Status:            req.Status,
		Customer:          req.Customer,
		BillTo:            req.BillTo,
		Pickup:            req.Pickup,
		Consignee:         req.Consignee,
		Carrier:           req.Carrier,
		RateData:          req.RateData,
		Specifications:    req.Specifications,
	}

	// Create shipment in Turvo
	fmt.Printf("DEBUG: Calling Turvo service to create shipment\n")
	turvoResponse, err := turvoService.CreateShipment(newLoad)
	if err != nil {
		fmt.Printf("DEBUG: Turvo service error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create shipment in Turvo: " + err.Error(),
		})
		return
	}

	// Update load with Turvo shipment ID
	newLoad.ExternalTMSLoadID = turvoResponse.ShipmentID

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    newLoad,
		"message": "Load created successfully in Turvo",
		"turvo_response": turvoResponse,
	})
} 