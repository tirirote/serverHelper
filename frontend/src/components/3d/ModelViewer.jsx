import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Preload } from '@react-three/drei';
import PropTypes from 'prop-types';
import styles from './ModelViewer.module.css';

// Componente para cargar y renderizar el modelo 3D
const GltfModel = ({ modelPath }) => {
  const finalModelPath = modelPath || '/assets/models/test.glb';

  const { scene } = useGLTF(finalModelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]); 
  const mesh = useRef();

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
    }
  });

  clonedScene.scale.set(1.0, 1.0, 1.0);
  clonedScene.position.set(0, 0, 0);

  return (
    <primitive object={clonedScene} ref={mesh} />
  );
};

const LoadingFallback = () => (
    <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
    </mesh>
);

// Componente principal del visor 3D
const ModelViewer = ({ modelPath }) => {
  return (
    <div className={styles.viewerContainer}>
      <Canvas camera={{ position: [0, 2.5, 5], fov: 6 }}>

        <Suspense fallback={<LoadingFallback />}> 
          <GltfModel modelPath={modelPath} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          panSpeed={0.5}
          rotateSpeed={0.3}
          zoomSpeed={0.5} />
        <Preload all />
      </Canvas>
    </div>
  );
};

ModelViewer.propTypes = {
  modelPath: PropTypes.string.isRequired,
};

export default ModelViewer;