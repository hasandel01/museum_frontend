import React from "react";
import { useContext, createContext} from "react";

const AlarmContext = createContext();

export const AlarmProvider = ( {children }) => {

    const alarmSound = new Audio("/alarm.mp3");

    return (
        <AlarmContext.Provider value={alarmSound}>
            {children}
        </AlarmContext.Provider>
    )
}

export const useAlarm = () => useContext(AlarmContext);