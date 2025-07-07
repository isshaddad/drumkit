package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"turvo-app/config"
	"turvo-app/types"
)

// TurvoService handles Turvo API interactions
type TurvoService struct {
	config      *config.Config
	client      *http.Client
	accessToken string
	tokenExpiry time.Time
}

// NewTurvoService creates a new Turvo service instance
func NewTurvoService(cfg *config.Config) *TurvoService {
	return &TurvoService{
		config: cfg,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// getAccessToken fetches and caches a valid OAuth token from Turvo
func (s *TurvoService) getAccessToken() (string, error) {
	if s.accessToken != "" && time.Now().Before(s.tokenExpiry) {
		return s.accessToken, nil
	}

	tokenURL := s.config.TurvoBaseURL + "/v1/oauth/token"
	data := map[string]string{
		"grant_type": "password",
		"client_id": s.config.TurvoOAuthClientID,
		"client_secret": s.config.TurvoOAuthClientSecret,
		"username": s.config.TurvoOAuthUsername,
		"password": s.config.TurvoOAuthPassword,
		"scope": s.config.TurvoOAuthScope,
		"type": s.config.TurvoOAuthType,
	}
	jsonData, _ := json.Marshal(data)

	fmt.Printf("DEBUG: OAuth request URL: %s\n", tokenURL)
	fmt.Printf("DEBUG: OAuth request headers: Content-Type=application/json, x-api-key=%s\n", s.config.TurvoXApiKey)
	fmt.Printf("DEBUG: OAuth request body: %s\n", string(jsonData))

	req, err := http.NewRequest("POST", tokenURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.config.TurvoXApiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	fmt.Printf("DEBUG: OAuth response status: %s\n", resp.Status)
	
	// Read and log the response body for debugging
	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("DEBUG: OAuth response body: %s\n", string(bodyBytes))
	
	// Create a new reader for the JSON decoder since we consumed the body
	resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("Turvo OAuth error: %s", resp.Status)
	}

	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn  int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	s.accessToken = result.AccessToken
	s.tokenExpiry = time.Now().Add(time.Duration(result.ExpiresIn-60) * time.Second) // 1 min buffer
	fmt.Printf("DEBUG: Obtained new Turvo OAuth token, expires in %d seconds\n", result.ExpiresIn)
	return s.accessToken, nil
}

// CreateShipment creates a new shipment in Turvo
func (s *TurvoService) CreateShipment(drumkitLoad types.Load) (*types.TurvoShipmentResponse, error) {
	// Transform Drumkit load to Turvo format
	turvoRequest, err := s.transformDrumkitToTurvo(drumkitLoad)
	if err != nil {
		return nil, fmt.Errorf("failed to transform load data: %w", err)
	}

	// Convert request to JSON
	jsonData, err := json.Marshal(turvoRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	fmt.Printf("DEBUG: Turvo request JSON: %s\n", string(jsonData))

	// Get OAuth token
	token, err := s.getAccessToken()
	if err != nil {
		return nil, fmt.Errorf("failed to get Turvo OAuth token: %w", err)
	}

	// Create HTTP request
	url := fmt.Sprintf("%s/v1/shipments", s.config.TurvoBaseURL)
	fmt.Printf("DEBUG: Turvo URL: %s\n", url)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("x-api-key", s.config.TurvoXApiKey)

	// Make the request
	fmt.Printf("DEBUG: Making request to Turvo...\n")
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	fmt.Printf("DEBUG: Turvo response status: %s\n", resp.Status)

	// Read and log the full response body for debugging
	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("DEBUG: Turvo response body: %s\n", string(bodyBytes))
	
	// Create a new reader for the JSON decoder since we consumed the body
	resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// Parse response
	var turvoResponse types.TurvoShipmentResponse
	if err := json.NewDecoder(resp.Body).Decode(&turvoResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	fmt.Printf("DEBUG: Turvo response: %+v\n", turvoResponse)

	// Check for HTTP errors
	if resp.StatusCode >= 400 {
		return &turvoResponse, fmt.Errorf("Turvo API error: %s - %s", resp.Status, turvoResponse.Error)
	}

	return &turvoResponse, nil
}

// GetShipments fetches all shipments from Turvo
func (s *TurvoService) GetShipments(page int) ([]types.TurvoShipment, *types.TurvoPagination, error) {
	// Get OAuth token
	token, err := s.getAccessToken()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get Turvo OAuth token: %w", err)
	}

	// Create HTTP request with pagination
	url := fmt.Sprintf("%s/v1/shipments/list", s.config.TurvoBaseURL)
	
	// Add pagination parameters if page > 0
	if page > 0 {
		url += fmt.Sprintf("?start=%d&pageSize=24", (page-1)*24+1)
	}
	fmt.Printf("DEBUG: Turvo GET shipments URL: %s\n", url)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("x-api-key", s.config.TurvoXApiKey)

	// Make the request
	fmt.Printf("DEBUG: Making GET request to Turvo...\n")
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	fmt.Printf("DEBUG: Turvo GET response status: %s\n", resp.Status)

	// Read and log the response body for debugging
	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("DEBUG: Turvo GET response body: %s\n", string(bodyBytes))
	
	// Create a new reader for the JSON decoder since we consumed the body
	resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// Check for HTTP errors
	if resp.StatusCode >= 400 {
		return nil, nil, fmt.Errorf("Turvo API error: %s - %s", resp.Status, string(bodyBytes))
	}

	// Parse response
	var response types.TurvoShipmentsResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, nil, fmt.Errorf("failed to decode response: %w", err)
	}

	fmt.Printf("DEBUG: Retrieved %d shipments from Turvo\n", len(response.Details.Shipments))
	
	// Convert to TurvoShipment format for compatibility
	shipments := []types.TurvoShipment{}
	for _, shipmentData := range response.Details.Shipments {
		shipment := convertShipmentDataToTurvoShipment(shipmentData)
		shipments = append(shipments, shipment)
	}
	
	// Return pagination info
	pagination := &types.TurvoPagination{
		Start:               response.Details.Pagination.Start,
		PageSize:            response.Details.Pagination.PageSize,
		TotalRecordsInPage:  response.Details.Pagination.TotalRecordsInPage,
		MoreAvailable:       response.Details.Pagination.MoreAvailable,
	}
	
	return shipments, pagination, nil
}

// GetShipmentDetails fetches detailed information about a specific shipment
func (s *TurvoService) GetShipmentDetails(shipmentID string) (map[string]interface{}, error) {
	// Get OAuth token
	token, err := s.getAccessToken()
	if err != nil {
		return nil, fmt.Errorf("failed to get Turvo OAuth token: %w", err)
	}

	// Create HTTP request
	url := fmt.Sprintf("%s/v1/shipments/%s", s.config.TurvoBaseURL, shipmentID)
	fmt.Printf("DEBUG: Turvo GET shipment details URL: %s\n", url)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("x-api-key", s.config.TurvoXApiKey)

	// Make the request
	fmt.Printf("DEBUG: Making GET request to Turvo for shipment details...\n")
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	fmt.Printf("DEBUG: Turvo GET shipment details response status: %s\n", resp.Status)

	// Read and log the response body for debugging
	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("DEBUG: Turvo GET shipment details response body: %s\n", string(bodyBytes))
	
	// Create a new reader for the JSON decoder since we consumed the body
	resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// Check for HTTP errors
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("Turvo API error: %s - %s", resp.Status, string(bodyBytes))
	}

	// Parse response as generic map to handle the complex structure
	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	fmt.Printf("DEBUG: Retrieved shipment details from Turvo\n")
	
	return response, nil
}

// convertShipmentDataToTurvoShipment converts TurvoShipmentData to TurvoShipment
func convertShipmentDataToTurvoShipment(data types.TurvoShipmentData) types.TurvoShipment {
	// Extract customer name
	var customerName string
	if len(data.CustomerOrder) > 0 {
		customerName = data.CustomerOrder[0].Customer.Name
	}

	// Extract carrier name
	var carrierName string
	if len(data.CarrierOrder) > 0 {
		carrierName = data.CarrierOrder[0].Carrier.Name
	}

	shipment := types.TurvoShipment{
		ShipmentID: fmt.Sprintf("%d", data.ID), // Use internal ID
		Status: types.TurvoStatus{
			Code: types.TurvoCode{
				Key:   data.Status.Code.Key,
				Value: data.Status.Code.Value,
			},
			Notes:       "",
			Description: data.Status.Code.Value,
		},
		Lane: types.TurvoLane{
			Start: "N/A",
			End:   "N/A",
		},
		GlobalRoute: []types.TurvoGlobalRoute{},
		CustomerOrder: []types.TurvoCustomerOrder{
			{
				CustomerOrderSourceID: data.CustomerOrder[0].ID,
				Customer: types.TurvoCustomer{
					ID:   data.CustomerOrder[0].Customer.ID,
					Name: customerName,
				},
			},
		},
		StartDate: types.TurvoDate{
			Date:     data.Created,
			TimeZone: "UTC",
		},
		EndDate: types.TurvoDate{
			Date:     data.Updated,
			TimeZone: "UTC",
		},
		LTLShipment: false,
	}

	// Add carrier order if available
	if len(data.CarrierOrder) > 0 {
		shipment.CarrierOrder = []types.TurvoCarrierOrder{
			{
				CarrierOrderSourceID: data.CarrierOrder[0].ID,
				Carrier: types.TurvoCarrier{
					ID:   data.CarrierOrder[0].Carrier.ID,
					Name: carrierName,
				},
			},
		}
	}

	return shipment
}

// transformDrumkitToTurvo transforms a Drumkit load to Turvo shipment format
func (s *TurvoService) transformDrumkitToTurvo(load types.Load) (*types.TurvoShipmentRequest, error) {
	// Calculate start and end dates from pickup and delivery times
	startDate := load.Pickup.ApptTime
	endDate := load.Consignee.ApptTime

	// If appointment times are not set, use ready time or current time
	if startDate.IsZero() {
		if !load.Pickup.ReadyTime.IsZero() {
			startDate = load.Pickup.ReadyTime
		} else {
			startDate = time.Now().Add(24 * time.Hour) // Default to tomorrow
		}
	}

	if endDate.IsZero() {
		endDate = startDate.Add(72 * time.Hour) // Default to 3 days after pickup
	}

	// Ensure end date is after start date
	if endDate.Before(startDate) {
		endDate = startDate.Add(24 * time.Hour)
	}

	// Format dates in RFC3339 format with timezone - use the same format as the sample
	startDateStr := startDate.Format("2006-01-02T15:04:05Z")
	endDateStr := endDate.Format("2006-01-02T15:04:05Z")

	fmt.Printf("DEBUG: Start date: %s, End date: %s\n", startDateStr, endDateStr)

	// Create Turvo request - simplified to match sample structure
	turvoRequest := &types.TurvoShipmentRequest{
		LTLShipment: false, // Default to FTL
		StartDate: types.TurvoDate{
			Date:     startDateStr,
			TimeZone: "America/New_York", // Default timezone
		},
		EndDate: types.TurvoDate{
			Date:     endDateStr,
			TimeZone: "America/New_York", // Default timezone
		},
		Status: types.TurvoStatus{
			Code: types.TurvoCode{
				Value: "Covered",
				Key:   "2102",
			},
			Notes:       "Created via Drumkit integration",
			Description: "Covered",
		},
		Lane: types.TurvoLane{
			Start: fmt.Sprintf("%s, %s", load.Pickup.City, load.Pickup.State),
			End:   fmt.Sprintf("%s, %s", load.Consignee.City, load.Consignee.State),
		},
	
		
		SkipDistanceCalculation: true,
		GlobalRoute: []types.TurvoGlobalRoute{
			// Pickup stop
			{
				GlobalShipLocationSourceId: "pickup-1",
				Name:                       fmt.Sprintf("%s: %s", load.Pickup.Contact, load.Pickup.RefNumber),
				SchedulingType: types.TurvoCode{
					Key:   "9401",
					Value: "By appointment",
				},
				StopType: types.TurvoCode{
					Key:   "1500",
					Value: "Pickup",
				},
				Timezone:        "America/New_York",
				SegmentSequence: 0,
				LayoverTime: types.TurvoLayoverTime{
					Value: 1,
					Units: types.TurvoCode{
						Key:   "9900",
						Value: "hours",
					},
				},
				Sequence:                0,
				State:                   "OPEN",
				AppointmentConfirmation: true,
				PlannedAppointmentDate: types.TurvoPlannedAppointment{
					SchedulingType: types.TurvoCode{
						Key:   "9401",
						Value: "By appointment",
					},
					Appointment: types.TurvoPlannedAppointmentDetail{
						From: types.TurvoAppointment{
							Date:     startDateStr,
							Timezone: "America/New_York",
							Flex:     3600,
							HasTime:  true,
						},
						To: types.TurvoAppointment{
							Date:     endDateStr,
							Timezone: "America/New_York",
							Flex:     3600,
							HasTime:  true,
						},
					},
				},
				Appointment: types.TurvoAppointment{
					Date:     startDateStr,
					Timezone: "America/New_York",
					Flex:     3600, // 1 hour flex
					HasTime:  true,
				},
				Services: []types.TurvoCode{
					{
						Key:   "21307",
						Value: "After hours",
					},
				},
				PONumbers: []string{load.Specifications.PONums},
				Notes:     load.Pickup.ApptNote,
				Location: types.TurvoLocation{
					ID: 624515, // Use a default location ID like in the sample
				},
				Transportation: types.TurvoTransportation{
					Mode: types.TurvoCode{
						Key:   "24105",
						Value: "TL",
					},
					ServiceType: types.TurvoCode{
						Key:   "24304",
						Value: "Any",
					},
				},
				FragmentDistance: types.TurvoDistance{
					Value: 120,
					Units: types.TurvoCode{
						Key:   "1540",
						Value: "mi",
					},
				},
				Distance: types.TurvoDistance{
					Value: 0,
					Units: types.TurvoCode{
						Key:   "1540",
						Value: "mi",
					},
				},
			},
			// Delivery stop
			{
				GlobalShipLocationSourceId: "delivery-1",
				Name:                       fmt.Sprintf("%s: %s", load.Consignee.Contact, load.Consignee.RefNumber),
				SchedulingType: types.TurvoCode{
					Key:   "9401",
					Value: "By appointment",
				},
				StopType: types.TurvoCode{
					Key:   "1501",
					Value: "Delivery",
				},
				Timezone:        "America/New_York",
				SegmentSequence: 0,
				LayoverTime: types.TurvoLayoverTime{
					Value: 1,
					Units: types.TurvoCode{
						Key:   "9900",
						Value: "hours",
					},
				},
				Sequence:                1,
				State:                   "OPEN",
				AppointmentConfirmation: true,
				PlannedAppointmentDate: types.TurvoPlannedAppointment{
					SchedulingType: types.TurvoCode{
						Key:   "9401",
						Value: "By appointment",
					},
					Appointment: types.TurvoPlannedAppointmentDetail{
						From: types.TurvoAppointment{
							Date:     startDateStr,
							Timezone: "America/New_York",
							Flex:     3600,
							HasTime:  true,
						},
						To: types.TurvoAppointment{
							Date:     endDateStr,
							Timezone: "America/New_York",
							Flex:     3600,
							HasTime:  true,
						},
					},
				},
				Appointment: types.TurvoAppointment{
					Date:     endDateStr,
					Timezone: "America/New_York",
					Flex:     14400, // 4 hours flex
					HasTime:  true,
				},
				Services: []types.TurvoCode{
					{
						Key:   "21407",
						Value: "Delivery Appointment",
					},
				},
				PONumbers: []string{load.Specifications.PONums},
				Notes:     load.Consignee.ApptNote,
				Location: types.TurvoLocation{
					ID: 624515, // Use a default location ID like in the sample
				},
				Transportation: types.TurvoTransportation{
					Mode: types.TurvoCode{
						Key:   "24105",
						Value: "TL",
					},
					ServiceType: types.TurvoCode{
						Key:   "24304",
						Value: "Any",
					},
				},
				FragmentDistance: types.TurvoDistance{
					Value: 120,
					Units: types.TurvoCode{
						Key:   "1540",
						Value: "mi",
					},
				},
				StopLevelFragmentDistance: 120,
			},
		},
		ModeInfo: []types.TurvoModeInfo{
			{
				Operation:              0,
				SourceSegmentSequence: "0",
				Mode: types.TurvoCode{
					Key:   "24105",
					Value: "TL",
				},
				ServiceType: types.TurvoCode{
					Key:   "24304",
					Value: "Any",
				},
				TotalSegmentValue: types.TurvoSegmentValue{
					Sync:  true,
					Value: 0,
					Currency: types.TurvoCode{
						Key:   "1550",
						Value: "USD",
					},
				},
			},
		},
		CustomerOrder: []types.TurvoCustomerOrder{
			{
				CustomerOrderSourceID: 937, // Use sample ID
				Customer: types.TurvoCustomer{
					ID:   834045, // Use sample ID
				},
				Items: []types.TurvoItem{
					{
						ItemCategory: types.TurvoCode{
							Key:   "22300",
							Value: "Other",
						},
						Qty:  load.Specifications.InPalletCount,
						Unit: types.TurvoCode{
							Key:   "6003",
							Value: "Pallets",
						},
						Name: "Freight",
						Notes: fmt.Sprintf("PO: %s, Operator: %s", 
							load.Specifications.PONums, load.Specifications.Operator),
						Operation: 0,
						IsHazmat:  load.Specifications.Hazmat,
						Stackable: true,
						Value:     int(load.RateData.CustomerLhRateUsd * 100), // Convert to cents
						TotalValue: int(load.RateData.CustomerLhRateUsd * float64(load.Specifications.InPalletCount) * 100),
						Currency: types.TurvoCode{
							Key:   "1550",
							Value: "USD",
						},
					},
				},
				Costs: types.TurvoCosts{
					TotalAmount: int(load.RateData.CustomerLhRateUsd * 100), // Convert to cents
					LineItem: []types.TurvoLineItem{
						{
							Code: types.TurvoCode{
								Key:   "1600",
								Value: "Freight - flat",
							},
							Qty:      1,
							Price:    int(load.RateData.CustomerLhRateUsd * 100),
							Amount:   int(load.RateData.CustomerLhRateUsd * 100),
							Billable: true,
							Notes:    "Freight charges",
						},
					},
				},
				ExternalIDs: []types.TurvoExternalID{
					{
						Type: types.TurvoCode{
							Key:   "1400",
							Value: "Purchase order #",
						},
						Value:             load.Specifications.PONums,
						CopyToCarrierOrder: true,
					},
				},
			},
		},
		UseRoutingGuide: true,
	}

	// Add carrier information if available
	if load.Carrier.Name != "" {
		turvoRequest.CarrierOrder = []types.TurvoCarrierOrder{
			{
				CarrierOrderSourceID: 626, // Use sample ID
				Carrier: types.TurvoCarrier{
					ID:   834178, // Use sample ID
				},
				Drivers: []types.TurvoDriver{
					{
						DriverID:        1, // Default ID
						Operation:       0,
						SegmentSequence: 0,
					},
				},
			},
		}
	}

	return turvoRequest, nil
}

 