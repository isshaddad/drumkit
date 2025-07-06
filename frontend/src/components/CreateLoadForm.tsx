import React, { useState } from 'react';
import { CreateLoadRequest } from '../types';
import { loadService } from '../services/api';

interface CreateLoadFormProps {
  onLoadCreated: () => void;
}

const CreateLoadForm: React.FC<CreateLoadFormProps> = ({ onLoadCreated }) => {
  // Helper function to format datetime for datetime-local input
  const formatDateTimeForInput = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM for datetime-local input
  };

  const [formData, setFormData] = useState<CreateLoadRequest>({
    externalTMSLoadID: 'TURVO-2025-001',
    freightLoadID: 'FL-2025-001',
    status: 'Created',
    customer: {
      externalTMSId: 'CUST-001',
      name: 'Acme Corporation',
      addressLine1: '123 Main Street',
      addressLine2: 'Suite 100',
      city: 'Los Angeles',
      state: 'CA',
      zipcode: '90210',
      country: 'USA',
      contact: 'John Smith',
      phone: '555-123-4567',
      email: 'john.smith@acme.com',
      refNumber: 'REF-ACME-001',
    },
    billTo: {
      externalTMSId: 'BILL-001',
      name: 'Acme Corporation Billing',
      addressLine1: '456 Billing Avenue',
      addressLine2: 'Floor 2',
      city: 'Los Angeles',
      state: 'CA',
      zipcode: '90211',
      country: 'USA',
      contact: 'Jane Doe',
      phone: '555-987-6543',
      email: 'billing@acme.com',
    },
    pickup: {
      externalTMSId: 'PICKUP-001',
      name: 'Acme Warehouse',
      addressLine1: '789 Industrial Boulevard',
      addressLine2: 'Building A',
      city: 'Long Beach',
      state: 'CA',
      zipcode: '90802',
      country: 'USA',
      contact: 'Mike Johnson',
      phone: '555-456-7890',
      email: 'warehouse@acme.com',
      businessHours: '8AM-5PM',
      refNumber: 'WH-ACME-001',
      readyTime: formatDateTimeForInput('2025-07-06T08:00:00Z'),
      apptTime: formatDateTimeForInput('2025-07-07T09:00:00Z'),
      apptNote: 'Call 30 minutes before arrival',
      timezone: 'PST',
      warehouseId: 'WH-001',
    },
    consignee: {
      externalTMSId: 'DELIVERY-001',
      name: 'Acme Distribution Center',
      addressLine1: '321 Delivery Street',
      addressLine2: 'Building B',
      city: 'New York',
      state: 'NY',
      zipcode: '10001',
      country: 'USA',
      contact: 'Sarah Wilson',
      phone: '555-789-0123',
      email: 'receiving@acme.com',
      businessHours: '9AM-6PM',
      refNumber: 'DC-ACME-001',
      mustDeliver: 'Yes',
      apptTime: formatDateTimeForInput('2025-07-08T14:00:00Z'),
      apptNote: 'Inside delivery required',
      timezone: 'EST',
      warehouseId: 'DC-001',
    },
    carrier: {
      mcNumber: 'MC123456',
      dotNumber: 'DOT123456',
      name: 'Reliable Trucking Co',
      phone: '555-111-2222',
      dispatcher: 'Bob Dispatch',
      sealNumber: 'SEAL123456',
      scac: 'RELI',
      firstDriverName: 'Tom Driver',
      firstDriverPhone: '555-333-4444',
      secondDriverName: 'Jerry CoDriver',
      secondDriverPhone: '555-555-6666',
      email: 'dispatch@reliabletrucking.com',
      dispatchCity: 'Los Angeles',
      dispatchState: 'CA',
      externalTMSTruckId: 'TRUCK-001',
      externalTMSTrailerId: 'TRAILER-001',
      confirmationSentTime: formatDateTimeForInput('2025-07-06T10:00:00Z'),
      confirmationReceivedTime: formatDateTimeForInput('2025-07-06T10:30:00Z'),
      dispatchedTime: formatDateTimeForInput('2025-07-06T11:00:00Z'),
      expectedPickupTime: formatDateTimeForInput('2025-07-07T09:00:00Z'),
      pickupStart: formatDateTimeForInput('2025-07-07T09:00:00Z'),
      pickupEnd: formatDateTimeForInput('2025-07-07T11:00:00Z'),
      expectedDeliveryTime: formatDateTimeForInput('2025-07-08T14:00:00Z'),
      deliveryStart: formatDateTimeForInput('2025-07-08T14:00:00Z'),
      deliveryEnd: formatDateTimeForInput('2025-07-08T16:00:00Z'),
      signedBy: 'Sarah Wilson',
      externalTMSId: 'CARRIER-001',
    },
    rateData: {
      customerRateType: 'Flat',
      customerNumHours: 2.0,
      customerLhRateUsd: 2500.0,
      fscPercent: 15.5,
      fscPerMile: 0.25,
      carrierRateType: 'Flat',
      carrierNumHours: 2.0,
      carrierLhRateUsd: 2000.0,
      carrierMaxRate: 2200.0,
      netProfitUsd: 500.0,
      profitPercent: 20.0,
    },
    specifications: {
      inPalletCount: 20,
      outPalletCount: 20,
      numCommodities: 5,
      totalWeight: 5000.0,
      billableWeight: 5000.0,
      poNums: 'PO-2025-001, PO-2025-002',
      operator: 'John Operator',
      routeMiles: 500.0,
      minTempFahrenheit: 32.0,
      maxTempFahrenheit: 75.0,
      liftgatePickup: true,
      liftgateDelivery: true,
      insidePickup: true,
      insideDelivery: true,
      tarps: false,
      oversized: false,
      hazmat: false,
      straps: true,
      permits: false,
      escorts: false,
      seal: true,
      customBonded: false,
      labor: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => {
      if (
        section === 'externalTMSLoadID' ||
        section === 'freightLoadID' ||
        section === 'status'
      ) {
        return {
          ...prev,
          [section]: value,
        };
      }

      return {
        ...prev,
        [section]: {
          ...(prev[section as keyof CreateLoadRequest] as any),
          [field]: value,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Format datetime fields to RFC3339 format before sending
      const formattedData = {
        ...formData,
        pickup: {
          ...formData.pickup,
          readyTime: formData.pickup.readyTime
            ? new Date(formData.pickup.readyTime).toISOString()
            : '',
          apptTime: formData.pickup.apptTime
            ? new Date(formData.pickup.apptTime).toISOString()
            : '',
        },
        consignee: {
          ...formData.consignee,
          apptTime: formData.consignee.apptTime
            ? new Date(formData.consignee.apptTime).toISOString()
            : '',
        },
        carrier: {
          ...formData.carrier,
          confirmationSentTime: formData.carrier.confirmationSentTime
            ? new Date(formData.carrier.confirmationSentTime).toISOString()
            : '',
          confirmationReceivedTime: formData.carrier.confirmationReceivedTime
            ? new Date(formData.carrier.confirmationReceivedTime).toISOString()
            : '',
          dispatchedTime: formData.carrier.dispatchedTime
            ? new Date(formData.carrier.dispatchedTime).toISOString()
            : '',
          expectedPickupTime: formData.carrier.expectedPickupTime
            ? new Date(formData.carrier.expectedPickupTime).toISOString()
            : '',
          pickupStart: formData.carrier.pickupStart
            ? new Date(formData.carrier.pickupStart).toISOString()
            : '',
          pickupEnd: formData.carrier.pickupEnd
            ? new Date(formData.carrier.pickupEnd).toISOString()
            : '',
          expectedDeliveryTime: formData.carrier.expectedDeliveryTime
            ? new Date(formData.carrier.expectedDeliveryTime).toISOString()
            : '',
          deliveryStart: formData.carrier.deliveryStart
            ? new Date(formData.carrier.deliveryStart).toISOString()
            : '',
          deliveryEnd: formData.carrier.deliveryEnd
            ? new Date(formData.carrier.deliveryEnd).toISOString()
            : '',
        },
      };

      const response = await loadService.createLoad(formattedData);
      if (response.success) {
        setSuccess(true);
        setFormData({
          externalTMSLoadID: 'TURVO-2025-002',
          freightLoadID: 'FL-2025-002',
          status: 'Created',
          customer: {
            externalTMSId: 'CUST-001',
            name: 'Acme Corporation',
            addressLine1: '123 Main Street',
            addressLine2: 'Suite 100',
            city: 'Los Angeles',
            state: 'CA',
            zipcode: '90210',
            country: 'USA',
            contact: 'John Smith',
            phone: '555-123-4567',
            email: 'john.smith@acme.com',
            refNumber: 'REF-ACME-001',
          },
          billTo: {
            externalTMSId: 'BILL-001',
            name: 'Acme Corporation Billing',
            addressLine1: '456 Billing Avenue',
            addressLine2: 'Floor 2',
            city: 'Los Angeles',
            state: 'CA',
            zipcode: '90211',
            country: 'USA',
            contact: 'Jane Doe',
            phone: '555-987-6543',
            email: 'billing@acme.com',
          },
          pickup: {
            externalTMSId: 'PICKUP-001',
            name: 'Acme Warehouse',
            addressLine1: '789 Industrial Boulevard',
            addressLine2: 'Building A',
            city: 'Long Beach',
            state: 'CA',
            zipcode: '90802',
            country: 'USA',
            contact: 'Mike Johnson',
            phone: '555-456-7890',
            email: 'warehouse@acme.com',
            businessHours: '8AM-5PM',
            refNumber: 'WH-ACME-001',
            readyTime: '2025-07-06T08:00:00Z',
            apptTime: '2025-07-07T09:00:00Z',
            apptNote: 'Call 30 minutes before arrival',
            timezone: 'PST',
            warehouseId: 'WH-001',
          },
          consignee: {
            externalTMSId: 'DELIVERY-001',
            name: 'Acme Distribution Center',
            addressLine1: '321 Delivery Street',
            addressLine2: 'Building B',
            city: 'New York',
            state: 'NY',
            zipcode: '10001',
            country: 'USA',
            contact: 'Sarah Wilson',
            phone: '555-789-0123',
            email: 'receiving@acme.com',
            businessHours: '9AM-6PM',
            refNumber: 'DC-ACME-001',
            mustDeliver: 'Yes',
            apptTime: '2025-07-08T14:00:00Z',
            apptNote: 'Inside delivery required',
            timezone: 'EST',
            warehouseId: 'DC-001',
          },
          carrier: {
            mcNumber: 'MC123456',
            dotNumber: 'DOT123456',
            name: 'Reliable Trucking Co',
            phone: '555-111-2222',
            dispatcher: 'Bob Dispatch',
            sealNumber: 'SEAL123456',
            scac: 'RELI',
            firstDriverName: 'Tom Driver',
            firstDriverPhone: '555-333-4444',
            secondDriverName: 'Jerry CoDriver',
            secondDriverPhone: '555-555-6666',
            email: 'dispatch@reliabletrucking.com',
            dispatchCity: 'Los Angeles',
            dispatchState: 'CA',
            externalTMSTruckId: 'TRUCK-001',
            externalTMSTrailerId: 'TRAILER-001',
            confirmationSentTime: '2025-07-06T10:00:00Z',
            confirmationReceivedTime: '2025-07-06T10:30:00Z',
            dispatchedTime: '2025-07-06T11:00:00Z',
            expectedPickupTime: '2025-07-07T09:00:00Z',
            pickupStart: '2025-07-07T09:00:00Z',
            pickupEnd: '2025-07-07T11:00:00Z',
            expectedDeliveryTime: '2025-07-08T14:00:00Z',
            deliveryStart: '2025-07-08T14:00:00Z',
            deliveryEnd: '2025-07-08T16:00:00Z',
            signedBy: 'Sarah Wilson',
            externalTMSId: 'CARRIER-001',
          },
          rateData: {
            customerRateType: 'Flat',
            customerNumHours: 2.0,
            customerLhRateUsd: 2500.0,
            fscPercent: 15.5,
            fscPerMile: 0.25,
            carrierRateType: 'Flat',
            carrierNumHours: 2.0,
            carrierLhRateUsd: 2000.0,
            carrierMaxRate: 2200.0,
            netProfitUsd: 500.0,
            profitPercent: 20.0,
          },
          specifications: {
            inPalletCount: 20,
            outPalletCount: 20,
            numCommodities: 5,
            totalWeight: 5000.0,
            billableWeight: 5000.0,
            poNums: 'PO-2025-001, PO-2025-002',
            operator: 'John Operator',
            routeMiles: 500.0,
            minTempFahrenheit: 32.0,
            maxTempFahrenheit: 75.0,
            liftgatePickup: true,
            liftgateDelivery: true,
            insidePickup: true,
            insideDelivery: true,
            tarps: false,
            oversized: false,
            hazmat: false,
            straps: true,
            permits: false,
            escorts: false,
            seal: true,
            customBonded: false,
            labor: false,
          },
        });
        onLoadCreated();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.error || 'Failed to create load');
      }
    } catch (err) {
      setError('Error creating load. Please try again. ' + err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.externalTMSLoadID.trim() !== '' &&
      formData.freightLoadID.trim() !== '' &&
      formData.customer.name.trim() !== '' &&
      formData.customer.addressLine1.trim() !== '' &&
      formData.customer.city.trim() !== '' &&
      formData.customer.state.trim() !== '' &&
      formData.customer.zipcode.trim() !== '' &&
      formData.billTo.name.trim() !== '' &&
      formData.billTo.addressLine1.trim() !== '' &&
      formData.billTo.city.trim() !== '' &&
      formData.billTo.state.trim() !== '' &&
      formData.billTo.zipcode.trim() !== '' &&
      formData.pickup.name.trim() !== '' &&
      formData.pickup.addressLine1.trim() !== '' &&
      formData.pickup.city.trim() !== '' &&
      formData.pickup.state.trim() !== '' &&
      formData.pickup.zipcode.trim() !== '' &&
      formData.consignee.name.trim() !== '' &&
      formData.consignee.addressLine1.trim() !== '' &&
      formData.consignee.city.trim() !== '' &&
      formData.consignee.state.trim() !== '' &&
      formData.consignee.zipcode.trim() !== '' &&
      formData.specifications.totalWeight > 0
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  External TMS Load ID *
                </label>
                <input
                  type="text"
                  value={formData.externalTMSLoadID}
                  onChange={(e) =>
                    handleInputChange('externalTMSLoadID', '', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., TURVO-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Freight Load ID *
                </label>
                <input
                  type="text"
                  value={formData.freightLoadID}
                  onChange={(e) =>
                    handleInputChange('freightLoadID', '', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., FL-2025-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleInputChange('status', '', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Created">Created</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customer.name}
                  onChange={(e) =>
                    handleInputChange('customer', 'name', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  External TMS ID
                </label>
                <input
                  type="text"
                  value={formData.customer.externalTMSId}
                  onChange={(e) =>
                    handleInputChange(
                      'customer',
                      'externalTMSId',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="CUST-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.customer.addressLine1}
                onChange={(e) =>
                  handleInputChange('customer', 'addressLine1', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.customer.addressLine2}
                onChange={(e) =>
                  handleInputChange('customer', 'addressLine2', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Suite 100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.customer.city}
                  onChange={(e) =>
                    handleInputChange('customer', 'city', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.customer.state}
                  onChange={(e) =>
                    handleInputChange('customer', 'state', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.customer.zipcode}
                  onChange={(e) =>
                    handleInputChange('customer', 'zipcode', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="90210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.customer.country}
                  onChange={(e) =>
                    handleInputChange('customer', 'country', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.customer.contact}
                  onChange={(e) =>
                    handleInputChange('customer', 'contact', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contact Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.customer.phone}
                  onChange={(e) =>
                    handleInputChange('customer', 'phone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.customer.email}
                  onChange={(e) =>
                    handleInputChange('customer', 'email', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="customer@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.customer.refNumber}
                  onChange={(e) =>
                    handleInputChange('customer', 'refNumber', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="REF-001"
                />
              </div>
            </div>
          </div>
        );

      case 'billto':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Bill To Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bill To Name *
                </label>
                <input
                  type="text"
                  value={formData.billTo.name}
                  onChange={(e) =>
                    handleInputChange('billTo', 'name', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Bill To Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  External TMS ID
                </label>
                <input
                  type="text"
                  value={formData.billTo.externalTMSId}
                  onChange={(e) =>
                    handleInputChange('billTo', 'externalTMSId', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="BILL-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.billTo.addressLine1}
                onChange={(e) =>
                  handleInputChange('billTo', 'addressLine1', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.billTo.addressLine2}
                onChange={(e) =>
                  handleInputChange('billTo', 'addressLine2', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Suite 100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.billTo.city}
                  onChange={(e) =>
                    handleInputChange('billTo', 'city', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.billTo.state}
                  onChange={(e) =>
                    handleInputChange('billTo', 'state', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.billTo.zipcode}
                  onChange={(e) =>
                    handleInputChange('billTo', 'zipcode', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="90210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.billTo.country}
                  onChange={(e) =>
                    handleInputChange('billTo', 'country', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.billTo.contact}
                  onChange={(e) =>
                    handleInputChange('billTo', 'contact', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contact Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.billTo.phone}
                  onChange={(e) =>
                    handleInputChange('billTo', 'phone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-123-4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.billTo.email}
                onChange={(e) =>
                  handleInputChange('billTo', 'email', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="billing@company.com"
              />
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Pickup Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.pickup.name}
                  onChange={(e) =>
                    handleInputChange('pickup', 'name', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Warehouse Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  External TMS ID
                </label>
                <input
                  type="text"
                  value={formData.pickup.externalTMSId}
                  onChange={(e) =>
                    handleInputChange('pickup', 'externalTMSId', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="PICKUP-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.pickup.addressLine1}
                onChange={(e) =>
                  handleInputChange('pickup', 'addressLine1', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="123 Industrial Blvd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.pickup.addressLine2}
                onChange={(e) =>
                  handleInputChange('pickup', 'addressLine2', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Building A"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.pickup.city}
                  onChange={(e) =>
                    handleInputChange('pickup', 'city', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.pickup.state}
                  onChange={(e) =>
                    handleInputChange('pickup', 'state', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.pickup.zipcode}
                  onChange={(e) =>
                    handleInputChange('pickup', 'zipcode', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="90210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.pickup.country}
                  onChange={(e) =>
                    handleInputChange('pickup', 'country', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.pickup.contact}
                  onChange={(e) =>
                    handleInputChange('pickup', 'contact', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Warehouse Contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.pickup.phone}
                  onChange={(e) =>
                    handleInputChange('pickup', 'phone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-123-4568"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.pickup.email}
                  onChange={(e) =>
                    handleInputChange('pickup', 'email', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="warehouse@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.pickup.businessHours}
                  onChange={(e) =>
                    handleInputChange('pickup', 'businessHours', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="8AM-5PM"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.pickup.refNumber}
                  onChange={(e) =>
                    handleInputChange('pickup', 'refNumber', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="WH-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Warehouse ID
                </label>
                <input
                  type="text"
                  value={formData.pickup.warehouseId}
                  onChange={(e) =>
                    handleInputChange('pickup', 'warehouseId', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="WH-001"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Appointment Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.pickup.apptTime}
                  onChange={(e) =>
                    handleInputChange('pickup', 'apptTime', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  value={formData.pickup.timezone}
                  onChange={(e) =>
                    handleInputChange('pickup', 'timezone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="PST">PST</option>
                  <option value="MST">MST</option>
                  <option value="CST">CST</option>
                  <option value="EST">EST</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Appointment Notes
              </label>
              <textarea
                value={formData.pickup.apptNote}
                onChange={(e) =>
                  handleInputChange('pickup', 'apptNote', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Call 30 minutes before arrival"
                rows={3}
              />
            </div>
          </div>
        );

      case 'delivery':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Delivery Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.consignee.name}
                  onChange={(e) =>
                    handleInputChange('consignee', 'name', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Delivery Location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  External TMS ID
                </label>
                <input
                  type="text"
                  value={formData.consignee.externalTMSId}
                  onChange={(e) =>
                    handleInputChange(
                      'consignee',
                      'externalTMSId',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="DELIVERY-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.consignee.addressLine1}
                onChange={(e) =>
                  handleInputChange('consignee', 'addressLine1', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="456 Delivery Ave"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.consignee.addressLine2}
                onChange={(e) =>
                  handleInputChange('consignee', 'addressLine2', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Building B"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.consignee.city}
                  onChange={(e) =>
                    handleInputChange('consignee', 'city', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.consignee.state}
                  onChange={(e) =>
                    handleInputChange('consignee', 'state', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.consignee.zipcode}
                  onChange={(e) =>
                    handleInputChange('consignee', 'zipcode', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.consignee.country}
                  onChange={(e) =>
                    handleInputChange('consignee', 'country', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.consignee.contact}
                  onChange={(e) =>
                    handleInputChange('consignee', 'contact', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Delivery Contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.consignee.phone}
                  onChange={(e) =>
                    handleInputChange('consignee', 'phone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-987-6543"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.consignee.email}
                  onChange={(e) =>
                    handleInputChange('consignee', 'email', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="receiving@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.consignee.businessHours}
                  onChange={(e) =>
                    handleInputChange(
                      'consignee',
                      'businessHours',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="9AM-6PM"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.consignee.refNumber}
                  onChange={(e) =>
                    handleInputChange('consignee', 'refNumber', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="DC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Must Deliver
                </label>
                <input
                  type="text"
                  value={formData.consignee.mustDeliver}
                  onChange={(e) =>
                    handleInputChange(
                      'consignee',
                      'mustDeliver',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Yes/No"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Appointment Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.consignee.apptTime}
                  onChange={(e) =>
                    handleInputChange('consignee', 'apptTime', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  value={formData.consignee.timezone}
                  onChange={(e) =>
                    handleInputChange('consignee', 'timezone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="PST">PST</option>
                  <option value="MST">MST</option>
                  <option value="CST">CST</option>
                  <option value="EST">EST</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Appointment Notes
              </label>
              <textarea
                value={formData.consignee.apptNote}
                onChange={(e) =>
                  handleInputChange('consignee', 'apptNote', e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Inside delivery required"
                rows={3}
              />
            </div>
          </div>
        );

      case 'carrier':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Carrier Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carrier Name
                </label>
                <input
                  type="text"
                  value={formData.carrier.name}
                  onChange={(e) =>
                    handleInputChange('carrier', 'name', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Carrier Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  MC Number
                </label>
                <input
                  type="text"
                  value={formData.carrier.mcNumber}
                  onChange={(e) =>
                    handleInputChange('carrier', 'mcNumber', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="MC123456"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DOT Number
                </label>
                <input
                  type="text"
                  value={formData.carrier.dotNumber}
                  onChange={(e) =>
                    handleInputChange('carrier', 'dotNumber', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="DOT123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SCAC
                </label>
                <input
                  type="text"
                  value={formData.carrier.scac}
                  onChange={(e) =>
                    handleInputChange('carrier', 'scac', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="SCAC"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.carrier.phone}
                  onChange={(e) =>
                    handleInputChange('carrier', 'phone', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.carrier.email}
                  onChange={(e) =>
                    handleInputChange('carrier', 'email', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="dispatch@carrier.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dispatcher
                </label>
                <input
                  type="text"
                  value={formData.carrier.dispatcher}
                  onChange={(e) =>
                    handleInputChange('carrier', 'dispatcher', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Dispatcher Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seal Number
                </label>
                <input
                  type="text"
                  value={formData.carrier.sealNumber}
                  onChange={(e) =>
                    handleInputChange('carrier', 'sealNumber', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="SEAL123"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Driver Name
                </label>
                <input
                  type="text"
                  value={formData.carrier.firstDriverName}
                  onChange={(e) =>
                    handleInputChange(
                      'carrier',
                      'firstDriverName',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Driver Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Driver Phone
                </label>
                <input
                  type="text"
                  value={formData.carrier.firstDriverPhone}
                  onChange={(e) =>
                    handleInputChange(
                      'carrier',
                      'firstDriverPhone',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-987-6543"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Second Driver Name
                </label>
                <input
                  type="text"
                  value={formData.carrier.secondDriverName}
                  onChange={(e) =>
                    handleInputChange(
                      'carrier',
                      'secondDriverName',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Second Driver Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Second Driver Phone
                </label>
                <input
                  type="text"
                  value={formData.carrier.secondDriverPhone}
                  onChange={(e) =>
                    handleInputChange(
                      'carrier',
                      'secondDriverPhone',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="555-987-6544"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dispatch City
                </label>
                <input
                  type="text"
                  value={formData.carrier.dispatchCity}
                  onChange={(e) =>
                    handleInputChange('carrier', 'dispatchCity', e.target.value)
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Dispatch City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dispatch State
                </label>
                <input
                  type="text"
                  value={formData.carrier.dispatchState}
                  onChange={(e) =>
                    handleInputChange(
                      'carrier',
                      'dispatchState',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="CA"
                />
              </div>
            </div>
          </div>
        );

      case 'rates':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Rate Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Rate Type
                </label>
                <select
                  value={formData.rateData.customerRateType}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'customerRateType',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Flat">Flat</option>
                  <option value="Per Mile">Per Mile</option>
                  <option value="Per Hour">Per Hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Rate (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateData.customerLhRateUsd}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'customerLhRateUsd',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer Hours
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rateData.customerNumHours}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'customerNumHours',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  FSC Percent
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateData.fscPercent}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'fscPercent',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  FSC Per Mile
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateData.fscPerMile}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'fscPerMile',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carrier Rate Type
                </label>
                <select
                  value={formData.rateData.carrierRateType}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'carrierRateType',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Flat">Flat</option>
                  <option value="Per Mile">Per Mile</option>
                  <option value="Per Hour">Per Hour</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carrier Rate (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateData.carrierLhRateUsd}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'carrierLhRateUsd',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carrier Hours
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rateData.carrierNumHours}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'carrierNumHours',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Carrier Max Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateData.carrierMaxRate}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'carrierMaxRate',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Net Profit (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rateData.netProfitUsd}
                  onChange={(e) =>
                    handleInputChange(
                      'rateData',
                      'netProfitUsd',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profit Percent
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.rateData.profitPercent}
                onChange={(e) =>
                  handleInputChange(
                    'rateData',
                    'profitPercent',
                    parseFloat(e.target.value) || 0
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        );

      case 'specs':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              Load Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specifications.totalWeight}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'totalWeight',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="5000.0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Billable Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specifications.billableWeight}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'billableWeight',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="5000.0"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pallets In
                </label>
                <input
                  type="number"
                  value={formData.specifications.inPalletCount}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'inPalletCount',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="20"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pallets Out
                </label>
                <input
                  type="number"
                  value={formData.specifications.outPalletCount}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'outPalletCount',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="20"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Commodities
                </label>
                <input
                  type="number"
                  value={formData.specifications.numCommodities}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'numCommodities',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Route Miles
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specifications.routeMiles}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'routeMiles',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="500.0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PO Numbers
                </label>
                <input
                  type="text"
                  value={formData.specifications.poNums}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'poNums',
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="PO-2025-001"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specifications.minTempFahrenheit}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'minTempFahrenheit',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="32.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specifications.maxTempFahrenheit}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'maxTempFahrenheit',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="75.0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Operator
              </label>
              <input
                type="text"
                value={formData.specifications.operator}
                onChange={(e) =>
                  handleInputChange(
                    'specifications',
                    'operator',
                    e.target.value
                  )
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Operator Name"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.liftgatePickup}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'liftgatePickup',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Liftgate Pickup
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.liftgateDelivery}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'liftgateDelivery',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Liftgate Delivery
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.insidePickup}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'insidePickup',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Inside Pickup
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.insideDelivery}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'insideDelivery',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Inside Delivery
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.tarps}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'tarps',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Tarps
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.oversized}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'oversized',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Oversized
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.hazmat}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'hazmat',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Hazmat
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.straps}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'straps',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Straps
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.permits}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'permits',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Permits
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.escorts}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'escorts',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Escorts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.seal}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'seal',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Seal</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.customBonded}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'customBonded',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Custom Bonded
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specifications.labor}
                  onChange={(e) =>
                    handleInputChange(
                      'specifications',
                      'labor',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Labor
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Create New Load
        </h3>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Load created successfully in Turvo!
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Navigation */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              'basic',
              'customer',
              'billto',
              'pickup',
              'delivery',
              'carrier',
              'rates',
              'specs',
            ].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeSection === section
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="min-h-[300px]">{renderSection()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                const sections = [
                  'basic',
                  'customer',
                  'billto',
                  'pickup',
                  'delivery',
                  'carrier',
                  'rates',
                  'specs',
                ];
                const currentIndex = sections.indexOf(activeSection);
                if (currentIndex > 0) {
                  setActiveSection(sections[currentIndex - 1]);
                }
              }}
              disabled={activeSection === 'basic'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {activeSection !== 'specs' ? (
              <button
                type="button"
                onClick={() => {
                  const sections = [
                    'basic',
                    'customer',
                    'billto',
                    'pickup',
                    'delivery',
                    'carrier',
                    'rates',
                    'specs',
                  ];
                  const currentIndex = sections.indexOf(activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1]);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Load in Turvo'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLoadForm;
