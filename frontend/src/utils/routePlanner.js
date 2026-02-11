import * as turf from "@turf/turf";

// Mock location database - in real app, this would come from a backend API
const locationDatabase = {
  "rajiv chowk": [28.4595, 77.0266],
  "sector 14": [28.4575, 77.0450],
  "bus stand": [28.4620, 77.0300],
  "sector 7": [28.4700, 77.0100],
  "sector 21": [28.4450, 77.0500],
  "golf course": [28.4550, 76.9950],
  "cyber city": [28.4400, 77.1050],
  "mg road": [28.4650, 77.0350],
  "sector 31": [28.4300, 77.0800],
  "iffco chowk": [28.5075, 77.0892],
  "udyog vihar": [28.4800, 77.0600],
  "dlf plaza": [28.5000, 77.0800],
};

export function findLocationCoordinates(locationName) {
  const normalized = locationName.toLowerCase().trim();
  
  // Direct match
  if (locationDatabase[normalized]) {
    return locationDatabase[normalized];
  }

  // Partial match
  for (const [key, coords] of Object.entries(locationDatabase)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return coords;
    }
  }

  return null;
}

export function generateRoute(sourceCoords, destCoords, gridCells) {
  // Create a line between source and destination
  const routeLine = turf.lineString([sourceCoords, destCoords]);
  
  // Find all grid cells that intersect with the route
  const cellsOnRoute = gridCells.features.filter((cell) => {
    try {
      // Check if the route intersects with this cell
      return turf.booleanIntersects(cell, routeLine);
    } catch (e) {
      return false;
    }
  });

  return {
    line: routeLine,
    cellsOnRoute: cellsOnRoute,
    totalDistance: turf.length(routeLine, { units: "kilometers" }),
    safetyData: calculateRouteSafety(cellsOnRoute),
  };
}

function calculateRouteSafety(cellsOnRoute) {
  if (cellsOnRoute.length === 0) {
    return {
      averageScore: 0,
      safeCellsCount: 0,
      moderateCellsCount: 0,
      unsafeCellsCount: 0,
      safetyLevel: "Unknown",
    };
  }

  let safeCellsCount = 0;
  let moderateCellsCount = 0;
  let unsafeCellsCount = 0;
  let totalScore = 0;

  cellsOnRoute.forEach((cell) => {
    const score = cell.properties.safetyScore || 50;
    totalScore += score;

    if (score >= 70) safeCellsCount++;
    else if (score >= 40) moderateCellsCount++;
    else unsafeCellsCount++;
  });

  const averageScore = Math.round(totalScore / cellsOnRoute.length);
  
  let safetyLevel = "Low Risk";
  if (averageScore >= 70) safetyLevel = "High Safety";
  else if (averageScore >= 50) safetyLevel = "Moderate Safety";
  else if (averageScore >= 30) safetyLevel = "Low Safety";
  else safetyLevel = "High Risk";

  return {
    averageScore,
    safeCellsCount,
    moderateCellsCount,
    unsafeCellsCount,
    safetyLevel,
  };
}

export function getLocationSuggestions(input) {
  const normalized = input.toLowerCase().trim();
  
  return Object.keys(locationDatabase).filter((location) =>
    location.includes(normalized)
  );
}
