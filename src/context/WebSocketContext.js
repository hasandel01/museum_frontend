import React, {createContext, useContext, useRef, useEffect, useState} from 'react'

const WebSocketContext = createContext();


export const WebSocketProvider = ( {children} ) => {
    const [data, setData] = useState(null)
    const wsRef = useRef(null)

    useEffect( () => {

        wsRef.current = new WebSocket("ws://localhost:8080/mqtt-server")

        wsRef.current.onopen = () => {
            console.log("WebSocket connection is established.")
        }

        wsRef.current.onmessage = (event) => {
            try {
                const parsedData = JSON.parse(event.data)
                setData(parsedData) 
            }catch(error) {
                console.error("Error parsing WebSocket message!", error)
            }
        }


        wsRef.current.onerror = (error) => {
            console.error("WebSocket connection error!", error)
        }

        wsRef.current.onclose = () => {
            console.log("WebSocket connection is closed.")
        }


        return () => {
            if(wsRef.current) {
                wsRef.current.close();
            }
        }
    }, [])


    return (
        <WebSocketContext.Provider value={data} >
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => useContext(WebSocketContext)