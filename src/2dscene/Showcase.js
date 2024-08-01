import { useEffect, useRef, useState } from "react";

const Showcase = () => {
    const mountRef = useRef(null);
    const [data, setData] = useState(null);
    const [activity, setActivity] = useState(null)
    const [macAddressMonaLisa, setMacAddressMonaLisa] = useState("c417c36b12d2")
    const [macAddress, setMacAddress] = useState("")
    const [currentCoordinates, setCurrentCoordinates] = useState([3,-2,88])
    const [click,setClick] = useState();
    const [temperature,setTemperature] = useState();
    const [batteryLevel,setBatteryLevel] = useState();
 
    const wsRef = useRef(null);


    useEffect(() => {
        wsRef.current = new WebSocket("ws://localhost:8080/mqtt-server");
    
        wsRef.current.onopen = () => {
            console.log("WebSocket connection is established.");
        };
    
        wsRef.current.onmessage = (event) => {
        
            try {
                const message = JSON.parse(event.data);        
                if (message && Array.isArray(message.Items)) {        
                    // Process Items as needed
                    const item = message.Items.find(item => item.Mac === macAddressMonaLisa);        
                    if (item) {
                        item.BeaconProperties.forEach(property => {
                            if (property.Type === 3 && Array.isArray(property.Values)) {
                                const coords = property.Values;
                                setCurrentCoordinates(coords);
                            }
                            if (property.Type === 1000 && Array.isArray(property.Values)) {
                                const activity = property.Values[0]; // Assuming activity is a single value
                                setActivity(activity);
                            }

                            if(property.Type === 1012 && Array.isArray(property.Values)) {
                                const click = property.Values[0];
                                setClick(click)
                            }

                            if(property.Type === 2 && Array.isArray(property.Values)) {
                                const temperature = property.Values[0];
                                setTemperature(temperature)
                            }

                            if(property.Type === 1 && Array.isArray(property.Values)) {
                                const batteryLevel= property.Values[0];
                                setBatteryLevel(batteryLevel)
                            }
                        });
                    } else {
                        console.warn("No item found with Mac address:", macAddressMonaLisa);
                    }
                } else {
                    console.warn("Items field is missing or not an array:", message);
                }
            } catch (error) {
                console.error("Error parsing JSON message:", error);
            }
        }
    },[])



    return (
        <div>
            <h1> Showcase </h1>
            <div className="showcase-base">
                <img className="mona_lisa" src="mona_lisa.jpg" alt="Mona Lisa" width={200} height={200}/> 
                <h2> Current Coordinates </h2>
                <p>X: {currentCoordinates[0]}</p>
                <p>Y: {currentCoordinates[1]}</p>
                <p>Z: {currentCoordinates[2]} </p>
                <h2> Button Click </h2>
                <p>Res = {click} </p>
                <h2>Temperature </h2>
                <p> temperature = {temperature}</p>
                <h2> Battery Level </h2>
                <p> Battery: {batteryLevel}</p>
                <h2>Activity</h2>
                <p>{activity !== null ? activity : "No activity data available"}</p>
            </div>
        </div>
    )

}

export default Showcase;