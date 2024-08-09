import React, { useRef, useEffect, useState, act } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useWebSocket } from '../context/WebSocketContext';
import { useAlarm } from '../context/AlarmContext';
import sendEmail from '../Email';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const data = useWebSocket();
    const [currentCoordinates, setCurrentCoordinates] = useState([3, -2, 88]);
    const [activity, setActivity] = useState(null);
    const macAddressMonaLisa = "c417c36b12d2";
    const alarmSound = useAlarm();

    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const cubeRef = useRef(null);
    const alarmSphereRef = useRef(null);

    // Handle WebSocket data
    useEffect(() => {
        try {
            if (data) {
                const { id, message } = data;
                if (id === 0 && message && Array.isArray(message.Items)) {
                    const item = message.Items.find(item => item.Mac === macAddressMonaLisa);
                    if (item) {
                        item.BeaconProperties.forEach(property => {
                            if (property.Type === 3 && Array.isArray(property.Values)) {
                                setCurrentCoordinates(property.Values);
                            }
                            if (property.Type === 1000 && Array.isArray(property.Values)) {
                                setActivity(property.Values);
                            }
                        });
                    } else {
                        console.warn("No item found with Mac address:", macAddressMonaLisa);
                    }
                } else {
                    console.warn("Items field is missing or not an array:", message);
                }
            }
        } catch (error) {
            console.error("Error parsing JSON message:", error);
        }
    }, [data]);

    // Setup scene, camera, renderer, and objects
    useEffect(() => {
        // Scene setup
        sceneRef.current = new THREE.Scene();
        cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current.position.z = 5;
        rendererRef.current = new THREE.WebGLRenderer();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setClearColor(0x000000);
        mountRef.current.appendChild(rendererRef.current.domElement);

        // Adding ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1).normalize();
        sceneRef.current.add(directionalLight);

        // Room info
        const roomSize = 30;
        const roomGeometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
        const roomTexture = new THREE.TextureLoader().load("museum.jpg");
        const ceiling = new THREE.TextureLoader().load("ceiling.jpg");
        const floor = new THREE.TextureLoader().load("floor.jpg");

        const roomMaterials = [
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: ceiling, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: floor, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide })
        ];
        const room = new THREE.Mesh(roomGeometry, roomMaterials);
        sceneRef.current.add(room);

        // Load Mona Lisa texture
        const textureLoader = new THREE.TextureLoader();
        const monaLisaTexture = textureLoader.load('mona_lisa.jpg');

        // Create materials and objects
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Front face
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Back face
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Top face
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Bottom face
            new THREE.MeshBasicMaterial({ map: monaLisaTexture }), // Right face
            new THREE.MeshBasicMaterial({ color: 0x333333 })  // Left face
        ];

        const geometry = new THREE.BoxGeometry(4, 4, 0.2);
        cubeRef.current = new THREE.Mesh(geometry, materials);
        sceneRef.current.add(cubeRef.current);

        const alarm = new THREE.SphereGeometry(0.2, 32, 32);
        const alarmMaterials = new THREE.MeshBasicMaterial({ color: 0xffffff });
        alarmSphereRef.current = new THREE.Mesh(alarm, alarmMaterials);
        alarmSphereRef.current.position.set(2.5, 2.5, 0);
        sceneRef.current.add(alarmSphereRef.current);

        // Set initial position of the cube
        cubeRef.current.position.set(0, 0, 0);

        // Add OrbitControls
        const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        // Handle window resizing
        const handleResize = () => {
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && rendererRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    useEffect( () => {

        if (alarmSphereRef.current) {
            if (Array.isArray(activity) && activity[0] === 1) {
            
                sendEmail();
               
                    if (alarmSound) {
                            alarmSound.play().catch(error => {
                            console.error("Error playing sound:", error);
                        });
                    }
                
                if (alarmSound && alarmSound.paused) {
                    alarmSound.play().catch(error => {
                        console.error("Error playing sound:", error);
                    });
                }
            } else {

                if (alarmSound && !alarmSound.paused) {
                    alarmSound.pause();
                    alarmSound.currentTime = 0; 
                }
            }
        }

    }, [alarmSound,activity]);

    // Animation and updates
    useEffect(() => {
        const animate = () => {

            requestAnimationFrame(animate);

            if (cubeRef.current) {
                cubeRef.current.rotation.x = THREE.MathUtils.degToRad(currentCoordinates[0]);
                cubeRef.current.rotation.y = THREE.MathUtils.degToRad(currentCoordinates[1]);
            }

            if (alarmSphereRef.current) {
                if (Array.isArray(activity) && activity[0] === 1) {
                    alarmSphereRef.current.material.color.set(0xff0000); // Red Color
                } else {
                    alarmSphereRef.current.material.color.set(0xffffff); // White Color
                }
            }

            // Render scene
            if (rendererRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
    };

    animate();
}, [currentCoordinates, activity]);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeScene;
