package types

import "time"

// TurvoShipmentRequest represents the Turvo API shipment creation request
type TurvoShipmentRequest struct {
	LTLShipment            bool                    `json:"ltlShipment"`
	StartDate              time.Time               `json:"startDate"`
	EndDate                time.Time               `json:"endDate"`
	Status                 TurvoStatus             `json:"status"`
	Equipment              []TurvoEquipment        `json:"equipment,omitempty"`
	Contributors           []TurvoContributor      `json:"contributors,omitempty"`
	Lane                   string                  `json:"lane"`
	GlobalRoute            []TurvoGlobalRoute      `json:"globalRoute"`
	SkipDistanceCalculation bool                   `json:"skipDistanceCalculation,omitempty"`
	ModeInfo               []TurvoModeInfo         `json:"modeInfo,omitempty"`
	FlexAttributes         []TurvoFlexAttribute    `json:"flexAttributes,omitempty"`
	Groups                 []TurvoGroup            `json:"groups,omitempty"`
	CustomerOrder          []TurvoCustomerOrder    `json:"customerOrder"`
	Margin                 *TurvoMargin            `json:"margin,omitempty"`
	Services               []TurvoService          `json:"services,omitempty"`
	CarrierOrder           []TurvoCarrierOrder     `json:"carrierOrder,omitempty"`
	UseRoutingGuide        bool                    `json:"use_routing_guide,omitempty"`
}

// TurvoStatus represents the status with optional note
type TurvoStatus struct {
	Status string `json:"status"`
	Note   string `json:"note,omitempty"`
}

// TurvoEquipment represents equipment required for the shipment
type TurvoEquipment struct {
	EquipmentType string `json:"equipmentType"`
	Quantity      int    `json:"quantity"`
}

// TurvoContributor represents shipment users
type TurvoContributor struct {
	UserID   string `json:"userId"`
	Role     string `json:"role"`
	IsActive bool   `json:"isActive"`
}

// TurvoGlobalRoute represents shipment global route
type TurvoGlobalRoute struct {
	StopID          string           `json:"stopId"`
	StopType        string           `json:"stopType"`
	Location        TurvoLocation    `json:"location"`
	Transportation  []TurvoTransport `json:"transportation"`
	Services        []TurvoService   `json:"services,omitempty"`
	AppointmentTime *time.Time       `json:"appointmentTime,omitempty"`
	BusinessHours   string           `json:"businessHours,omitempty"`
	Notes           string           `json:"notes,omitempty"`
}

// TurvoLocation represents a location in Turvo format
type TurvoLocation struct {
	AddressLine1 string  `json:"addressLine1"`
	AddressLine2 string  `json:"addressLine2,omitempty"`
	City         string  `json:"city"`
	State        string  `json:"state"`
	ZipCode      string  `json:"zipCode"`
	Country      string  `json:"country"`
	ContactName  string  `json:"contactName,omitempty"`
	Phone        string  `json:"phone,omitempty"`
	Email        string  `json:"email,omitempty"`
	Latitude     float64 `json:"latitude,omitempty"`
	Longitude    float64 `json:"longitude,omitempty"`
}

// TurvoTransport represents transportation mode
type TurvoTransport struct {
	Mode        string  `json:"mode"`
	CarrierID   string  `json:"carrierId,omitempty"`
	EquipmentID string  `json:"equipmentId,omitempty"`
	Distance    float64 `json:"distance,omitempty"`
	Duration    int     `json:"duration,omitempty"`
}

// TurvoModeInfo represents mode specific attributes
type TurvoModeInfo struct {
	Mode     string                 `json:"mode"`
	Attributes map[string]interface{} `json:"attributes"`
}

// TurvoFlexAttribute represents flex attributes
type TurvoFlexAttribute struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// TurvoGroup represents visibility groups
type TurvoGroup struct {
	GroupID   string `json:"groupId"`
	GroupName string `json:"groupName"`
}

// TurvoCustomerOrder represents customer order
type TurvoCustomerOrder struct {
	CustomerID    string  `json:"customerId"`
	OrderNumber   string  `json:"orderNumber"`
	Reference     string  `json:"reference"`
	TotalWeight   float64 `json:"totalWeight"`
	TotalVolume   float64 `json:"totalVolume,omitempty"`
	TotalPallets  int     `json:"totalPallets,omitempty"`
	TotalPieces   int     `json:"totalPieces,omitempty"`
	SpecialInstructions string `json:"specialInstructions,omitempty"`
}

// TurvoMargin represents margin information
type TurvoMargin struct {
	MarginType   string  `json:"marginType"`
	MarginAmount float64 `json:"marginAmount"`
	MarginPercent float64 `json:"marginPercent,omitempty"`
}

// TurvoService represents services required
type TurvoService struct {
	ServiceType string `json:"serviceType"`
	ServiceKey  string `json:"serviceKey,omitempty"`
	ServiceValue string `json:"serviceValue,omitempty"`
}

// TurvoCarrierOrder represents carrier order
type TurvoCarrierOrder struct {
	CarrierID    string  `json:"carrierId"`
	OrderNumber  string  `json:"orderNumber"`
	Rate         float64 `json:"rate"`
	RateType     string  `json:"rateType"`
	EquipmentID  string  `json:"equipmentId,omitempty"`
	DriverName   string  `json:"driverName,omitempty"`
	DriverPhone  string  `json:"driverPhone,omitempty"`
	TrailerNumber string `json:"trailerNumber,omitempty"`
}

// TurvoShipmentResponse represents the Turvo API response
type TurvoShipmentResponse struct {
	ShipmentID string `json:"shipmentId"`
	Status     string `json:"status"`
	Message    string `json:"message,omitempty"`
	Error      string `json:"error,omitempty"`
} 