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

	// Create Turvo request
	turvoRequest := &types.TurvoShipmentRequest{
		LTLShipment: false, // Default to FTL
		StartDate:   startDate,
		EndDate:     endDate,
		Status: types.TurvoStatus{
			Status: load.Status,
			Note:   "Created via Drumkit integration",
		},
		Lane: fmt.Sprintf("%s, %s to %s, %s", 
			load.Pickup.City, load.Pickup.State, 
			load.Consignee.City, load.Consignee.State),
		GlobalRoute: []types.TurvoGlobalRoute{
			// Pickup stop
			{
				StopID:   "pickup-1",
				StopType: "pickup",
				Location: types.TurvoLocation{
					AddressLine1: load.Pickup.AddressLine1,
					AddressLine2: load.Pickup.AddressLine2,
					City:         load.Pickup.City,
					State:        load.Pickup.State,
					ZipCode:      load.Pickup.Zipcode,
					Country:      load.Pickup.Country,
					ContactName:  load.Pickup.Contact,
					Phone:        load.Pickup.Phone,
					Email:        load.Pickup.Email,
				},
				Transportation: []types.TurvoTransport{
					{
						Mode: "truck",
					},
				},
				AppointmentTime: &load.Pickup.ApptTime,
				BusinessHours:   load.Pickup.BusinessHours,
				Notes:           load.Pickup.ApptNote,
			},
			// Delivery stop
			{
				StopID:   "delivery-1",
				StopType: "delivery",
				Location: types.TurvoLocation{
					AddressLine1: load.Consignee.AddressLine1,
					AddressLine2: load.Consignee.AddressLine2,
					City:         load.Consignee.City,
					State:        load.Consignee.State,
					ZipCode:      load.Consignee.Zipcode,
					Country:      load.Consignee.Country,
					ContactName:  load.Consignee.Contact,
					Phone:        load.Consignee.Phone,
					Email:        load.Consignee.Email,
				},
				Transportation: []types.TurvoTransport{
					{
						Mode: "truck",
					},
				},
				AppointmentTime: &load.Consignee.ApptTime,
				BusinessHours:   load.Consignee.BusinessHours,
				Notes:           load.Consignee.ApptNote,
			},
		},
		CustomerOrder: []types.TurvoCustomerOrder{
			{
				CustomerID:    load.Customer.ExternalTMSId,
				OrderNumber:   load.FreightLoadID,
				Reference:     load.ExternalTMSLoadID,
				TotalWeight:   load.Specifications.TotalWeight,
				TotalPallets:  load.Specifications.InPalletCount,
				SpecialInstructions: fmt.Sprintf("PO: %s, Operator: %s", 
					load.Specifications.PONums, load.Specifications.Operator),
			},
		},
		Services: s.buildServices(load.Specifications),
	}

	// Add carrier information if available
	if load.Carrier.ExternalTMSId != "" {
		turvoRequest.CarrierOrder = []types.TurvoCarrierOrder{
			{
				CarrierID:    load.Carrier.ExternalTMSId,
				OrderNumber:  load.FreightLoadID,
				Rate:         load.RateData.CarrierMaxRate,
				RateType:     load.RateData.CarrierRateType,
				DriverName:   load.Carrier.FirstDriverName,
				DriverPhone:  load.Carrier.FirstDriverPhone,
				TrailerNumber: load.Carrier.ExternalTMSTrailerID,
			},
		}
	}

	// Add margin information if available
	if load.RateData.NetProfitUsd > 0 {
		turvoRequest.Margin = &types.TurvoMargin{
			MarginType:    "fixed",
			MarginAmount:  load.RateData.NetProfitUsd,
			MarginPercent: load.RateData.ProfitPercent,
		}
	}

	return turvoRequest, nil
}

// buildServices converts Drumkit specifications to Turvo services
func (s *TurvoService) buildServices(specs types.Specifications) []types.TurvoService {
	var services []types.TurvoService

	// Add temperature control if specified
	if specs.MinTempFahrenheit > 0 || specs.MaxTempFahrenheit > 0 {
		services = append(services, types.TurvoService{
			ServiceType: "temperature_control",
			ServiceKey:  "temperature_range",
			ServiceValue: fmt.Sprintf("%.0f-%.0f", specs.MinTempFahrenheit, specs.MaxTempFahrenheit),
		})
	}

	// Add liftgate services
	if specs.LiftgatePickup {
		services = append(services, types.TurvoService{
			ServiceType: "liftgate",
			ServiceKey:  "location",
			ServiceValue: "pickup",
		})
	}

	if specs.LiftgateDelivery {
		services = append(services, types.TurvoService{
			ServiceType: "liftgate",
			ServiceKey:  "location",
			ServiceValue: "delivery",
		})
	}

	// Add inside delivery/pickup services
	if specs.InsidePickup {
		services = append(services, types.TurvoService{
			ServiceType: "inside_pickup",
		})
	}

	if specs.InsideDelivery {
		services = append(services, types.TurvoService{
			ServiceType: "inside_delivery",
		})
	}

	// Add other services
	if specs.Tarps {
		services = append(services, types.TurvoService{
			ServiceType: "tarps",
		})
	}

	if specs.Straps {
		services = append(services, types.TurvoService{
			ServiceType: "straps",
		})
	}

	if specs.Hazmat {
		services = append(services, types.TurvoService{
			ServiceType: "hazmat",
		})
	}

	if specs.Oversized {
		services = append(services, types.TurvoService{
			ServiceType: "oversized",
		})
	}

	if specs.Permits {
		services = append(services, types.TurvoService{
			ServiceType: "permits",
		})
	}

	if specs.Escorts {
		services = append(services, types.TurvoService{
			ServiceType: "escorts",
		})
	}

	if specs.Seal {
		services = append(services, types.TurvoService{
			ServiceType: "seal",
		})
	}

	if specs.CustomBonded {
		services = append(services, types.TurvoService{
			ServiceType: "custom_bonded",
		})
	}

	if specs.Labor {
		services = append(services, types.TurvoService{
			ServiceType: "labor",
		})
	}

	return services
} 