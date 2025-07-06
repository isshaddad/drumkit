package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"turvo-app/config"
	"turvo-app/types"
)

// TurvoService handles Turvo API interactions
type TurvoService struct {
	config *config.Config
	client *http.Client
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

	// Create HTTP request
	url := fmt.Sprintf("%s/v1/shipments", s.config.TurvoBaseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.config.TurvoAPIKey))
	req.Header.Set("X-Client-Name", s.config.TurvoClientName)
	req.Header.Set("X-Client-Secret", s.config.TurvoClientSecret)

	// Make the request
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	// Parse response
	var turvoResponse types.TurvoShipmentResponse
	if err := json.NewDecoder(resp.Body).Decode(&turvoResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

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