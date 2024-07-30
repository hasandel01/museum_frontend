import React, { useRef, useEffect, useState, act } from 'react';
import * as THREE from 'three';
import axiosInstance from './axios/api';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const [data, setData] = useState(null);
    const [initialCoordinates, setInitialCoordinates] = useState([3,-2,88])
    const [currentCoordinates, setCurrentCoordinates] = useState([3,-2,88])
    const [activity, setActivity] = useState(null)


    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const cubeRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/api/beaconProperties');
                setData(response.data);

                if (response.data && response.data.Items) {
                    response.data.Items.forEach(item => {
                        if (item.Mac === "c417c36b12d2") {
                            item.BeaconProperties.forEach(property => {
                                if(property.Type == 3)  {
                                    if(Array.isArray(property.Values)) {
                                    const coords = property.Values;
                                    const [x,y,z] = coords;
                                    const [initialX, initialY, initialZ] = initialCoordinates;
                                    setCurrentCoordinates(coords)
                                    console.log("Coordinates: " + coords)

                                    }
                                }

                                if(property.Type == 1000) {
                                    if(Array.isArray(property.Values)) {
                                        const activity = property.Values;
                                        setActivity(activity)
                                        console.log("Activity: " + activity)
                                }

                                }
                                })
                        }
                    });
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 500);

        return () => clearInterval(intervalId)

    }, []);

    useEffect(() => {


        // Setup for the scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xeeeeee)
        mountRef.current.appendChild(renderer.domElement);

        //Adding ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
        directionalLight.position.set(1,1,1).normalize();
        scene.add(directionalLight)

        //Room info
        const roomSize = 50
        const roomGeometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize)
        const roomTexture = new THREE.TextureLoader().load("museum.jpg")
        const ceiling = new THREE.TextureLoader().load("ceiling.jpg")
        const floor = new THREE.TextureLoader().load("floor.jpg")


        const roomMaterials = [
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide }), // Inside faces of the room
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: ceiling, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: floor, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: roomTexture, side: THREE.BackSide })
        ]
        const room = new THREE.Mesh(roomGeometry, roomMaterials)
        scene.add(room)

        const textureLoader = new THREE.TextureLoader();
        
        // Load Mona Lisa texture
        const monaLisaTexture = textureLoader.load('mona_lisa.jpg');
        
        // Create materials
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Front face
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Back face
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Top face
            new THREE.MeshBasicMaterial({ color: 0x333333 }), // Bottom face
            new THREE.MeshBasicMaterial({ map: monaLisaTexture }), // Right face
            new THREE.MeshBasicMaterial({ color: 0x333333 })  // Left face
        ];

        // Create box geometry with custom materials
        const geometry = new THREE.BoxGeometry(4,4,0.2);
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);


        const alarm = new THREE.SphereGeometry(0.5,32,32)
        const alarmMaterials = new THREE.MeshBasicMaterial( {color: 0xffffff})

        const alarmSphere = new THREE.Mesh(alarm,alarmMaterials)
        alarmSphere.position.set(3,3,0)
        scene.add(alarmSphere)

        // Calculate initial offset
        const [initialX, initialY, initialZ] = initialCoordinates;
        const initialOffset = [initialX, initialY, initialZ];
        
        // Set initial position of the cube to the origin
        cube.position.set(0, 0, 0);

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        cubeRef.current = cube;

        // Add OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const animate = () => {
            requestAnimationFrame(animate);

            cube.rotation.x = THREE.MathUtils.degToRad(currentCoordinates[0])
            cube.rotation.y = THREE.MathUtils.degToRad(currentCoordinates[1])

            if(activity == 1) 
                alarmSphere.material.color.set(0xff0000)
            else
                alarmSphere.material.color.set(0xffffff)
            

            // Rotate the cube for a 3D effect
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resizing
        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [currentCoordinates, activity]);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeScene;
