import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useToast } from '../ui/toasts/ToastProvider.jsx';
import Button from '../ui/button/Button.jsx';
import { Eye, Edit, Trash2, Zap, Server as ServerIcon } from 'lucide-react';
import styles from './RackSimulator.module.css';

// Componente utilitario para el menú de acciones (aparece al hacer clic)
const RackActionMenu = ({ rack, position, onAction, onClose }) => {
    // Calcula la posición relativa al contenedor principal (asumiendo que el cuerpo es el padre)
    const style = {
        top: position.y,
        left: position.x,
    };

    return (
        <div className={styles.actionMenu} style={style} onMouseLeave={onClose}>
            <p className={styles.menuTitle}>{rack.name}</p>
            <div className={styles.menuActions}>
                <Button size="small" variant="info" onClick={() => onAction('view', rack.id)}>
                    <Eye size={16} /> Ver
                </Button>
                <Button size="small" variant="secondary" onClick={() => onAction('edit', rack.id)}>
                    <Edit size={16} /> Editar
                </Button>
                <Button size="small" variant="danger" onClick={() => onAction('delete', rack.id)}>
                    <Trash2 size={16} /> Borrar
                </Button>
            </div>
            <span className={styles.menuClose} onClick={onClose}>&times;</span>
        </div>
    );
};


const RackSimulator = ({ racks, onRackAction }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const { showToast } = useToast();

    // 3D States
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [raycaster] = useState(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());

    // UI States
    const [hoveredRack, setHoveredRack] = useState(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const [selectedRack, setSelectedRack] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });


    // --- 3D UTILITIES: Custom Geometries ---

    // 1. Dibuja el modelo de rack vacío
    const createEmptyRack = useCallback(() => {
        const height = 4;
        const width = 2;
        const depth = 2.5;

        // Base (Color Oscuro)
        const frameGeometry = new THREE.BoxGeometry(width, height, depth);
        const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x334155 });
        const rackFrame = new THREE.Mesh(frameGeometry, frameMaterial);

        // Puerta (Color de Cristal/Oscuro semitransparente)
        const doorGeometry = new THREE.BoxGeometry(width * 0.95, height * 0.95, 0.05);
        const doorMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e293b,
            opacity: 0.8,
            transparent: true,
            specular: 0x555555
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.z = depth / 2 + 0.02; // Al frente
        
        // Agrupar y centrar
        const group = new THREE.Group();
        group.add(rackFrame);
        group.add(door);
        
        return group;
    }, []);

    // 2. Dibuja el modelo de rack con servidores
    const createFullRack = useCallback((serverCount) => {
        const group = createEmptyRack();
        const height = 4;

        // Añadir elementos (simulando servidores 1U)
        for (let i = 0; i < Math.min(serverCount, 6); i++) {
            const serverHeight = 0.3; 
            const serverY = height / 2 - (i * (serverHeight + 0.2)) - (serverHeight / 2) - 0.2; 
            
            const serverGeometry = new THREE.BoxGeometry(1.8, serverHeight, 2.3);
            const serverMaterial = new THREE.MeshPhongMaterial({ color: 0x4f46e5 }); // Color Morado para los servidores
            const serverMesh = new THREE.Mesh(serverGeometry, serverMaterial);
            
            serverMesh.position.y = serverY;
            serverMesh.position.z = 0.5; // Dentro del rack
            
            group.add(serverMesh);
        }
        return group;
    }, [createEmptyRack]);


    // --- CORE INITIALIZATION ---
    
    // Inicialización de la escena y el renderer
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Escena
        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(0x0f172a); // Fondo oscuro
        setScene(newScene);

        // 2. Cámara (Isométrica/Ortográfica)
        const aspect = width / height;
        const frustumSize = 15;
        const newCamera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2,
            0.1, 1000
        );
        // Posición de la vista isométrica: 45 grados arriba y rotado
        newCamera.position.set(10, 10, 10);
        newCamera.lookAt(newScene.position);
        setCamera(newCamera);


        // 3. Renderer
        const newRenderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
        newRenderer.setSize(width, height);
        newRenderer.setPixelRatio(window.devicePixelRatio);
        setRenderer(newRenderer);

        // 4. Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        newScene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(15, 20, 15);
        newScene.add(pointLight);

        // 5. Grid/Floor
        const gridHelper = new THREE.GridHelper(50, 50, 0x475569, 0x475569);
        newScene.add(gridHelper);
        
        // Manejar el redimensionamiento
        const handleResize = () => {
            if (!containerRef.current || !newCamera || !newRenderer) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;

            newRenderer.setSize(newWidth, newHeight);

            // Ajuste de cámara ortográfica al nuevo aspecto
            const newAspect = newWidth / newHeight;
            newCamera.left = frustumSize * newAspect / -2;
            newCamera.right = frustumSize * newAspect / 2;
            newCamera.top = frustumSize / 2;
            newCamera.bottom = frustumSize / -2;
            newCamera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            newRenderer.dispose();
            // Limpieza de memoria (disponer de geometrías, materiales, etc.)
            newScene.traverse((object) => {
                if (object.isMesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, []);

    // --- RENDER & LOGIC LOOP ---
    
    // Función para renderizar los objetos de rack
    const renderRacks = useCallback((currentScene) => {
        if (!currentScene) return;

        // Limpiar racks anteriores
        const oldRacks = currentScene.children.filter(c => c.userData.type === 'rack');
        oldRacks.forEach(rack => currentScene.remove(rack));

        const rackSpacing = 4;
        let xOffset = 0;

        racks.forEach((rackData, index) => {
            const hasServers = rackData.serverCount > 0;
            const rackMesh = hasServers 
                ? createFullRack(rackData.serverCount) 
                : createEmptyRack();
            
            // Posición para la distribución horizontal
            rackMesh.position.x = xOffset;
            rackMesh.position.y = 2; // Levantar del suelo
            rackMesh.position.z = 0;
            
            xOffset += rackSpacing;

            // Datos de usuario para raycasting
            rackMesh.userData = {
                id: rackData.id,
                name: rackData.name,
                description: rackData.description,
                serverCount: rackData.serverCount,
                type: 'rack'
            };

            currentScene.add(rackMesh);
        });
        
        // Ajustar la cámara para centrar todos los racks
        if (racks.length > 0) {
            const totalWidth = xOffset - rackSpacing;
            const centerX = totalWidth / 2;
            currentScene.position.x = -centerX;
        }

    }, [racks, createEmptyRack, createFullRack]);

    // Ejecutar renderRacks después de la inicialización
    useEffect(() => {
        if (scene) {
            renderRacks(scene);
        }
    }, [scene, renderRacks]);
    
    
    // Bucle de animación
    useEffect(() => {
        let animationFrameId;

        const animate = () => {
            if (renderer && scene && camera) {
                // Rotación de ejemplo para hacer el 3D más evidente
                // scene.rotation.y += 0.001; 
                renderer.render(scene, camera);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        if (renderer) {
            animate();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [renderer, scene, camera]);


    // --- INTERACTIVITY (Hover & Click) ---

    // Obtener coordenadas normalizadas del ratón
    const getNormalizedCoordinates = (clientX, clientY) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: ( (clientX - rect.left) / rect.width ) * 2 - 1,
            y: - ( (clientY - rect.top) / rect.height ) * 2 + 1,
        };
    };

    // Manejador de movimiento del ratón (Hover)
    const handleMouseMove = (event) => {
        if (!camera || !scene) return;

        const normalizedMouse = getNormalizedCoordinates(event.clientX, event.clientY);
        mouse.current.x = normalizedMouse.x;
        mouse.current.y = normalizedMouse.y;
        
        raycaster.setFromCamera(mouse.current, camera);
        const intersects = raycaster.intersectObjects(scene.children.filter(c => c.userData.type === 'rack'), true);
        
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            const rackData = intersectedObject.userData;
            
            // Necesitamos subir en la jerarquía si el objeto intersectado no es el grupo principal
            let parentRack = intersectedObject;
            while(parentRack && parentRack.userData.type !== 'rack') {
                parentRack = parentRack.parent;
            }

            if (parentRack && parentRack.userData.id !== (hoveredRack?.id || null)) {
                setHoveredRack(parentRack.userData);
                setHoverPosition({ x: event.clientX, y: event.clientY });
            }
        } else {
            setHoveredRack(null);
        }
    };

    // Manejador de clic (Selección/Menú de Acciones)
    const handleClick = (event) => {
        if (!camera || !scene) return;

        const normalizedMouse = getNormalizedCoordinates(event.clientX, event.clientY);
        raycaster.setFromCamera(normalizedMouse, camera);
        const intersects = raycaster.intersectObjects(scene.children.filter(c => c.userData.type === 'rack'), true);

        setSelectedRack(null); // Cerrar menú anterior

        if (intersects.length > 0) {
            let parentRack = intersects[0].object;
            while(parentRack && parentRack.userData.type !== 'rack') {
                parentRack = parentRack.parent;
            }

            if (parentRack) {
                setSelectedRack(parentRack.userData);
                // Establece la posición del menú cerca del clic
                setMenuPosition({ x: event.clientX, y: event.clientY });
            }
        }
    };
    
    // Manejador de acciones del menú
    const handleMenuAction = (action, id) => {
        setSelectedRack(null);
        onRackAction(action, id); // Llama a la función que gestiona las acciones del padre
    };


    // --- JSX RENDER ---
    
    return (
        <div 
            ref={containerRef} 
            className={styles.simulatorContainer}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <canvas ref={canvasRef} />
            
            {/* Información al hacer HOVER (Tooltip) */}
            {hoveredRack && (
                <div 
                    className={styles.rackTooltip} 
                    style={{ 
                        left: hoverPosition.x + 10, // Offset del cursor
                        top: hoverPosition.y + 10,
                    }}
                >
                    <p className={styles.tooltipName}>{hoveredRack.name}</p>
                    <p className={styles.tooltipDetail}>
                        <ServerIcon size={14} style={{ marginRight: '5px' }} />
                        Servidores: <strong>{hoveredRack.serverCount}</strong>
                    </p>
                    <p className={styles.tooltipDetail}>
                        <Zap size={14} style={{ marginRight: '5px' }} />
                        Uso Estimado: <strong>{(hoveredRack.serverCount * 200).toFixed(0)}W</strong>
                    </p>
                    <p className={styles.tooltipClick}>Haz clic para acciones...</p>
                </div>
            )}
            
            {/* Menú de Acciones al hacer CLICK */}
            {selectedRack && (
                <RackActionMenu
                    rack={selectedRack}
                    position={menuPosition}
                    onAction={handleMenuAction}
                    onClose={() => setSelectedRack(null)}
                />
            )}
        </div>
    );
};

export default RackSimulator;
