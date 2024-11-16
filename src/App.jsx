import { useState } from "react";

import "./App.css";
import BusRouteMap from "./components/BusRouteMap";
import { MainContextProvider } from "./context/primaryContext";
import BusRouteFinder from "./components/BusRouteFinder";

function App() {
  return (
    <>
      <MainContextProvider>
        {/* <BusRouteMap /> */}
        <BusRouteFinder />
      </MainContextProvider>
    </>
  );
}

export default App;
