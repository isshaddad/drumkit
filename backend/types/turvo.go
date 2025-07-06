package types


// TurvoShipmentRequest represents the Turvo API shipment creation request
type TurvoShipmentRequest struct {
	LTLShipment            bool                    `json:"ltlShipment"`
	StartDate              TurvoDate               `json:"startDate"`
	EndDate                TurvoDate               `json:"endDate"`
	Status                 TurvoStatus             `json:"status"`
	Groups                 []TurvoGroup            `json:"groups,omitempty"`
	Contributors           []TurvoContributor      `json:"contributors,omitempty"`
	Equipment              []TurvoEquipment        `json:"equipment,omitempty"`
	Lane                   TurvoLane               `json:"lane"`
	GlobalRoute            []TurvoGlobalRoute      `json:"globalRoute"`
	SkipDistanceCalculation bool                   `json:"skipDistanceCalculation,omitempty"`
	ModeInfo               []TurvoModeInfo         `json:"modeInfo,omitempty"`
	CustomerOrder          []TurvoCustomerOrder    `json:"customerOrder"`
	CarrierOrder           []TurvoCarrierOrder     `json:"carrierOrder,omitempty"`
	UseRoutingGuide        bool                    `json:"use_routing_guide,omitempty"`
}

// TurvoDate represents a date with timezone
type TurvoDate struct {
	Date     string `json:"date"`
	TimeZone string `json:"timeZone"`
}

// TurvoStatus represents the status with code structure
type TurvoStatus struct {
	Code        TurvoCode `json:"code"`
	Notes       string    `json:"notes"`
	Description string    `json:"description"`
}

// TurvoCode represents a key-value code
type TurvoCode struct {
	Value string `json:"value"`
	Key   string `json:"key"`
}

// TurvoLane represents the lane with start and end
type TurvoLane struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

// TurvoGroup represents visibility groups
type TurvoGroup struct {
	ID         int `json:"id"`
	Name       string `json:"name"`
	Operation  int `json:"_operation"`
}

// TurvoContributor represents shipment users
type TurvoContributor struct {
	Type            TurvoCode        `json:"type"`
	ContributorUser TurvoContributorUser `json:"contributorUser"`
	Operation       int              `json:"_operation"`
}

// TurvoContributorUser represents a contributor user
type TurvoContributorUser struct {
	ID int `json:"id"`
}

// TurvoEquipment represents equipment required for the shipment
type TurvoEquipment struct {
	Operation   int           `json:"_operation"`
	Type        TurvoCode     `json:"type"`
	Size        TurvoCode     `json:"size,omitempty"`
	Weight      int           `json:"weight,omitempty"`
	WeightUnits TurvoCode     `json:"weightUnits,omitempty"`
	Temp        int           `json:"temp,omitempty"`
	TempUnits   TurvoCode     `json:"tempUnits,omitempty"`
}

// TurvoGlobalRoute represents shipment global route
type TurvoGlobalRoute struct {
	GlobalShipLocationSourceId string                    `json:"globalShipLocationSourceId"`
	Name                       string                    `json:"name"`
	SchedulingType             TurvoCode                 `json:"schedulingType"`
	StopType                   TurvoCode                 `json:"stopType"`
	Timezone                   string                    `json:"timezone"`
	Location                   TurvoLocation             `json:"location"`
	SegmentSequence            int                       `json:"segmentSequence"`
	LayoverTime                TurvoLayoverTime          `json:"layoverTime"`
	Sequence                   int                       `json:"sequence"`
	State                      string                    `json:"state"`
	Appointment                TurvoAppointment          `json:"appointment"`
	AppointmentConfirmation    bool                      `json:"appointmentConfirmation"`
	PlannedAppointmentDate     TurvoPlannedAppointment   `json:"plannedAppointmentDate,omitempty"`
	Services                   []TurvoCode               `json:"services,omitempty"`
	PONumbers                  []string                  `json:"poNumbers,omitempty"`
	Notes                      string                    `json:"notes,omitempty"`
	CustomerOrder              []TurvoRouteCustomerOrder `json:"customerOrder,omitempty"`
	CarrierOrder               []TurvoRouteCarrierOrder  `json:"carrierOrder,omitempty"`
	Transportation             TurvoTransportation       `json:"transportation"`
	FragmentDistance           TurvoDistance             `json:"fragmentDistance,omitempty"`
	Distance                   TurvoDistance             `json:"distance,omitempty"`
	StopLevelFragmentDistance  int                       `json:"stop_level_fragment_distance,omitempty"`
}

// TurvoLocation represents a location in Turvo format
type TurvoLocation struct {
	ID int `json:"id,omitempty"`
	// For creation, we might need address fields
	AddressLine1 string  `json:"addressLine1,omitempty"`
	AddressLine2 string  `json:"addressLine2,omitempty"`
	City         string  `json:"city,omitempty"`
	State        string  `json:"state,omitempty"`
	ZipCode      string  `json:"zipCode,omitempty"`
	Country      string  `json:"country,omitempty"`
	ContactName  string  `json:"contactName,omitempty"`
	Phone        string  `json:"phone,omitempty"`
	Email        string  `json:"email,omitempty"`
}

// TurvoLayoverTime represents layover time
type TurvoLayoverTime struct {
	Value int      `json:"value"`
	Units TurvoCode `json:"units"`
}

// TurvoAppointment represents an appointment
type TurvoAppointment struct {
	Date     string `json:"date"`
	Timezone string `json:"timezone"`
	Flex     int    `json:"flex"`
	HasTime  bool   `json:"hasTime"`
}

// TurvoPlannedAppointment represents planned appointment
type TurvoPlannedAppointment struct {
	SchedulingType TurvoCode                `json:"schedulingType"`
	Appointment    TurvoPlannedAppointmentDetail `json:"appointment"`
}

// TurvoPlannedAppointmentDetail represents planned appointment detail
type TurvoPlannedAppointmentDetail struct {
	From TurvoAppointment `json:"from"`
	To   TurvoAppointment `json:"to"`
}

// TurvoRouteCustomerOrder represents customer order in route
type TurvoRouteCustomerOrder struct {
	CustomerID              int `json:"customerId"`
	CustomerOrderSourceID   int `json:"customerOrderSourceId"`
}

// TurvoRouteCarrierOrder represents carrier order in route
type TurvoRouteCarrierOrder struct {
	CarrierID             int `json:"carrierId"`
	CarrierOrderSourceID  int `json:"carrierOrderSourceId"`
}

// TurvoTransportation represents transportation mode
type TurvoTransportation struct {
	Mode        TurvoCode `json:"mode"`
	ServiceType TurvoCode `json:"serviceType"`
}

// TurvoDistance represents distance with units
type TurvoDistance struct {
	Value int      `json:"value"`
	Units TurvoCode `json:"units"`
}

// TurvoModeInfo represents mode specific attributes
type TurvoModeInfo struct {
	Operation           int           `json:"_operation"`
	SourceSegmentSequence string      `json:"sourceSegmentSequence"`
	Mode                TurvoCode     `json:"mode"`
	ServiceType         TurvoCode     `json:"serviceType"`
	TotalSegmentValue   TurvoSegmentValue `json:"totalSegmentValue"`
}

// TurvoSegmentValue represents segment value
type TurvoSegmentValue struct {
	Sync     bool      `json:"sync"`
	Value    int       `json:"value"`
	Currency TurvoCode `json:"currency"`
}

// TurvoCustomerOrder represents customer order
type TurvoCustomerOrder struct {
	CustomerOrderSourceID int                    `json:"customerOrderSourceId"`
	Customer              TurvoCustomer          `json:"customer"`
	Items                 []TurvoItem            `json:"items,omitempty"`
	Costs                 TurvoCosts             `json:"costs,omitempty"`
	ExternalIDs           []TurvoExternalID      `json:"externalIds,omitempty"`
}

// TurvoCustomer represents a customer
type TurvoCustomer struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// TurvoItem represents an item
type TurvoItem struct {
	Dimensions           TurvoDimensions     `json:"dimensions,omitempty"`
	ItemCategory         TurvoCode           `json:"itemCategory"`
	Qty                  int                 `json:"qty"`
	Unit                 TurvoCode           `json:"unit"`
	HandlingQty          int                 `json:"handlingQty,omitempty"`
	HandlingUnit         TurvoCode           `json:"handlingUnit,omitempty"`
	Name                 string              `json:"name"`
	Notes                string              `json:"notes,omitempty"`
	PickupLocation       []TurvoItemLocation `json:"pickupLocation,omitempty"`
	DeliveryLocation     []TurvoItemLocation `json:"deliveryLocation,omitempty"`
	Operation            int                 `json:"_operation"`
	ItemNumber           string              `json:"itemNumber,omitempty"`
	NMFC                 string              `json:"nmfc,omitempty"`
	NMFCSub              string              `json:"nmfcSub,omitempty"`
	IsHazmat             bool                `json:"isHazmat,omitempty"`
	Stackable            bool                `json:"stackable,omitempty"`
	FreightClass         TurvoCode           `json:"freightClass,omitempty"`
	Value                int                 `json:"value,omitempty"`
	TotalValue           int                 `json:"totalValue,omitempty"`
	Currency             TurvoCode           `json:"currency,omitempty"`
	MinTemp              TurvoTemperature    `json:"minTemp,omitempty"`
	MaxTemp              TurvoTemperature    `json:"maxTemp,omitempty"`
	StackDimensionsLimit TurvoStackDimensions `json:"stackDimensionsLimit,omitempty"`
	LoadBearingCapacity  TurvoLoadBearing    `json:"loadBearingCapacity,omitempty"`
	MaxStackCount        int                 `json:"maxStackCount,omitempty"`
}

// TurvoDimensions represents dimensions
type TurvoDimensions struct {
	Length int      `json:"length"`
	Width  int      `json:"width"`
	Height int      `json:"height"`
	Units  TurvoCode `json:"units"`
}

// TurvoItemLocation represents item location
type TurvoItemLocation struct {
	GlobalShipLocationSourceID string `json:"globalShipLocationSourceId"`
	Name                       string `json:"name"`
}

// TurvoTemperature represents temperature
type TurvoTemperature struct {
	Temp     int      `json:"temp"`
	TempUnit TurvoCode `json:"tempUnit"`
}

// TurvoStackDimensions represents stack dimensions
type TurvoStackDimensions struct {
	Height int      `json:"height"`
	Width  int      `json:"width"`
	Unit   TurvoCode `json:"unit"`
}

// TurvoLoadBearing represents load bearing capacity
type TurvoLoadBearing struct {
	Value int      `json:"value"`
	Unit  TurvoCode `json:"unit"`
}

// TurvoCosts represents costs
type TurvoCosts struct {
	TotalAmount int           `json:"totalAmount"`
	LineItem    []TurvoLineItem `json:"lineItem"`
}

// TurvoLineItem represents a line item
type TurvoLineItem struct {
	Code     TurvoCode `json:"code"`
	Qty      int       `json:"qty"`
	Price    int       `json:"price"`
	Amount   int       `json:"amount"`
	Billable bool      `json:"billable"`
	Notes    string    `json:"notes,omitempty"`
}

// TurvoExternalID represents external ID
type TurvoExternalID struct {
	Type              TurvoCode `json:"type"`
	Value             string    `json:"value"`
	CopyToCarrierOrder bool     `json:"copyToCarrierOrder"`
}

// TurvoCarrierOrder represents carrier order
type TurvoCarrierOrder struct {
	CarrierOrderSourceID int           `json:"carrierOrderSourceId"`
	Carrier              TurvoCarrier  `json:"carrier"`
	Drivers              []TurvoDriver `json:"drivers,omitempty"`
}

// TurvoCarrier represents a carrier
type TurvoCarrier struct {
	Name string `json:"name"`
	ID   int    `json:"id"`
}

// TurvoDriver represents a driver
type TurvoDriver struct {
	DriverID        int `json:"driverId"`
	Operation       int `json:"_operation"`
	SegmentSequence int `json:"segmentSequence"`
}

// TurvoShipmentResponse represents the Turvo API response
type TurvoShipmentResponse struct {
	ShipmentID string `json:"shipmentId"`
	Status     string `json:"status"`
	Message    string `json:"message,omitempty"`
	Error      string `json:"error,omitempty"`
}

// TurvoShipment represents a shipment from Turvo's GET /shipments API
type TurvoShipment struct {
	ShipmentID string `json:"shipmentId"`
	Status     TurvoStatus `json:"status"`
	Lane       TurvoLane `json:"lane"`
	GlobalRoute []TurvoGlobalRoute `json:"globalRoute"`
	CustomerOrder []TurvoCustomerOrder `json:"customerOrder"`
	CarrierOrder []TurvoCarrierOrder `json:"carrierOrder,omitempty"`
	StartDate  TurvoDate `json:"startDate"`
	EndDate    TurvoDate `json:"endDate"`
	LTLShipment bool `json:"ltlShipment"`
}

// TurvoShipmentsResponse represents the response from GET /shipments
type TurvoShipmentsResponse struct {
	Status  string `json:"Status"`
	Details struct {
		Pagination struct {
			Start              int `json:"start"`
			PageSize           int `json:"pageSize"`
			TotalRecordsInPage int `json:"totalRecordsInPage"`
			MoreAvailable      bool `json:"moreAvailable"`
		} `json:"pagination"`
		Shipments []TurvoShipmentData `json:"shipments"`
	} `json:"details"`
}

// TurvoShipmentData represents the actual shipment data in the response
type TurvoShipmentData struct {
	ID           int    `json:"id"`
	CustomID     string `json:"customId"`
	Status       struct {
		Code struct {
			Key   string `json:"key"`
			Value string `json:"value"`
		} `json:"code"`
	} `json:"status"`
	CustomerOrder []struct {
		ID       int `json:"id"`
		Customer struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		} `json:"customer"`
		Deleted bool `json:"deleted"`
	} `json:"customerOrder"`
	CarrierOrder []struct {
		ID      int `json:"id"`
		Carrier struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		} `json:"carrier"`
		Deleted bool `json:"deleted"`
	} `json:"carrierOrder"`
	Created       string `json:"created"`
	Updated       string `json:"updated"`
	LastUpdatedOn string `json:"lastUpdatedOn"`
	CreatedDate   string `json:"createdDate"`
} 