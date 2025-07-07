import React, { useEffect, useState } from 'react';
import { Load } from '../types';
import { loadService } from '../services/api';

interface LoadDetailsProps {
  load: Load;
  onClose: () => void;
}

interface TurvoShipmentDetails {
  id: number;
  customId: string;
  ltlShipment: boolean;
  phase: {
    value: string;
    key: string;
  };
  services?: Array<{
    value: string;
    key: string;
  }>;
  servicesNote?: string;
  servicesPartial?: boolean;
  startDate: {
    date: string;
    timeZone: string;
  };
  endDate: {
    date: string;
    flex: number;
    timeZone: string;
  };
  transportation: {
    mode: {
      key: string;
      value: string;
    };
    serviceType: {
      key: string;
      value: string;
    };
  };
  status: {
    code: {
      key: string;
      value: string;
    };
    notes: string;
    description: string;
    category?: string;
  };
  tracking: {
    isTrackable: boolean;
    deleted: boolean;
    isTracking: boolean;
    description: string;
    source: string;
    frequency: number;
    routeSteps: {
      visitedGeoWayPoints: string;
      countGeoWayPoints: number;
      stepsPolyline: string;
    };
  };
  margin: {
    totalReceivableAmount: number;
    totalPayableAmount: number;
    amount: number;
    value: number;
  };
  contributors: Array<{
    deleted: boolean;
    id: number;
    contributorUser: {
      id: number;
      name: string;
    };
    title: {
      key: string;
      value: string;
    };
  }>;
  lane: {
    start: string;
    end: string;
  };
  globalRoute: Array<{
    name: string;
    id: number;
    globalShipLocationSourceId: string;
    schedulingType: {
      key: string;
      value: string;
    };
    stopType: {
      value: string;
      key: string;
    };
    timezone: string;
    location: {
      id: number;
    };
    address: {
      city: string;
      state: string;
      countryName: string;
      countryCode: string;
      line1: string;
      line2: string;
      lon: number;
      lat: number;
    };
    segmentId: string;
    segmentSequence: number;
    sequence: number;
    state: string;
    appointment: {
      date: string;
      timeZone: string;
      flex: number;
      hasTime: boolean;
    };
    customerOrder: Array<{
      customerId: number;
      id: number;
      deleted: boolean;
    }>;
    deleted: boolean;
    fragmentDistance: {
      value: number;
      units: {
        key: string;
        value: string;
      };
    };
    stop_level_fragment_distance: number;
    layoverTime: {
      value: number;
      units: {
        key: string;
        value: string;
      };
    };
  }>;
  customerOrder: Array<{
    id: number;
    deleted: boolean;
    customer: {
      id: number;
      name: string;
      owner: {
        name: string;
        id: number;
      };
    };
    totalMiles: number;
    items: Array<{
      deleted: boolean;
      name: string;
      qty: number;
      unit: {
        key: string;
        value: string;
      };
      value: number;
      currency: {
        key: string;
        value: string;
      };
      totalValue: number;
      id: number;
      stackable: boolean;
    }>;
    costs: {
      subTotal: number;
      totalAmount: number;
      deleted: boolean;
      lineItem: Array<{
        deleted: boolean;
        code: {
          key: string;
          value: string;
        };
        qty: number;
        price: number;
        amount: number;
        billable: boolean;
        id: number;
      }>;
    };
  }>;
  carrierOrder: Array<{
    id: number;
    deleted: boolean;
    carrier: {
      name: string;
      id: number;
      owner: {
        name: string;
        id: number;
      };
    };
    drivers: Array<{
      contextType: string;
      context: {
        id: number;
        name: string;
      };
      phone: {
        number: string;
        type: {
          key: string;
          value: string;
        };
        country: {
          key: string;
          value: string;
        };
        id: string;
        deleted: boolean;
      };
      email: {
        email: string;
        type: {
          key: string;
          value: string;
        };
        id: string;
        deleted: boolean;
      };
      driverAssignmentStatus: {
        value: string;
        key: string;
      };
      driverAssignmentId: number;
      deleted: boolean;
    }>;
  }>;
  groups: Array<{
    id: number;
    name: string;
  }>;
  statusHistory: Array<{
    lastUpdatedBy: {
      id: number;
    };
    code: {
      key: string;
      value: string;
    };
    lastUpdatedOn: string;
  }>;
}

const LoadDetails: React.FC<LoadDetailsProps> = ({ load, onClose }) => {
  const [shipmentDetails, setShipmentDetails] =
    useState<TurvoShipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShipmentDetails();
  }, [load]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the shipment ID from the load - use the internal Turvo ID
      const shipmentId = load.freightLoadID;
      if (!shipmentId) {
        setError('No shipment ID available');
        return;
      }

      const response = await loadService.getShipmentDetails(shipmentId);
      if (response.success && response.data) {
        // The API returns {Status: "SUCCESS", details: {...}}
        // We need to access the details object
        const details = response.data.details || response.data;
        setShipmentDetails(details);
      } else {
        setError('Failed to fetch shipment details');
      }
    } catch (err) {
      setError('Error loading shipment details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in transit':
      case 'at pickup':
      case 'at delivery':
        return 'bg-blue-100 text-blue-800';
      case 'covered':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Load Details - {load.freightLoadID || load.externalTMSLoadID}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {shipmentDetails && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipment ID
                  </label>
                  <p className="text-sm text-gray-900">
                    {shipmentDetails.customId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      shipmentDetails.status.code.value
                    )}`}
                  >
                    {shipmentDetails.status.code.value}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phase
                  </label>
                  <p className="text-sm text-gray-900">
                    {shipmentDetails.phase.value}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(shipmentDetails.startDate.date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(shipmentDetails.endDate.date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transportation Mode
                  </label>
                  <p className="text-sm text-gray-900">
                    {shipmentDetails.transportation.mode.value}
                  </p>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Route Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Origin
                  </label>
                  <p className="text-sm text-gray-900">
                    {shipmentDetails.lane.start}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destination
                  </label>
                  <p className="text-sm text-gray-900">
                    {shipmentDetails.lane.end}
                  </p>
                </div>
              </div>

              {/* Global Route Details */}
              <div className="mt-4">
                <h5 className="text-md font-medium text-gray-900 mb-2">
                  Stops
                </h5>
                <div className="space-y-3">
                  {shipmentDetails.globalRoute.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {stop.stopType.value}: {stop.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {stop.address.line1}, {stop.address.city},{' '}
                            {stop.address.state}
                          </p>
                          <p className="text-sm text-gray-500">
                            Appointment: {formatDate(stop.appointment.date)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            stop.state === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {stop.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {shipmentDetails.customerOrder.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Customer Information
                </h4>
                {shipmentDetails.customerOrder.map((order, index) => (
                  <div key={order.id} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Customer Name
                        </label>
                        <p className="text-sm text-gray-900">
                          {order.customer.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Total Miles
                        </label>
                        <p className="text-sm text-gray-900">
                          {order.totalMiles.toLocaleString()} miles
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    {order.items.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-md font-medium text-gray-900 mb-2">
                          Items
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Qty
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Unit
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {order.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    {item.qty}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    {item.unit.value}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    ${item.value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Carrier Information */}
            {shipmentDetails.carrierOrder.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Carrier Information
                </h4>
                {shipmentDetails.carrierOrder.map((order, index) => (
                  <div key={order.id} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Carrier Name
                        </label>
                        <p className="text-sm text-gray-900">
                          {order.carrier.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.deleted
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {order.deleted ? 'Deleted' : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Drivers */}
                    {order.drivers && order.drivers.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-md font-medium text-gray-900 mb-2">
                          Drivers
                        </h5>
                        <div className="space-y-2">
                          {order.drivers.map((driver) => (
                            <div
                              key={driver.driverAssignmentId}
                              className="border-l-4 border-green-500 pl-4"
                            >
                              <p className="font-medium text-sm text-gray-900">
                                {driver.context.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Phone: {driver.phone.number} | Email:{' '}
                                {driver.email.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status: {driver.driverAssignmentStatus.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Financial Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Financial Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Receivable
                  </label>
                  <p className="text-sm text-gray-900">
                    $
                    {shipmentDetails.margin.totalReceivableAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Payable
                  </label>
                  <p className="text-sm text-gray-900">
                    $
                    {shipmentDetails.margin.totalPayableAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Margin
                  </label>
                  <p className="text-sm text-gray-900">
                    ${shipmentDetails.margin.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {shipmentDetails.tracking && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Tracking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tracking Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        shipmentDetails.tracking.isTracking
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {shipmentDetails.tracking.isTracking
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="text-sm text-gray-900">
                      {shipmentDetails.tracking.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadDetails;
