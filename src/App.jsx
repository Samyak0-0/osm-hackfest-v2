import { useState } from "react";

import "./App.css";
import BusRouteMap from "./components/BusRouteMap";
import { MainContextProvider } from "./context/primaryContext";

function App() {
  return (
    <>
      <MainContextProvider>
        <BusRouteMap />
      </MainContextProvider>
    </>
  );
}

export default App;
