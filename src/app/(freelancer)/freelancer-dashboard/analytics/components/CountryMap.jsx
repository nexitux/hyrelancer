"use client";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CountryMap = ({ mapColor = "#e4e4e4" }) => {
  const [geoData, setGeoData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const geoJsonLayerRef = useRef(null);

  // Sample customer data - India only
  const customerData = {
    "India": { customers: 445, percentage: 100 }
  };

  // Load GeoJSON on mount
  useEffect(() => {
    fetch("/custom.geo.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("GeoJSON loaded:", data);
        setGeoData(data);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }, []);

  // Style for each country polygon
  const countryStyle = (feature) => {
    const countryName = feature.properties.NAME || feature.properties.ADMIN || feature.properties.name || feature.properties.NAME_EN;
    const isSelected = selectedCountry === countryName;
    const hasCustomers = customerData[countryName] || customerData[countryName?.replace("United States", "USA")];
    
    let fillColor = "#e2e8f0"; // Light gray for countries without data
    if (isSelected) fillColor = "#1e40af"; // Dark blue for selected
    else if (hasCustomers) fillColor = "#60a5fa"; // Light blue for countries with customers

    return {
      fillColor: fillColor,
      weight: 0.5,
      opacity: 1,
      color: "#ffffff",
      fillOpacity: 0.7,
    };
  };

  // On hover highlight effect
  const highlightFeature = (e) => {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      color: "#666",
      fillOpacity: 0.9,
    });
    layer.bringToFront();
  };

  // Reset highlight when not hovered
  const resetHighlight = (e) => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.resetStyle(e.target);
    }
  };

  // Handle country interactions
  const onEachCountry = (country, layer) => {
    const countryName = country.properties.NAME || country.properties.ADMIN || country.properties.name || country.properties.NAME_EN;
    const customerInfo = customerData[countryName] || customerData[countryName?.replace("United States", "USA")];
    
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: () => {
        setSelectedCountry(selectedCountry === countryName ? null : countryName);
        console.log("Selected country:", countryName);
      },
    });

    // Add tooltip with country info
    if (customerInfo) {
      const tooltipContent = `<strong>${countryName}</strong><br/>Customers: ${customerInfo.customers}<br/>Share: ${customerInfo.percentage}%`;
      layer.bindTooltip(tooltipContent, { 
        sticky: true,
        className: 'custom-tooltip'
      });
    }
  };

  return (
    <div className="w-full">{/* Removed duplicate header styling */}

      {/* Map Container */}
      <div style={{ height: "212px", width: "100%" }} className="bg-gray-100">
        <MapContainer
          center={[40, -20]}
          zoom={2}
          scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ 
            height: "212px", 
            width: "100%",
            backgroundColor: "#f1f5f9"
          }}
        >
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution=""
          />
          {geoData && (
            <GeoJSON
              ref={geoJsonLayerRef}
              data={geoData}
              style={countryStyle}
              onEachFeature={onEachCountry}
            />
          )}
        </MapContainer>
      </div>

      {/* Country Statistics */}
      <div className="space-y-4">
        {/* USA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-4 bg-blue-600 rounded-sm overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-red-600 to-blue-600"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">USA</p>
              <p className="text-sm text-gray-600">2,379 Customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: '79%' }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">79%</span>
          </div>
        </div>

        {/* France */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-4 bg-blue-600 rounded-sm overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-white to-red-600"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">France</p>
              <p className="text-sm text-gray-600">589 Customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: '23%' }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">23%</span>
          </div>
        </div>
      </div>

      {/* Selected Country Info */}
      {selectedCountry && customerData[selectedCountry] && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>{selectedCountry}</strong> - {customerData[selectedCountry].customers} customers ({customerData[selectedCountry].percentage}%)
          </p>
        </div>
      )}

      {/* Loading/Error State */}
      {!geoData && (
        <div className="text-center py-8 text-gray-500">
          Loading map data...
        </div>
      )}

      {/* Custom CSS for tooltips */}
      <style jsx global>{`
        .custom-tooltip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 8px !important;
          font-size: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .custom-tooltip::before {
          border-top-color: white !important;
        }
        .leaflet-container {
          font-family: inherit !important;
          z-index: 5;
        }
      `}</style>
    </div>
  );
};

export default CountryMap;