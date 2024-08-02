import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";

const Showcase = () => {

    const data = useWebSocket();
    const macAddressMonaLisa = "c417c36b12d2"
    const [activity, setActivity] = useState(null)
    const [currentCoordinates, setCurrentCoordinates] = useState([3,-2,88])
    const [click,setClick] = useState();
    const [temperature,setTemperature] = useState();
    const [batteryLevel,setBatteryLevel] = useState();
    const [hubId, setHubId] = useState()
    const [rssi,setRssi] = useState()
    const [time,setTime] = useState()

    const wsRef = useRef(null)

    useEffect(() => {

            try {                      
                if(data) {
                    const {id, message} = data  

                    if(id === 0) {

                        if (message && Array.isArray(message.Items)) {        
                            // Process Items as needed
                            const item = message.Items.find(item => item.Mac === macAddressMonaLisa);        
                            if (item) {
                                item.BeaconProperties.forEach(property => {
                                    switch(property.Type) {
                                        case 1:
                                            if(Array.isArray(property.Values)) 
                                                setBatteryLevel(property.Values)
                                            break
                                        case 2:
                                            if(Array.isArray(property.Values))
                                                setTemperature(property.Values)
                                            break
                                        case 3:
                                            if(Array.isArray(property.Values))
                                                setCurrentCoordinates(property.Values)
                                            break
                                        case 1000:
                                            if(Array.isArray(property.Values))
                                                setActivity(property.Values)
                                            break
                                        case 1012:
                                            if(Array.isArray(property.Values))
                                                setClick(property.Values)
                                            break
                                    }
                                });
                            } else {
                                console.warn("No item found with Mac address:", macAddressMonaLisa);
                            }
                        } else {
                            console.warn("Items field is missing or not an array:", message);
                        }
                }else if(id === 1) {
                       console.log(message)
                        if(message && Array.isArray(message.Hubs)) {
                            setHubId(message.Hubs[0].HubId)
                            setRssi(message.Hubs[0].Rssi)
                            setTime(message.CreatedAt)
                        } 
                }
            }
                
            } catch (error) {
                console.error("Error parsing JSON message:", error);
            }
    },[data])


    return (
        <div className="showcase">
            <h1> Showcase </h1>
            <hr/>
                <a href="https://en.wikipedia.org/wiki/Mona_Lisa"> 
                    <img className="mona_lisa" src="mona_lisa.jpg" alt="Mona Lisa" width={200} /> 
                </a>
                <div className="details">
                    <p id="p1">X: {currentCoordinates[0]}</p>
                    <p id="p2">Y: {currentCoordinates[1]}</p>
                    <p id="p3">Z: {currentCoordinates[2]} </p>
                    <h3>Button Click: </h3>
                    <p>{click}</p>
                    <h3>Temperature: </h3>
                    <p>{temperature}</p>
                    <h3>Battery Level: </h3>
                    <p>{batteryLevel}</p>
                    <h3>Activity: </h3>
                    <p>{activity !== null ? activity : "No activity data available"}</p>
                </div>
                <div className="hub-info">
                    <h3>Beacon is in the area of HUB: </h3>
                    <p>{hubId}</p>
                    <h3>RSSI value: </h3>
                    <p>{rssi} </p>
                    <h3>Time: </h3>
                    <p>{time}</p>
                </div>
        </div>
)

}

export default Showcase;