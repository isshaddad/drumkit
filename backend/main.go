package main

import (
	"fmt"
	"net/http"
	"strconv"
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
	corsConfig.AllowOrigins = []string{
		"http://localhost:3000",
		"https://*.amplifyapp.com",  // Allow Amplify URLs
		"https://*.amplifyapp.net",  // Alternative Amplify domain
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(corsConfig))

	// API routes
	api := r.Group("/api")
	{
		// Get all loads
		api.GET("/loads", func(c *gin.Context) {
			getLoads(c, turvoService)
		})
		
		// Create a new load
		api.POST("/loads", func(c *gin.Context) {
			createLoad(c, turvoService)
		})

		// Get shipment details
		api.GET("/shipments/:id", func(c *gin.Context) {
			getShipmentDetails(c, turvoService)
		})
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.Run(":8080")
}

// getLoads returns all loads from Turvo
func getLoads(c *gin.Context, turvoService *services.TurvoService) {
	fmt.Printf("DEBUG: Fetching loads from Turvo\n")
	
	// Get page parameter
	pageStr := c.Query("page")
	page := 0
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	// Get shipments from Turvo
	turvoShipments, pagination, err := turvoService.GetShipments(page)
	if err != nil {
		fmt.Printf("DEBUG: Failed to get shipments from Turvo: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch shipments from Turvo: " + err.Error(),
		})
		return
	}

	// Convert Turvo shipments to Drumkit format
	loads := []types.Load{}
	for _, shipment := range turvoShipments {
		load := convertTurvoToDrumkit(shipment)
		loads = append(loads, load)
	}

	response := gin.H{
		"success": true,
		"data":    loads,
	}
	
	// Add pagination info if available
	if pagination != nil {
		response["hasMore"] = pagination.MoreAvailable
		response["pagination"] = pagination
	}

	c.JSON(http.StatusOK, response)
}

// getShipmentDetails returns detailed information about a specific shipment
func getShipmentDetails(c *gin.Context, turvoService *services.TurvoService) {
	shipmentID := c.Param("id")
	if shipmentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Shipment ID is required",
		})
		return
	}

	fmt.Printf("DEBUG: Fetching shipment details for ID: %s\n", shipmentID)
	
	// Get shipment details from Turvo
	shipmentDetails, err := turvoService.GetShipmentDetails(shipmentID)
	if err != nil {
		fmt.Printf("DEBUG: Failed to get shipment details from Turvo: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch shipment details from Turvo: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    shipmentDetails,
	})
}

// convertTurvoToDrumkit converts a Turvo shipment to Drumkit load format
func convertTurvoToDrumkit(shipment types.TurvoShipment) types.Load {
	// Extract pickup and delivery locations from global route
	var pickup, delivery *types.TurvoGlobalRoute
	for _, route := range shipment.GlobalRoute {
		if route.StopType.Key == "1500" { // Pickup
			pickup = &route
		} else if route.StopType.Key == "1501" { // Delivery
			delivery = &route
		}
	}

	// Extract customer info from customer order
	var customerName string
	if len(shipment.CustomerOrder) > 0 {
		customerName = shipment.CustomerOrder[0].Customer.Name
	}

	// Extract total weight from customer order items
	var totalWeight float64
	if len(shipment.CustomerOrder) > 0 && len(shipment.CustomerOrder[0].Items) > 0 {
		// Sum up all item weights or use a default
		totalWeight = 5000.0 // Default weight
	}

	load := types.Load{
		ExternalTMSLoadID: shipment.ShipmentID,
		FreightLoadID:     shipment.ShipmentID,
		Status:            shipment.Status.Code.Value,
		Customer: types.Customer{
			ExternalTMSId: fmt.Sprintf("CUST-%s", shipment.ShipmentID),
			Name:          customerName,
			AddressLine1:  "N/A",
			City:          "N/A",
			State:         "N/A",
			Zipcode:       "N/A",
			Country:       "USA",
			Contact:       "N/A",
			Phone:         "N/A",
			Email:         "N/A",
			RefNumber:     "N/A",
		},
		Pickup: types.Pickup{
			ExternalTMSId: "N/A",
			Name:          "N/A",
			AddressLine1:  getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.AddressLine1 }),
			City:          getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.City }),
			State:         getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.State }),
			Zipcode:       getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.ZipCode }),
			Country:       getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.Country }),
			Contact:       getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.ContactName }),
			Phone:         getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.Phone }),
			Email:         getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Location.Email }),
			BusinessHours: "N/A",
			RefNumber:     "N/A",
			ReadyTime:     time.Time{},
			ApptTime:      time.Time{},
			ApptNote:      getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Notes }),
			Timezone:      getPickupField(pickup, func(r *types.TurvoGlobalRoute) string { return r.Timezone }),
			WarehouseID:   "N/A",
		},
		Consignee: types.Consignee{
			ExternalTMSId: "N/A",
			Name:          "N/A",
			AddressLine1:  getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.AddressLine1 }),
			City:          getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.City }),
			State:         getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.State }),
			Zipcode:       getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.ZipCode }),
			Country:       getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.Country }),
			Contact:       getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.ContactName }),
			Phone:         getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.Phone }),
			Email:         getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Location.Email }),
			BusinessHours: "N/A",
			RefNumber:     "N/A",
			MustDeliver:   "N/A",
			ApptTime:      time.Time{},
			ApptNote:      getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Notes }),
			Timezone:      getDeliveryField(delivery, func(r *types.TurvoGlobalRoute) string { return r.Timezone }),
			WarehouseID:   "N/A",
		},
		Specifications: types.Specifications{
			InPalletCount:      0,
			OutPalletCount:     0,
			NumCommodities:     0,
			TotalWeight:        totalWeight,
			BillableWeight:     totalWeight,
			PONums:             "N/A",
			Operator:           "N/A",
			RouteMiles:         0.0,
			LiftgatePickup:     false,
			LiftgateDelivery:   false,
			InsidePickup:       false,
			InsideDelivery:     false,
			Tarps:              false,
			Oversized:          false,
			Hazmat:             false,
			Straps:             false,
			Permits:            false,
			Escorts:            false,
			Seal:               false,
			CustomBonded:       false,
			Labor:              false,
		},
	}

	return load
}

// getPickupField safely extracts a field from pickup route
func getPickupField(pickup *types.TurvoGlobalRoute, extractor func(*types.TurvoGlobalRoute) string) string {
	if pickup != nil {
		return extractor(pickup)
	}
	return "N/A"
}

// getDeliveryField safely extracts a field from delivery route
func getDeliveryField(delivery *types.TurvoGlobalRoute, extractor func(*types.TurvoGlobalRoute) string) string {
	if delivery != nil {
		return extractor(delivery)
	}
	return "N/A"
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