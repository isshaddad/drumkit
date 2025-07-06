export interface Load {
  // New Drumkit format
  externalTMSLoadID?: string;
  freightLoadID?: string;
  status: string;
  customer?: Customer;
  billTo?: BillTo;
  pickup?: Pickup;
  consignee?: Consignee;
  carrier?: Carrier;
  rateData?: RateData;
  specifications?: Specifications;

  // Legacy format (for backward compatibility)
  id?: string;
  reference?: string;
  origin?: string;
  destination?: string;
  weight?: number;
  created_at?: string;
}

export interface CreateLoadRequest {
  externalTMSLoadID: string;
  freightLoadID: string;
  status: string;
  customer: Customer;
  billTo: BillTo;
  pickup: Pickup;
  consignee: Consignee;
  carrier: Carrier;
  rateData: RateData;
  specifications: Specifications;
}

export interface Customer {
  externalTMSId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  refNumber: string;
}

export interface BillTo {
  externalTMSId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
}

export interface Pickup {
  externalTMSId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  businessHours: string;
  refNumber: string;
  readyTime: string;
  apptTime: string;
  apptNote: string;
  timezone: string;
  warehouseId: string;
}

export interface Consignee {
  externalTMSId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  businessHours: string;
  refNumber: string;
  mustDeliver: string;
  apptTime: string;
  apptNote: string;
  timezone: string;
  warehouseId: string;
}

export interface Carrier {
  mcNumber: string;
  dotNumber: string;
  name: string;
  phone: string;
  dispatcher: string;
  sealNumber: string;
  scac: string;
  firstDriverName: string;
  firstDriverPhone: string;
  secondDriverName: string;
  secondDriverPhone: string;
  email: string;
  dispatchCity: string;
  dispatchState: string;
  externalTMSTruckId: string;
  externalTMSTrailerId: string;
  confirmationSentTime: string;
  confirmationReceivedTime: string;
  dispatchedTime: string;
  expectedPickupTime: string;
  pickupStart: string;
  pickupEnd: string;
  expectedDeliveryTime: string;
  deliveryStart: string;
  deliveryEnd: string;
  signedBy: string;
  externalTMSId: string;
}

export interface RateData {
  customerRateType: string;
  customerNumHours: number;
  customerLhRateUsd: number;
  fscPercent: number;
  fscPerMile: number;
  carrierRateType: string;
  carrierNumHours: number;
  carrierLhRateUsd: number;
  carrierMaxRate: number;
  netProfitUsd: number;
  profitPercent: number;
}

export interface Specifications {
  inPalletCount: number;
  outPalletCount: number;
  numCommodities: number;
  totalWeight: number;
  billableWeight: number;
  poNums: string;
  operator: string;
  routeMiles: number;
  minTempFahrenheit: number;
  maxTempFahrenheit: number;
  liftgatePickup: boolean;
  liftgateDelivery: boolean;
  insidePickup: boolean;
  insideDelivery: boolean;
  tarps: boolean;
  oversized: boolean;
  hazmat: boolean;
  straps: boolean;
  permits: boolean;
  escorts: boolean;
  seal: boolean;
  customBonded: boolean;
  labor: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
