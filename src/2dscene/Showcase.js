import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { useAlarm } from "../context/AlarmContext";
import sendEmail from '../Email';

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
    const [date, setDate] = useState()
    const alarmSound = useAlarm()    
  
    useEffect(() => {

            try {        
                
                if(data) {
                    const {id, message} = data  

                    if(id === 0) {

                        if (message && Array.isArray(message.Items)) {        
                            const item = message.Items.find(item => item.Mac === macAddressMonaLisa);        
                            if (item) {
                                item.BeaconProperties.forEach(property => {
                                    switch(property.Type) {
                                        case 1:
                                                setBatteryLevel(property.Values)
                                            break
                                        case 2:
                                                setTemperature(property.Values)
                                            break
                                        case 3:
                                                setCurrentCoordinates(property.Values)
                                            break
                                        case 1000:
                                                setActivity(property.Values[0]);
                                            break
                                        case 1012:
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

                    if(message && Array.isArray(message.Hubs)) {
                            setHubId(message.Hubs[0].HubId)
                            setRssi(message.Hubs[0].Rssi)  

                            const dateTime = new Date(message.CreatedAt)

                            const optionsDate = { year: 'numeric', month: 'long', day: 'numeric'}
                            const dateStr = new Intl.DateTimeFormat('en-US', optionsDate).format(dateTime)

                            const optionsTime = {hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'}
                            const timeStr = Intl.DateTimeFormat('en-US', optionsTime).format(dateTime)
                            setDate(dateStr)
                            setTime(timeStr)
                        } 
                }
            }
                
            } catch (error) {
                console.error("Error parsing JSON message:", error);
            }
    },[data])


    useEffect(() => {

        if(activity === 1) {
                sendEmail();
                if (alarmSound) {
                    alarmSound.play().catch(error => {
                        console.error("Error playing sound:", error);
                    });
                }
        }
    }, [activity, alarmSound]);

    return (
        <div className="showcase">
                <a href="https://en.wikipedia.org/wiki/Mona_Lisa"> 
                    <img className="mona_lisa" src="mona_lisa.jpg" alt="Mona Lisa" width={320} /> 
                </a>
                <h1 className="date"> {date} </h1>
                <table>
            <tbody>
                <tr>
                    <td colSpan={2} className="details-header">Details</td>
                </tr>
                <tr>
                    <td className="label">Coordinates</td>
                </tr>
                <tr>
                    <td className="coordinates">X</td>
                    <td className="value">{currentCoordinates[0]}</td>
                </tr>
                <tr>
                    <td className="coordinates">Y</td>
                    <td className="value">{currentCoordinates[1]}</td>
                </tr>
                <tr>
                    <td className="coordinates">Z</td>
                    <td className="value">{currentCoordinates[2]}</td>
                </tr>
                <tr>
                    <td className="label">Button Click</td>
                    <td className="value">{click}</td>
                </tr>
                <tr>
                    <td className="label">Temperature</td>
                    <td className="value">{temperature}</td>
                </tr>
                <tr>
                    <td className="label">Battery Level</td>
                    <td className="value">{batteryLevel}</td>
                </tr>
                <tr>
                    <td className="label">Activity</td>
                    <td className="value">{activity !== null ? activity : "No activity data available"}</td>
                </tr>
                <tr>
                    <td colSpan="2" className="hub-info-header">Hub Information</td>
                </tr>
                <tr>
                    <td className="label">Beacon is in the area of HUB</td>
                    <td className="value">{hubId}</td>
                </tr>
                <tr>
                    <td className="label">RSSI value</td>
                    <td className="value">{rssi}</td>
                </tr>
                <tr>
                    <td className="label">Time</td>
                    <td className="value">{time}</td>
                </tr>
            </tbody>
        </table>

        </div>
)

}

export default Showcase;