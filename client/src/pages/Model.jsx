import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from "../Component/NavigationContext";

// Màu viền chung cho tất cả phần tử được highlight
const OUTLINE_COLOR = 0xfdfd00;

const HIGHLIGHT_CONFIG = {
  Room1:    { url: '/home/inv1', name: 'Inv01' },
  T1:    { url: '/home/inv2', name: 'Inv02' },
  D2: { url: '/home/inv3', name: 'Inv03' },
  Room2:    { url: '/home/inv4', name: 'Inv04' },
};

// =====================================================
// Model
// =====================================================
function Model({ onMeshesReady }) {

  //gltf-transform optimize public/models/devices.glb public/models/devices-optimized1.glb --compress draco --texture-compress webp --flatten false --join false --prune false --instance false
  const { scene } = useGLTF('/models/devices-optimized1.glb', true);
  const navigate = useNavigate();
  const { startNavigation } = useNavigation();

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const highlightMeshes = useMemo(() => {
    const meshes = [];
    clonedScene.traverse((child) => {
      if (HIGHLIGHT_CONFIG[child.name]) {
        child.traverse((obj) => {
          if (obj.isMesh) meshes.push(obj);
        });
      }
    });
    return meshes;
  }, [clonedScene]);

  useEffect(() => {
    onMeshesReady(highlightMeshes);
  }, [highlightMeshes, onMeshesReady]);


  // CHECK MESH + PARENT

// useEffect(() => {
//   console.log('=== TOÀN BỘ CẤU TRÚC SCENE ===');

//   const printTree = (object, depth = 0) => {
//     const indent = '  '.repeat(depth);
//     const name = object.name || '(không có tên)';
//     console.log(`${indent}${object.type}: ${name}`);

//     object.children.forEach((child) => printTree(child, depth + 1));
//   };

//   printTree(clonedScene);
// }, [clonedScene]);

  // MATERIAL
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!child.isMesh) return;

      child.material = child.material.clone();
      child.material.color.set('#caf2ff');
      child.material.transparent = true;
      child.material.opacity = 0.35;

      if ('emissive' in child.material) {
        child.material.emissive.set('#caf2ff');
        child.material.emissiveIntensity = 0;
      }
      if ('roughness' in child.material) child.material.roughness = 0.2;
      if ('metalness' in child.material) child.material.metalness = 0.1;

      child.material.needsUpdate = true;
    });
  }, [clonedScene]);

  const findHighlightObject = (object) => {
    let obj = object;
    while (obj) {
      if (HIGHLIGHT_CONFIG[obj.name]) return obj;
      obj = obj.parent;
    }
    return null;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const obj = findHighlightObject(e.object);
    if (!obj) return;
    startNavigation(navigate, HIGHLIGHT_CONFIG[obj.name].url);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    const obj = findHighlightObject(e.object);
    if (obj) {
      document.body.style.cursor = 'pointer';
      document.body.title = HIGHLIGHT_CONFIG[obj.name].name;
    }
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
  };

  return (
    <primitive
      object={clonedScene}
      scale={0.5}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}

    />
  );
}

// =====================================================
// Models
// =====================================================
function Models() {
  const [outlineMeshes, setOutlineMeshes] = useState([]);

  return (
    <div className="page">
      <div className="item header">
        <h3 style={{position: "relative", top: '-20px'}}>3D Web</h3>
      </div>

      <div className="center" style={{ width: "100%" }}>
        <div
          className="full-side"
          style={{
            display: "block",
            justifyContent: "none",
            height: "calc(100vh - 120px)",
            marginBottom: "5px",
            marginTop: "5px"
          }}
        >
          <Canvas 
            camera={{ position: [10, 15, 15], fov: 40 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <Model onMeshesReady={setOutlineMeshes} />

            <OrbitControls   enableDamping={true}
                  dampingFactor={0.2}  /> 
            <Environment preset="city" />

            {outlineMeshes.length > 0 && (
              <EffectComposer autoClear={false} multisampling={8}>
                <Outline
                  selection={outlineMeshes}
                  edgeStrength={8}
                  visibleEdgeColor={OUTLINE_COLOR}
                  hiddenEdgeColor={OUTLINE_COLOR}
                  blur
                  xRay
                />
              </EffectComposer>
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload('/models/devices-optimized1.glb', true);
export default Models;