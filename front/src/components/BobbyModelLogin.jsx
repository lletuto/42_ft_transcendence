"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

export default function BobbyModel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // initialisation scne and camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.3, 15);

    // configuration renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(1, 1); 
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    // responsive resizing
    const setSize = () => {
      if (!mountRef.current) return;
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    setSize();
    const resizeObserver = new ResizeObserver(() => setSize());
    resizeObserver.observe(mount);

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(2, 4, 2);
    scene.add(directionalLight);

    // loading the GLTF model
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    const disposed = { current: false };
    const clock = new THREE.Clock();
    let mixer = null;
    let bobbyModel = null;

    loader.load(
      "/models/SimpleBobby.glb",
      (gltf) => {
        if (disposed.current) return;

        bobbyModel = SkeletonUtils.clone(gltf.scene);

        // applies scaling and positioning based on window width
        const width = window.innerWidth;
        const scale = width / 900;
        bobbyModel.scale.set(scale, scale, scale);
        bobbyModel.position.set(0, -1.2, 0);

        scene.add(bobbyModel);

        // Configuration of Animation Mixer
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(bobbyModel);
          const waveClip = gltf.animations.find((clip) => clip.name === "Wave");
          
          if (waveClip) {
            const waveAction = mixer.clipAction(waveClip);
            waveAction.setLoop(THREE.LoopPingPong, Infinity);
            waveAction.play();
          }
        }
      },
      undefined,
      (error) => {
        // Handle loading errors gracefully
        if (!disposed.current) {
          console.error("SimpleBobby.glb error", error);
        }
      }
    );

    // animation loop
    let frameId = 0;
    const animate = () => {
      if (disposed.current) return;
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);

      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", setSize);

    // cleanup function to dispose of resources and remove event listeners
    return () => {
      disposed.current = true;
      window.removeEventListener("resize", setSize);
      
      resizeObserver.unobserve(mount);
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);

      if (mixer && bobbyModel) {
        mixer.stopAllAction();
        mixer.uncacheRoot(bobbyModel);
      }

      scene.traverse((obj) => {
        if (obj.isMesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
            materials.forEach((mat) => {
              Object.keys(mat).forEach((key) => {
                if (mat[key] && typeof mat[key].dispose === "function") {
                  mat[key].dispose();
                }
              });
              mat.dispose();
            });
          }
        }
      });

      renderer.dispose();
      
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "700px",
        background: "transparent",
      }}
    />
  );
}