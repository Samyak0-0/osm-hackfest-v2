// First install these dependencies:
// npm install leaflet react-leaflet

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { marker } from "leaflet";

// Fix for default markers not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const getPosition = () => {
  const [currentPosition, setCurrentPosition] = useState([27.71, 85.32]); // Default fallback position

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          setCurrentPosition([
            location.coords.latitude,
            location.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return currentPosition;
};

const BusRouteMap = () => {
  const [markerPosition, setMarkerPosition] = useState([]);

  const [polyLine, setPolyLine] = useState([]);
  // const polyLine = [
  //   {
  //     id: 123,
  //     color: "green",
  //     route: [
  //       [27.7, 83.4],
  //       [27.9, 83.49],
  //     ],
  //   },
  // ];
  // This component handles map events
  const MapClickHandler = () => {
    useMapEvents({
      click: (event) => {
        const { lat, lng } = event.latlng;
        setMarkerPosition((prev) => [...prev, { lt: lat, ln: lng }]);
        setPolyLine((prev) => [...prev, [lat, lng]])
      },
    });
    return null;
  };

  // Sample bus route data - replace with your actual data
  const busRoutes = [
    {
      id: 1,
      name: "Route 1",
      color: "#FF0000",
      stops: [
        { name: "Stop A", position: [51.505, -0.09] },
        { name: "Stop B", position: [51.51, -0.1] },
        { name: "Stop C", position: [51.515, -0.09] },
      ],
      path: [
        [51.505, -0.09],
        [51.51, -0.1],
        [51.515, -0.09],
      ],
    },
    {
      id: 2,
      name: "Route 2",
      color: "#0000FF",
      stops: [
        { name: "Stop D", position: [51.505, -0.08] },
        { name: "Stop E", position: [51.51, -0.085] },
        { name: "Stop F", position: [51.515, -0.082] },
      ],
      path: [
        [51.505, -0.08],
        [51.51, -0.085],
        [51.515, -0.082],
      ],
    },
  ];

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={getPosition()}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {markerPosition &&
          markerPosition.map((markerr) => (
            <Marker
              position={[markerr.lt, markerr.ln]}
              key={`${markerr.lt}-${markerr.ln}`}
            />
          ))}

        {polyLine && 
          <React.Fragment key={123}>
            <Polyline positions={polyLine} color={"green"} weight={3}>
              <Popup>{"Asdasd"}</Popup>
            </Polyline>
          </React.Fragment>
        }

        {busRoutes.map((route) => (
          <React.Fragment key={route.id}>
            {/* Draw the route line */}
            <Polyline positions={route.path} color={route.color} weight={3}>
              <Popup>{route.name}</Popup>
            </Polyline>

            {/* Add markers for bus stops */}
            {route.stops.map((stop, index) => (
              <Marker
                key={`${route.id}-stop-${index}`}
                position={stop.position}
              >
                <Popup>
                  {stop.name}
                  <br />
                  {route.name}
                </Popup>
              </Marker>
            ))}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusRouteMap;
