package types

import "time"

// Load represents the Drumkit load object format
type Load struct {
	ExternalTMSLoadID string         `json:"externalTMSLoadID"`
	FreightLoadID     string         `json:"freightLoadID"`
	Status            string         `json:"status"`
	Customer          Customer       `json:"customer"`
	BillTo            BillTo         `json:"billTo"`
	Pickup            Pickup         `json:"pickup"`
	Consignee         Consignee      `json:"consignee"`
	Carrier           Carrier        `json:"carrier"`
	RateData          RateData       `json:"rateData"`
	Specifications    Specifications `json:"specifications"`
}

// Customer represents the customer object in Drumkit format
type Customer struct {
	ExternalTMSId string `json:"externalTMSId"`
	Name          string `json:"name"`
	AddressLine1  string `json:"addressLine1"`
	AddressLine2  string `json:"addressLine2"`
	City          string `json:"city"`
	State         string `json:"state"`
	Zipcode       string `json:"zipcode"`
	Country       string `json:"country"`
	Contact       string `json:"contact"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	RefNumber     string `json:"refNumber"`
}

// BillTo represents the billTo object in Drumkit format
type BillTo struct {
	ExternalTMSId string `json:"externalTMSId"`
	Name          string `json:"name"`
	AddressLine1  string `json:"addressLine1"`
	AddressLine2  string `json:"addressLine2"`
	City          string `json:"city"`
	State         string `json:"state"`
	Zipcode       string `json:"zipcode"`
	Country       string `json:"country"`
	Contact       string `json:"contact"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
}

// Pickup represents the pickup object in Drumkit format
type Pickup struct {
	ExternalTMSId string    `json:"externalTMSId"`
	Name          string    `json:"name"`
	AddressLine1  string    `json:"addressLine1"`
	AddressLine2  string    `json:"addressLine2"`
	City          string    `json:"city"`
	State         string    `json:"state"`
	Zipcode       string    `json:"zipcode"`
	Country       string    `json:"country"`
	Contact       string    `json:"contact"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	BusinessHours string    `json:"businessHours"`
	RefNumber     string    `json:"refNumber"`
	ReadyTime     time.Time `json:"readyTime"`
	ApptTime      time.Time `json:"apptTime"`
	ApptNote      string    `json:"apptNote"`
	Timezone      string    `json:"timezone"`
	WarehouseID   string    `json:"warehouseId"`
}

// Consignee represents the consignee object in Drumkit format
type Consignee struct {
	ExternalTMSId string    `json:"externalTMSId"`
	Name          string    `json:"name"`
	AddressLine1  string    `json:"addressLine1"`
	AddressLine2  string    `json:"addressLine2"`
	City          string    `json:"city"`
	State         string    `json:"state"`
	Zipcode       string    `json:"zipcode"`
	Country       string    `json:"country"`
	Contact       string    `json:"contact"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
	BusinessHours string    `json:"businessHours"`
	RefNumber     string    `json:"refNumber"`
	MustDeliver   string    `json:"mustDeliver"`
	ApptTime      time.Time `json:"apptTime"`
	ApptNote      string    `json:"apptNote"`
	Timezone      string    `json:"timezone"`
	WarehouseID   string    `json:"warehouseId"`
}

// Carrier represents the carrier object in Drumkit format
type Carrier struct {
	MCNumber                 string    `json:"mcNumber"`
	DOTNumber                string    `json:"dotNumber"`
	Name                     string    `json:"name"`
	Phone                    string    `json:"phone"`
	Dispatcher               string    `json:"dispatcher"`
	SealNumber               string    `json:"sealNumber"`
	SCAC                     string    `json:"scac"`
	FirstDriverName          string    `json:"firstDriverName"`
	FirstDriverPhone         string    `json:"firstDriverPhone"`
	SecondDriverName         string    `json:"secondDriverName"`
	SecondDriverPhone        string    `json:"secondDriverPhone"`
	Email                    string    `json:"email"`
	DispatchCity             string    `json:"dispatchCity"`
	DispatchState            string    `json:"dispatchState"`
	ExternalTMSTruckID       string    `json:"externalTMSTruckId"`
	ExternalTMSTrailerID     string    `json:"externalTMSTrailerId"`
	ConfirmationSentTime     time.Time `json:"confirmationSentTime"`
	ConfirmationReceivedTime time.Time `json:"confirmationReceivedTime"`
	DispatchedTime           time.Time `json:"dispatchedTime"`
	ExpectedPickupTime       time.Time `json:"expectedPickupTime"`
	PickupStart              time.Time `json:"pickupStart"`
	PickupEnd                time.Time `json:"pickupEnd"`
	ExpectedDeliveryTime     time.Time `json:"expectedDeliveryTime"`
	DeliveryStart            time.Time `json:"deliveryStart"`
	DeliveryEnd              time.Time `json:"deliveryEnd"`
	SignedBy                 string    `json:"signedBy"`
	ExternalTMSId            string    `json:"externalTMSId"`
}

// RateData represents the rateData object in Drumkit format
type RateData struct {
	CustomerRateType string  `json:"customerRateType"`
	CustomerNumHours float64 `json:"customerNumHours"`
	CustomerLhRateUsd float64 `json:"customerLhRateUsd"`
	FSCPercent       float64 `json:"fscPercent"`
	FSCPerMile       float64 `json:"fscPerMile"`
	CarrierRateType  string  `json:"carrierRateType"`
	CarrierNumHours  float64 `json:"carrierNumHours"`
	CarrierLhRateUsd float64 `json:"carrierLhRateUsd"`
	CarrierMaxRate   float64 `json:"carrierMaxRate"`
	NetProfitUsd     float64 `json:"netProfitUsd"`
	ProfitPercent    float64 `json:"profitPercent"`
}

// Specifications represents the specifications object in Drumkit format
type Specifications struct {
	InPalletCount      int     `json:"inPalletCount"`
	OutPalletCount     int     `json:"outPalletCount"`
	NumCommodities     int     `json:"numCommodities"`
	TotalWeight        float64 `json:"totalWeight"`
	BillableWeight     float64 `json:"billableWeight"`
	PONums             string  `json:"poNums"`
	Operator           string  `json:"operator"`
	RouteMiles         float64 `json:"routeMiles"`
	MinTempFahrenheit  float64 `json:"minTempFahrenheit"`
	MaxTempFahrenheit  float64 `json:"maxTempFahrenheit"`
	LiftgatePickup     bool    `json:"liftgatePickup"`
	LiftgateDelivery   bool    `json:"liftgateDelivery"`
	InsidePickup       bool    `json:"insidePickup"`
	InsideDelivery     bool    `json:"insideDelivery"`
	Tarps              bool    `json:"tarps"`
	Oversized          bool    `json:"oversized"`
	Hazmat             bool    `json:"hazmat"`
	Straps             bool    `json:"straps"`
	Permits            bool    `json:"permits"`
	Escorts            bool    `json:"escorts"`
	Seal               bool    `json:"seal"`
	CustomBonded       bool    `json:"customBonded"`
	Labor              bool    `json:"labor"`
}

// CreateLoadRequest represents the request body for creating a new load
type CreateLoadRequest struct {
	ExternalTMSLoadID string         `json:"externalTMSLoadID" binding:"required"`
	FreightLoadID     string         `json:"freightLoadID" binding:"required"`
	Status            string         `json:"status" binding:"required"`
	Customer          Customer       `json:"customer" binding:"required"`
	BillTo            BillTo         `json:"billTo" binding:"required"`
	Pickup            Pickup         `json:"pickup" binding:"required"`
	Consignee         Consignee      `json:"consignee" binding:"required"`
	Carrier           Carrier        `json:"carrier"`
	RateData          RateData       `json:"rateData"`
	Specifications    Specifications `json:"specifications"`
} 