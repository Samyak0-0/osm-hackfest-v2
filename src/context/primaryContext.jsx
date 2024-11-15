import { marker } from "leaflet";
import { createContext, useState } from "react";

export const MainContext = createContext();

export const MainContextProvider = (props) => {

    const[markerState, setMarkerState] = useState("normal")

    return <MainContext.Provider value={{ markerState,setMarkerState }} >
        {props.children}
    </MainContext.Provider>
}