// First install these dependencies:
// npm install leaflet react-leaflet

import React, { useContext, useEffect, useState } from "react";
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
import { MainContext } from "../context/primaryContext";

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

// Create a custom marker icon
const createCustomIcon1 = () => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div class="w-8 h-8 text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="green" stroke="green" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3" fill="white" stroke="green"></circle>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const createCustomIcon2 = () => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div class="w-8 h-8 text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="red" stroke="red" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3" fill="white" stroke="red"></circle>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

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

const BusRouteFinder = () => {
  const [markerPosition, setMarkerPosition] = useState([]);
  const { markerState, setMarkerState } = useContext(MainContext);

  const [busStops, setBusStops] = useState([]);
  const [majorCheckPoints, setMajorCheckPoints] = useState([]);

  console.log(markerState);

  const customIcon1 = createCustomIcon1();
  const customIcon2 = createCustomIcon2();
  const [locationName, setLocationName] = useState("");

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

  const getDataFromServer = async (lat1, lon1, lat2, lon2) => {
    const makeRouteRequest = async (sLat, sLon, dLat, dLon) => {
      const params = new URLSearchParams({
        s_lat: sLat,
        s_lon: sLon,
        d_lat: dLat,
        d_lon: dLon,
      });

      const response = await fetch(
        `http://localhost:3000/route?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    };

    const checkBusStop = (data, targetLat, targetLon) => {
      const COORDINATE_THRESHOLD = 0.001;
      // const round_lat = Math.round(targetLat * 1000) / 1000;
      // const round_lon = Math.round(targetLon * 1000) / 1000;
      console.log("df:", data);

      return data.find(
        // Changed from some to find to get the matching point
        (point) =>
          (point.type === "busStop" || point.type === "majorCheckPoint") &&
          Math.abs(point.lt - targetLat) <= COORDINATE_THRESHOLD &&
          Math.abs(point.ln - targetLon) <= COORDINATE_THRESHOLD
      );
    };

    try {
      // Initial route request
      const { result: initialData, closestDestStop: sourceDestination } =
        await makeRouteRequest(lat1, lon1, lat2, lon2);
      console.log("Initial data received:", initialData);
      console.log("Initial src received:", sourceDestination);

      console.log("ele: ", initialData);

      const directBusStop = checkBusStop(
        initialData.markerPosition,
        sourceDestination.stop.lt,
        sourceDestination.stop.ln
      );

      console.log("cd ", directBusStop);
      if (directBusStop) {
        console.log("Bus stop found with the given coordinates.");

        setPolyLine(initialData.polyLines); // Using polyLines from the matching point

        return;
      }

      const majorPoints = initialData.markerPosition.filter(
        (point) => point.type === "majorCheckPoint"
      );
      console.log("st: ", majorPoints);
      if (majorCheckPoints.length >= 3) {
       
        const { result: secndaryData3 } = await makeRouteRequest(
          majorPoints[2].ln,
          majorPoints[2].lt,
          sourceDestination.stop.lt,
          sourceDestination.stop.ln
        );
  
        const directBusStop3 = checkBusStop(
          secndaryData3.markerPosition,
          sourceDestination.stop.lt,
          sourceDestination.stop.ln
        );
  
        if (directBusStop3) {
          console.log("Bus stop found with the given coordinates.");
  
          const indexx = initialData.markerPosition.findIndex(
            (item) => item.namee === majorPoints[2].namee
          );
  
          setPolyLine([
            initialData.polyLines.slice(0, indexx + 1),
            secndaryData3.polyLines,
          ]); // Using polyLines from the matching point
          return;
        }

      }

      const { result: secndaryData1 } = await makeRouteRequest(
        majorPoints[0].ln,
        majorPoints[0].lt,
        sourceDestination.stop.lt,
        sourceDestination.stop.ln
      );

      const directBusStop1 = checkBusStop(
        secndaryData1.markerPosition,
        sourceDestination.stop.lt,
        sourceDestination.stop.ln
      );

      if (directBusStop1) {
        console.log("Bus stop found with the given coordinates.");

        const indexx = initialData.markerPosition.findIndex(
          (item) => item.namee === majorPoints[0].namee
        );

        setPolyLine([
          initialData.polyLines.slice(0, indexx + 1),
          secndaryData1.polyLines,
        ]); // Using polyLines from the matching point
        return;
      }

      const { result: secndaryData2 } = await makeRouteRequest(
        majorPoints[1].ln,
        majorPoints[1].lt,
        sourceDestination.stop.lt,
        sourceDestination.stop.ln
      );

      const directBusStop2 = checkBusStop(
        secndaryData2.markerPosition,
        sourceDestination.stop.lt,
        sourceDestination.stop.ln
      );

      if (directBusStop2) {
        console.log("Bus stop found with the given coordinates.");

        const indexx = initialData.markerPosition.findIndex(
          (item) => item.namee === majorPoints[1].namee
        );

        setPolyLine([
          initialData.polyLines.slice(0, indexx + 1),
          secndaryData2.polyLines,
        ]); // Using polyLines from the matching point
        return;
      }

      console.log("No bus stop found in any route");
    } catch (error) {
      console.error("Error sending data to the server:", error);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const placeName = data.display_name.split(",").slice(0, 3).join(",");
      setLocationName(data.display_name || "Location not found");

      if (markerState === "confirmed") {
        if (markerPosition.length === 1) {
          setMarkerPosition((prev) => [
            ...prev,
            { type: markerState, lt: lat, ln: lon, namee: placeName },
          ]);
        } else {
          markerPosition.pop();
          setMarkerPosition((prev) => [
            ...prev,
            { type: markerState, lt: lat, ln: lon, namee: placeName },
          ]);
        }

        setDestination(placeName);
      } else {
        setMarkerPosition([
          { type: markerState, lt: lat, ln: lon, namee: placeName },
        ]);
        setSource(placeName);
      }

      // setMajorCheckPoints((prev) => [
      //   ...prev,
      //   { lt: lat, ln: lon, namee: placeName },
      // ]);
      // console.log(placeName, lat, lon);
      // console.log(majorCheckPoints);

      console.log(markerPosition);
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Error fetching location");
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (event) => {
        const { lat, lng } = event.latlng;

        // setPolyLine((prev) => [...prev, [lat, lng]]);

        fetchLocationName(lat, lng);

        // setMarkerPosition((prev) => [
        //   ...prev,
        //   { type: markerState, lt: lat, ln: lng },
        // ])

        console.log(markerPosition);
        console.log(busStops);
      },
    });
    return null;
  };

  // Sample bus route data - replace with your actual data
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  
  return (
    <div style={{ height: "600px", width: "100%" }}>
      <div>
        <input
          value={source}
          placeholder="a"
          onChange={(e) => setSource(e.target.value)}
        />
        <input
          value={destination}
          placeholder="b"
          onChange={(e) => setSource(e.target.value)}
        />
        <button onClick={() => setMarkerState("confirmed")}>a confirm</button>
        <button
          onClick={() =>
            getDataFromServer(
              markerPosition[0].lt,
              markerPosition[0].ln,
              markerPosition[1].lt,
              markerPosition[1].ln
            )
          }
        >
          b confirm
        </button>
      </div>
      <div>{/* <button onClick={sendDataToServer}>click gar</button> */}</div>
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
          markerPosition.map((markerr) =>
            markerr.type === "normal" ? (
              <Marker
                position={[markerr.lt, markerr.ln]}
                key={`${markerr.lt}-${markerr.ln}`}
              />
            ) : markerr.type === "busStop" ? (
              <Marker
                icon={customIcon1}
                position={[markerr.lt, markerr.ln]}
                key={`${markerr.lt}-${markerr.ln}`}
              />
            ) : (
              <Marker
                icon={customIcon2}
                position={[markerr.lt, markerr.ln]}
                key={`${markerr.lt}-${markerr.ln}`}
              />
            )
          )}

        {polyLine && (
          <React.Fragment key={123}>
            <Polyline positions={polyLine} color={"green"} weight={3}>
              <Popup>{"Asdasd"}</Popup>
            </Polyline>
          </React.Fragment>
        )}
      </MapContainer>
    </div>
  );
};

export default BusRouteFinder;
