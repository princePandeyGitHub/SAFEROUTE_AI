import { MapContainer, TileLayer, GeoJSON, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import * as turf from "@turf/turf";
import { generateGrid, assignSafetyScores } from "../utils/generateGrid.js";
import { generateRoute, findLocationCoordinates } from "../utils/routePlanner.js";
import JourneyPlanner from "./JourneyPlanner.jsx";
import boundary from "../data/gurugram_district.json";

function Map() {
  const grid = generateGrid();
  const coloredGrid = assignSafetyScores(grid);
  const [route, setRoute] = useState(null);
  const [journeyInfo, setJourneyInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.4595, 77.0266]);
  const [mapZoom, setMapZoom] = useState(14);

  const handlePlanJourney = (journeyData) => {
    const sourceCoords = findLocationCoordinates(journeyData.source);
    const destCoords = findLocationCoordinates(journeyData.destination);

    if (!sourceCoords || !destCoords) {
      alert("One or both locations not found. Please check the location names.");
      return;
    }

    const routeData = generateRoute(sourceCoords, destCoords, coloredGrid);
    
    // Calculate map bounds to fit the route
    const allCoords = [sourceCoords, destCoords];
    const bounds = turf.bbox(turf.points(allCoords));
    
    setRoute(routeData);
    setJourneyInfo({
      source: journeyData.source,
      destination: journeyData.destination,
      sourceCoords,
      destCoords,
    });
    
    // Zoom to fit route
    const center = [
      (sourceCoords[0] + destCoords[0]) / 2,
      (sourceCoords[1] + destCoords[1]) / 2,
    ];
    setMapCenter(center);
    setMapZoom(16);
  };

  const clearRoute = () => {
    setRoute(null);
    setJourneyInfo(null);
    setMapCenter([28.4595, 77.0266]);
    setMapZoom(18);
  };

  // Function to get color based on safety score (0-100)
  const getColor = (score) => {
    if (score >= 80) return "#2ecc71"; // Green - Very Safe
    if (score >= 60) return "#f1c40f"; // Yellow - Moderately Safe
    if (score >= 40) return "#e67e22"; // Orange - Less Safe
    if (score >= 20) return "#e74c3c"; // Red - Unsafe
    return "#c0392b"; // Dark Red - Very Unsafe
  };

  // Style function for grid cells - reduced opacity for better label visibility
  const gridStyle = (feature) => {
    const score = feature.properties.safetyScore || 50;
    return {
      color: getColor(score),
      weight: 1.5,
      opacity: 0.7,
      fillOpacity: 0.35,
    };
  };

  // Popup content for grid cells
  const onEachGridFeature = (feature, layer) => {
    const score = feature.properties.safetyScore || 0;
    const safetyLevel = 
      score >= 80 ? "Very Safe" :
      score >= 60 ? "Moderately Safe" :
      score >= 40 ? "Less Safe" :
      score >= 20 ? "Unsafe" :
      "Very Unsafe";

    const popupContent = `
      <div style="background-color: #ffffff; padding: 8px 12px; border-radius: 4px; font-family: Arial, sans-serif;">
        <strong style="color: #000; font-size: 14px; display: block;">Safety Score: ${score}</strong>
        <strong style="color: #000; font-size: 12px; display: block; margin-top: 4px;">Status: ${safetyLevel}</strong>
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* District Outline */}
        <GeoJSON data={boundary} style={{ color: "black", weight: 2, fill: false }} />

        {/* Color-coded Grid */}
        <GeoJSON 
          data={coloredGrid} 
          style={gridStyle}
          onEachFeature={onEachGridFeature}
        />

        {/* Route Line */}
        {route && (
          <>
            <Polyline 
              positions={[journeyInfo.sourceCoords, journeyInfo.destCoords]}
              color="#8e44ad"
              weight={4}
              opacity={0.8}
              dashArray="5, 5"
            />
            
            {/* Route Cells Highlight */}
            <GeoJSON 
              data={{
                type: "FeatureCollection",
                features: route.cellsOnRoute,
              }}
              style={{
                color: "#8e44ad",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.2,
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Journey Info Panel */}
      {route && journeyInfo && (
        <div className="journey-info-panel">
          <div className="journey-header">
            <h3>Journey Analysis</h3>
            <button className="close-journey" onClick={clearRoute}>✕</button>
          </div>
          
          <div className="journey-details">
            <p><strong>From:</strong> {journeyInfo.source}</p>
            <p><strong>To:</strong> {journeyInfo.destination}</p>
            <p><strong>Distance:</strong> {route.totalDistance.toFixed(2)} km</p>
          </div>

          <div className="safety-summary">
            <h4>Safety Assessment</h4>
            <div className={`safety-score ${route.safetyData.safetyLevel.toLowerCase().replace(" ", "-")}`}>
              <strong>Overall: {route.safetyData.safetyLevel}</strong>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{
                    width: `${route.safetyData.averageScore}%`,
                    backgroundColor: getColor(route.safetyData.averageScore),
                  }}
                ></div>
              </div>
              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                Score: {route.safetyData.averageScore}/100
              </p>
            </div>

            <div className="cells-breakdown">
              <p>🟢 Safe: {route.safetyData.safeCellsCount}</p>
              <p>🟡 Moderate: {route.safetyData.moderateCellsCount}</p>
              <p>🔴 Unsafe: {route.safetyData.unsafeCellsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Journey Planner Button */}
      <JourneyPlanner onPlanJourney={handlePlanJourney} />
    </div>
  );
}

export default Map;
