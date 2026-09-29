class LocationService {
  /**
   * Calculates Haversine distance between two coordinates in kilometers.
   */
  static calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
      return 0;
    }

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // 2 decimal places
  }

  /**
   * Calculates ETA in minutes based on distance and vehicle type.
   */
  static calculateEtaMinutes(distanceKm, vehicleType = 'MOTORCYCLE') {
    if (distanceKm <= 0.05) return 1;

    // Average urban speeds (km/h) including traffic
    const speeds = {
      BICYCLE: 15,
      MOTORCYCLE: 28,
      CAR: 25,
      VAN: 22,
      TRUCK: 20
    };

    const speed = speeds[vehicleType.toUpperCase()] || 25;
    const travelTimeHours = distanceKm / speed;
    const travelTimeMinutes = travelTimeHours * 60;

    // Add buffer for stops/traffic lights (approx 3 minutes buffer per 3 km)
    const trafficBuffer = Math.min(10, Math.ceil(distanceKm * 0.8));
    const totalMinutes = Math.max(1, Math.round(travelTimeMinutes + trafficBuffer));

    return totalMinutes;
  }

  /**
   * Calculates compass heading in degrees from coord1 to coord2.
   */
  static calculateHeading(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const toDeg = (value) => (value * 180) / Math.PI;

    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

    const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
    return Math.round(bearing * 10) / 10;
  }
}

module.exports = LocationService;
