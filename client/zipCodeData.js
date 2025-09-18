// Zip code data for Santa Barbara County and surrounding areas
// Format: { zipCode: { lat: latitude, lng: longitude } }
window.ZIP_CODE_DATA = {
  // Santa Barbara city
  "93101": { lat: 34.4208, lng: -119.6982 },
  "93102": { lat: 34.4285, lng: -119.7145 },
  "93103": { lat: 34.4377, lng: -119.7444 },
  "93105": { lat: 34.4465, lng: -119.7178 },
  "93106": { lat: 34.4334, lng: -119.8511 },
  "93107": { lat: 34.4200, lng: -119.8780 },
  "93108": { lat: 34.4361, lng: -119.6320 },  // Montecito
  "93109": { lat: 34.4062, lng: -119.7838 },
  "93110": { lat: 34.4427, lng: -119.7638 },
  "93111": { lat: 34.4573, lng: -119.7857 },
  "93116": { lat: 34.4368, lng: -119.8761 },  // Goleta
  "93117": { lat: 34.4133, lng: -119.8610 },  // Isla Vista
  "93118": { lat: 34.4400, lng: -119.8600 },
  "93120": { lat: 34.4250, lng: -119.7150 },
  "93121": { lat: 34.4350, lng: -119.7250 },
  "93130": { lat: 34.4150, lng: -119.7050 },
  "93140": { lat: 34.4200, lng: -119.7000 },
  "93150": { lat: 34.4300, lng: -119.7100 },
  "93160": { lat: 34.4250, lng: -119.7200 },
  "93190": { lat: 34.4350, lng: -119.7300 },
  // Carpinteria
  "93013": { lat: 34.3989, lng: -119.5184 },
  // Summerland
  "93067": { lat: 34.4214, lng: -119.5965 },
  // Lompoc
  "93436": { lat: 34.6391, lng: -120.4579 },
  "93437": { lat: 34.6697, lng: -120.4523 },
  // Santa Maria
  "93454": { lat: 34.9530, lng: -120.4357 },
  "93455": { lat: 34.9800, lng: -120.4500 },
  "93458": { lat: 35.0122, lng: -120.4417 },
  // Solvang
  "93463": { lat: 34.5958, lng: -120.1376 },
  "93464": { lat: 34.5844, lng: -120.1924 },
  // Buellton
  "93427": { lat: 34.6136, lng: -120.1929 },
  // Santa Ynez
  "93460": { lat: 34.6144, lng: -120.0799 },
  // Los Alamos
  "93440": { lat: 34.7428, lng: -120.2779 },
  // Guadalupe
  "93434": { lat: 34.9717, lng: -120.5718 },
  // Orcutt (part of Santa Maria)
  "93455": { lat: 34.8655, lng: -120.4360 },
  // Ventura County (nearby)
  "93001": { lat: 34.2805, lng: -119.2945 },  // Ventura
  "93003": { lat: 34.2743, lng: -119.2317 },  // Ventura
  "93004": { lat: 34.2200, lng: -119.1800 },  // Ventura
  "93023": { lat: 34.1975, lng: -119.1771 },  // Ojai
  // San Luis Obispo County (nearby)
  "93401": { lat: 35.2828, lng: -120.6596 },  // San Luis Obispo
  "93405": { lat: 35.2655, lng: -120.6674 },  // San Luis Obispo
  "93420": { lat: 35.3728, lng: -120.8490 },  // Arroyo Grande
  "93422": { lat: 35.1201, lng: -120.5213 }   // Atascadero
};

// Haversine formula to calculate distance between two points
window.calculateDistance = function(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = window.toRadians(lat2 - lat1);
  const dLng = window.toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(window.toRadians(lat1)) * Math.cos(window.toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

window.toRadians = function(degrees) {
  return degrees * (Math.PI / 180);
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

// Get coordinates for a zip code
window.getZipCodeCoordinates = function(zipCode) {
  return window.ZIP_CODE_DATA[zipCode] || null;
}

// Normalize ZIP code to 5 digits
window.normalizeZipCode = function(zip) {
  if (!zip) return null;
  // Remove all non-digits and take first 5 digits
  const cleaned = String(zip).replace(/\D/g, '').slice(0, 5);
  return cleaned.length === 5 ? cleaned : null;
}

// Calculate distance between two zip codes
window.calculateZipCodeDistance = function(zip1, zip2) {
  // Normalize both zip codes to 5 digits
  const normalizedZip1 = window.normalizeZipCode(zip1);
  const normalizedZip2 = window.normalizeZipCode(zip2);
  
  if (!normalizedZip1 || !normalizedZip2) {
    return null;
  }
  
  const coords1 = window.getZipCodeCoordinates(normalizedZip1);
  const coords2 = window.getZipCodeCoordinates(normalizedZip2);
  
  if (!coords1 || !coords2) {
    return null;
  }
  
  return window.calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
}