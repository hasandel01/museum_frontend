import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import axiosInstance from './axios/api';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const [data, setData] = useState(null);
    const [initialCoordinates, setInitialCoordinates] = useState([3,-2,88])
    const [currentCoordinates, setCurrentCoordinates] = useState([3,-2,88])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/api/beaconProperties');
                setData(response.data);
                const threshold = 2;
                
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
                                })
                        }
                    });
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 2000);

        return () => clearInterval(intervalId)
        
    }, [initialCoordinates]);

    useEffect(() => {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);


        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
        directionalLight.position.set(1,1,1).normalize();


        const roomSize = 10
        const roomGeometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize)

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

        // Calculate initial offset
        const [initialX, initialY, initialZ] = initialCoordinates;
        const initialOffset = [initialX, initialY, initialZ];
        
        // Set initial position of the cube to the origin
        cube.position.set(0, 0, 0);

        // Add OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const animate = () => {
            requestAnimationFrame(animate);

            cube.rotation.x = THREE.MathUtils.degToRad(currentCoordinates[0])
            cube.rotation.y = THREE.MathUtils.degToRad(currentCoordinates[1])
            cube.rotation.z = 0


            // Rotate the cube for a 3D effect
            renderer.render(scene, camera);
        };

        animate();

        // Clean up
        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [currentCoordinates]);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ThreeScene;
