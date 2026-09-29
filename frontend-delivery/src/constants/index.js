export const DELIVERY_STATUSES = {
  ORDER_PLACED: { label: 'Order Placed', color: 'info', step: 1 },
  ORDER_CONFIRMED: { label: 'Confirmed', color: 'info', step: 2 },
  DRIVER_ASSIGNED: { label: 'Driver Assigned', color: 'purple', step: 3 },
  PICKUP_PENDING: { label: 'Pickup Pending', color: 'warning', step: 4 },
  PICKED_UP: { label: 'Picked Up', color: 'warning', step: 5 },
  IN_TRANSIT: { label: 'In Transit', color: 'info', step: 6 },
  NEAR_DESTINATION: { label: 'Near Destination', color: 'purple', step: 7 },
  OUT_FOR_DELIVERY: { label: 'Out For Delivery', color: 'info', step: 8 },
  DELIVERED: { label: 'Delivered', color: 'success', step: 9 },
  CANCELLED: { label: 'Cancelled', color: 'danger', step: -1 },
  FAILED: { label: 'Failed', color: 'danger', step: -1 }
};

export const VEHICLE_TYPES = [
  { value: 'MOTORCYCLE', label: 'Motorcycle / Scooter' },
  { value: 'BICYCLE', label: 'Bicycle / E-Bike' },
  { value: 'CAR', label: 'Sedan / Hatchback' },
  { value: 'VAN', label: 'Cargo Van' },
  { value: 'TRUCK', label: 'Delivery Truck' }
];

export const PRIORITY_LEVELS = [
  { value: 'STANDARD', label: 'Standard Delivery', eta: '2 - 3 Hours', color: 'info' },
  { value: 'EXPRESS', label: 'Express Delivery', eta: '45 - 60 Mins', color: 'warning' },
  { value: 'URGENT', label: 'Urgent Priority', eta: '20 - 30 Mins', color: 'purple' }
];

// Realistic San Francisco demonstration coordinates for route playback
export const DEMO_ROUTE_COORDINATES = [
  { lat: 37.7801, lng: -122.3995, desc: 'Central Depot (500 4th St)' },
  { lat: 37.7815, lng: -122.4005, desc: '4th & Howard St' },
  { lat: 37.7830, lng: -122.4018, desc: 'Mission & 4th St' },
  { lat: 37.7845, lng: -122.4028, desc: 'Approaching Market St' },
  { lat: 37.7865, lng: -122.4039, desc: 'Market & 3rd St' },
  { lat: 37.7875, lng: -122.4042, desc: 'Montgomery & Market' },
  { lat: 37.7880, lng: -122.4045, desc: 'Customer Destination (742 Market St)' }
];
