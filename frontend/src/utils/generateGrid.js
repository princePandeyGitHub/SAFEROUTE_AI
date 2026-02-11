import * as turf from "@turf/turf";
import boundary from "../data/gurugram_district.json";

export function generateGrid() {
  // Extract the polygon feature from the boundary FeatureCollection
  const boundaryPolygon = boundary.features[0];
  
  // Get bounding box of district
  const bbox = turf.bbox(boundaryPolygon);

  // Create square grid (0.5 km = 500 meters)
  const grid = turf.squareGrid(bbox, 0.5, { units: "kilometers" });

  // Filter grid cells that are within the district boundary
  const clippedGrid = turf.featureCollection(
    grid.features.filter(cell => {
      try {
        return turf.booleanPointInPolygon(turf.centroid(cell), boundaryPolygon);
      } catch (e) {
        return false;
      }
    })
  );

  return clippedGrid;
}

export function assignSafetyScores(grid) {
  // Add random safety scores to each grid cell for demonstration
  // In a real app, these would come from an API or database
  
  if (!grid || !grid.features) {
    return { type: "FeatureCollection", features: [] };
  }

  const gridWithScores = {
    ...grid,
    features: grid.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        // Random score between 20-100 for demo
        // Replace this with real data from your backend
        safetyScore: Math.floor(Math.random() * 80) + 20,
      },
    })),
  };

  return gridWithScores;
}

