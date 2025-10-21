import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Preload } from '@react-three/drei';
import PropTypes from 'prop-types';
import styles from './ModelViewer.module.css';

// =========================================================================
// Mapeo de configuraciones de cámara y controles según la variante
// =========================================================================
const VARIANT_CONFIGS = {
  // 1. Variante 'default': Interactivo con rotación automática suave (vista en ángulo)
  default: {
    cameraPosition: [0, 2.5, 5],
    cameraFov: 6,
    controlsEnabled: true,
    autoRotate: 0.002, // Rotación automática activa
  },
  // 2. Variante 'static': Vista frontal estática (perfecto para tarjetas)
  static: {
    cameraPosition: [0, 5, 30], // Posición centrada y ligeramente elevada para vista frontal
    cameraFov: 2,
    controlsEnabled: false,
    autoRotate: 0, // Rotación desactivada
  },
  // 3. Variante 'top': Vista desde arriba (perfecto para diagramas de planta)
  top: {
    cameraPosition: [0, 10, 0], // Posición elevada mirando hacia abajo
    cameraFov: 50, // FOV mayor para capturar un área más amplia
    controlsEnabled: false,
    autoRotate: 0, // Rotación desactivada
  },
};

// Componente para cargar y renderizar el modelo 3D
const GltfModel = React.memo(({ modelPath, autoRotateSpeed }) => {
  const finalModelPath = modelPath || '/assets/models/test.glb';

  // useGLTF maneja la carga del modelo
  const { scene } = useGLTF(finalModelPath);
  // Clonamos la escena para evitar que las mutaciones afecten a otros usos del mismo modelo
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const mesh = useRef();

  // Rotación automática si autoRotateSpeed es > 0
  useFrame(() => {
    if (mesh.current && autoRotateSpeed > 0) {
      mesh.current.rotation.y += autoRotateSpeed;
    }
  });

  // Ajustes de transformación base
  clonedScene.scale.set(1.0, 1.0, 1.0);
  clonedScene.position.set(0, 0, 0);

  return (
    <primitive object={clonedScene} ref={mesh} />
  );
});

GltfModel.propTypes = {
  modelPath: PropTypes.string.isRequired,
  autoRotateSpeed: PropTypes.number.isRequired,
};


const LoadingFallback = () => (
  // Renderiza un cubo gris como marcador de posición mientras carga
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#4a4c41" /> {/* Color gris oscuro del tema */}
  </mesh>
);

// Componente principal del visor 3D
const ModelViewer = ({ modelPath, variant }) => {

  // Obtenemos la configuración basada en la variante
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.default;

  const {
    cameraPosition,
    cameraFov,
    controlsEnabled,
    autoRotate
  } = config;

  return (
    <div className={styles.viewerContainer}>
      {/* Canvas de Three.js */}
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov}}
        // Configuraciones específicas para la variante 'top'
        style={variant === 'top' ? { transform: 'rotateX(-90deg)' } : {}}
      >

        <Suspense fallback={<LoadingFallback />}>
          <GltfModel
            modelPath={modelPath}
            autoRotateSpeed={autoRotate} // Pasamos la velocidad de rotación
          />
        </Suspense>

        {/* Controles de órbita (solo si están habilitados) */}
        {controlsEnabled && (
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            panSpeed={0.5}
            rotateSpeed={0.3}
            zoomSpeed={0.5}
          />
        )}

        <Preload all />
      </Canvas>
    </div>
  );
};

ModelViewer.propTypes = {
  modelPath: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'static', 'top']), // <-- Nuevo PropTypes
};

ModelViewer.defaultProps = {
  variant: 'default',
};

export default ModelViewer;
