import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Preload } from '@react-three/drei';
import PropTypes from 'prop-types';
import styles from './ModelViewer.module.css';

// Componente para cargar y renderizar el modelo 3D
const GltfModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  const mesh = useRef();

  useFrame(() => {
    // Rotación automática para que el usuario pueda ver el modelo
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
    }
  });

  return (
    <primitive object={scene} ref={mesh} />
  );
};

// Componente principal del visor 3D
const ModelViewer = ({ modelPath }) => {
  return (
    <div className={styles.viewerContainer}>
      <Canvas camera={{ position: [0, 2.5, 5], fov: 6 }}>
        <Suspense fallback={null}>
          <GltfModel modelPath={modelPath} />
        </Suspense>

        {/* Controles de órbita para la interacción del usuario */}
        <OrbitControls enableZoom={true} enablePan={true} panSpeed={1} />

        {/* Precargar recursos para evitar flashes */}
        <Preload all />
      </Canvas>
    </div>
  );
};

ModelViewer.propTypes = {
  modelPath: PropTypes.string.isRequired,
};

export default ModelViewer;