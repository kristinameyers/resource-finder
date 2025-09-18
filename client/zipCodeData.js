// Santa Barbara County and surrounding area ZIP code coordinates
// Generated from USPS ZIP code database

// ZIP Code to Latitude/Longitude mapping for distance calculations
window.ZIP_CODE_DATA = {
  // Santa Barbara County Core
  "93013": { lat: 34.42697, lng: -119.48032 }, // Carpinteria
  "93067": { lat: 34.42162, lng: -119.59277 }, // Summerland
  "93101": { lat: 34.41925, lng: -119.70808 }, // Santa Barbara Downtown
  "93103": { lat: 34.43888, lng: -119.68173 }, // Santa Barbara East
  "93105": { lat: 34.52702, lng: -119.76082 }, // Santa Barbara North
  "93106": { lat: 34.41719, lng: -119.85111 }, // Santa Barbara West Beach
  "93108": { lat: 34.44934, lng: -119.60397 }, // Montecito
  "93109": { lat: 34.40662, lng: -119.72682 }, // Santa Barbara Mesa
  "93110": { lat: 34.43913, lng: -119.7666 },  // Santa Barbara Mission
  "93111": { lat: 34.44932, lng: -119.80223 }, // Santa Barbara Westside
  "93117": { lat: 34.49102, lng: -120.08201 }, // Goleta
  
  // North County Santa Barbara
  "93252": { lat: 34.80685, lng: -119.34664 }, // Maricopa
  "93254": { lat: 34.92498, lng: -119.74834 }, // New Cuyama
  "93427": { lat: 34.62724, lng: -120.22465 }, // Buellton
  "93429": { lat: 34.86682, lng: -120.53582 }, // Casmalia
  "93434": { lat: 34.94086, lng: -120.6113 },  // Guadalupe
  "93436": { lat: 34.60888, lng: -120.4002 },  // Lompoc
  "93437": { lat: 34.76049, lng: -120.51102 }, // Lompoc (Vandenberg)
  "93440": { lat: 34.74606, lng: -120.25292 }, // Los Alamos
  "93441": { lat: 34.73296, lng: -120.09721 }, // Los Olivos
  "93454": { lat: 34.94834, lng: -120.23425 }, // Santa Maria
  "93455": { lat: 34.84195, lng: -120.45522 }, // Santa Maria West
  "93458": { lat: 34.95477, lng: -120.49042 }, // Santa Maria North
  "93460": { lat: 34.66214, lng: -119.90091 }, // Santa Ynez
  "93463": { lat: 34.60688, lng: -120.13495 }, // Solvang
  
  // Ventura County (nearby)
  "93001": { lat: 34.35321, lng: -119.31868 }, // Ventura
  "93003": { lat: 34.28434, lng: -119.22256 }, // Ventura East
  "93004": { lat: 34.27901, lng: -119.16537 }, // Ventura Mid-town
  "93010": { lat: 34.23007, lng: -119.07437 }, // Camarillo
  "93012": { lat: 34.20518, lng: -118.99309 }, // Camarillo Heights
  "93015": { lat: 34.40969, lng: -118.87807 }, // Fillmore
  "93021": { lat: 34.30417, lng: -118.88274 }, // Moorpark
  "93022": { lat: 34.40324, lng: -119.29836 }, // Oak View
  "93023": { lat: 34.50372, lng: -119.24856 }, // Ojai
  "93030": { lat: 34.2051, lng: -119.1753 },   // Oxnard
  "93033": { lat: 34.15401, lng: -119.12296 }, // Oxnard South
  "93035": { lat: 34.19034, lng: -119.22879 }, // Oxnard West
  "93036": { lat: 34.24911, lng: -119.15977 }, // Oxnard North
  "93040": { lat: 34.59337, lng: -118.93657 }, // Piru
  "93041": { lat: 34.14956, lng: -119.17458 }, // Port Hueneme
  "93060": { lat: 34.36543, lng: -119.09563 }, // Santa Paula
  "93063": { lat: 34.30922, lng: -118.69041 }, // Simi Valley
  "93065": { lat: 34.28019, lng: -118.71548 }, // Simi Valley
  "93066": { lat: 34.38641, lng: -119.48161 }, // Somis
  
  // San Luis Obispo County (nearby)
  "93401": { lat: 35.29439, lng: -120.66988 }, // San Luis Obispo
  "93402": { lat: 35.39077, lng: -120.85432 }, // Los Osos
  "93405": { lat: 35.26643, lng: -120.65128 }, // San Luis Obispo
  "93406": { lat: 35.15175, lng: -120.7125 },  // Oceano
  "93407": { lat: 35.26026, lng: -120.62853 }, // San Luis Obispo
  "93408": { lat: 35.22953, lng: -120.60487 }, // San Luis Obispo
  "93409": { lat: 35.16444, lng: -120.40978 }, // Pismo Beach
  "93410": { lat: 35.25255, lng: -120.68868 }, // San Luis Obispo
  "93412": { lat: 35.57447, lng: -120.85012 }, // Los Osos
  "93420": { lat: 35.16905, lng: -120.72015 }, // Arroyo Grande
  "93421": { lat: 35.12377, lng: -120.59074 }, // Arroyo Grande
  "93422": { lat: 35.5219, lng: -120.69413 },  // Atascadero
  "93423": { lat: 35.85641, lng: -120.39853 }, // Atascadero
  "93424": { lat: 34.87827, lng: -120.38988 }, // Avila Beach
  "93425": { lat: 35.08415, lng: -119.47862 }  // Bradley
};

// Normalize ZIP codes (handle ZIP+4 format)
window.normalizeZipCode = function(zip) {
  if (!zip) return null;
  // Remove any non-numeric characters and take first 5 digits
  const cleaned = String(zip).replace(/\D/g, '');
  return cleaned.substring(0, 5);
};

// Convert degrees to radians
window.toRadians = function(degrees) {
  return degrees * (Math.PI / 180);
}

// Haversine formula to calculate distance between two coordinates
window.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radius of the Earth in miles
  const dLat = window.toRadians(lat2 - lat1);
  const dLon = window.toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(window.toRadians(lat1)) * Math.cos(window.toRadians(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Calculate distance between two ZIP codes
window.calculateZipCodeDistance = function(zip1, zip2) {
  const normalizedZip1 = window.normalizeZipCode(zip1);
  const normalizedZip2 = window.normalizeZipCode(zip2);
  
  const coords1 = window.ZIP_CODE_DATA[normalizedZip1];
  const coords2 = window.ZIP_CODE_DATA[normalizedZip2];
  
  if (!coords1 || !coords2) {
    console.log('Missing coordinates for:', {
      zip1: normalizedZip1,
      coords1: coords1,
      zip2: normalizedZip2, 
      coords2: coords2
    });
    return null;
  }
  
  return window.calculateDistance(
    coords1.lat, coords1.lng,
    coords2.lat, coords2.lng
  );
};

// Get coordinates for a zip code
window.getZipCodeCoordinates = function(zipCode) {
  return window.ZIP_CODE_DATA[zipCode] || null;
}

// Find the closest zip code to given coordinates
window.findClosestZipCode = function(lat, lng) {
  let closestZip = null;
  let minDistance = Infinity;
  
  for (const [zipCode, coords] of Object.entries(window.ZIP_CODE_DATA)) {
    const distance = window.calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestZip = zipCode;
    }
  }
  
  return closestZip;
}

console.log('ZIP code data loaded with', Object.keys(window.ZIP_CODE_DATA).length, 'zip codes');