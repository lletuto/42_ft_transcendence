"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Player from "./Player";

export default function GameScene({
  className = "",
  style,
  playerChoices = { left: "idle", right: "idle" },
  animationRequestId = 0,
  onPlayerFinished,
  gameEnded = false,
}) {
  const mountRef = useRef(null);
  const playersRef = useRef({ left: null, right: null });
  const cameraRef = useRef(null);
  const onPlayerFinishedRef = useRef(onPlayerFinished);

  const getPlayers = () =>
    Object.values(playersRef.current).filter((player) => player);

  useEffect(() => {
    onPlayerFinishedRef.current = onPlayerFinished;
  }, [onPlayerFinished]);

  useEffect(() => {
    if (cameraRef.current) {
      const isEnd = 
        playerChoices.left === "winner" || 
        playerChoices.left === "loser" || 
        playerChoices.right === "winner" || 
        playerChoices.right === "loser" ||
        gameEnded;
        
      cameraRef.current.userData.shouldMove = isEnd;
    }
  }, [playerChoices, gameEnded]);

  useEffect(() => {
    const mount = mountRef.current; 
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(-4, 10, 9);
    camera.lookAt(2, 4, -1);
    
    camera.userData.shouldMove = false; 
    cameraRef.current = camera;

    const endPosition = new THREE.Vector3(0, 5, 17);
    const endLookAt = new THREE.Vector3(0, 6, 0);
    const currentLookAt = new THREE.Vector3(2, 1, -1);

	//webGLRenderer is a renderer that uses WebGL to render 3D graphics in the browser. It provides high-performance rendering capabilities and supports advanced features like shadows, reflections, and post-processing effects. In this code, it is configured with antialiasing for smoother edges and alpha transparency for rendering scenes with transparent backgrounds.
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(1, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	//PMREM Generator for environment mapping is used to create a pre-filtered environment map for realistic reflections and lighting in the scene. It helps simulate how light interacts with surfaces, enhancing the visual quality of materials, especially metallic and reflective ones.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRT = pmremGenerator.fromScene(new THREE.Scene()).texture;
    scene.environment = envRT; 
    pmremGenerator.dispose();

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

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

	// ── LIGHTING AMBIANT ET DIRECT (Léger & Stable) ──
	const sun = new THREE.DirectionalLight(0xff8844, 0.4);
	sun.position.set(0, 4, 1);
	scene.add(sun);

	const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
	scene.add(ambientLight);

	const fillLight = new THREE.DirectionalLight(0xff8855, 1);
	fillLight.position.set(8, 3, 6);
	const fillTarget = new THREE.Object3D(); 
	fillTarget.position.set(12, 4, 5);
	scene.add(fillTarget);
	fillLight.target = fillTarget;
	fillLight.castShadow = false; 
	scene.add(fillLight);

	const rimLight = new THREE.DirectionalLight(0xff8855, 0.5);
	rimLight.position.set(4, 3, 4);
	scene.add(rimLight);

	// ── ORANGE SPOT  ──
	const orangeDiscoSpot = new THREE.SpotLight(0xfe5000, 12, 20, Math.PI / 6, 0.5, 0.9);
	orangeDiscoSpot.position.set(0, 9, 2); 
	orangeDiscoSpot.castShadow = true;
	orangeDiscoSpot.shadow.mapSize.width = 512; 
	orangeDiscoSpot.shadow.mapSize.height = 512;
	orangeDiscoSpot.shadow.bias = -0.002;

	const pinkTarget = new THREE.Object3D();
	pinkTarget.position.set(4, 1.5, 1);
	scene.add(pinkTarget);
	orangeDiscoSpot.target = pinkTarget;
	scene.add(orangeDiscoSpot);

	// ── ROSE SPOT ──
	const pinkDiscoSpot = new THREE.SpotLight(0xff44aa, 12, 20, Math.PI / 6, 0.5, 0.9);
	pinkDiscoSpot.position.set(0, 9, 2); 
	pinkDiscoSpot.castShadow = true;
	pinkDiscoSpot.shadow.mapSize.width = 512;
	pinkDiscoSpot.shadow.mapSize.height = 512;
	pinkDiscoSpot.shadow.bias = -0.002; 

	const orangeTarget = new THREE.Object3D();
	orangeTarget.position.set(-3, 1.5, 1);
	scene.add(orangeTarget);               // Add the target to the scene before assigning it to the spotlight
	pinkDiscoSpot.target = orangeTarget;
	scene.add(pinkDiscoSpot);

    // LOADERS
    const loader = new GLTFLoader();
    const disposed = { current: false };
    const clock = new THREE.Clock();
    const sceneMixers = [];

    // SCENE LOAD
    loader.load( 
      "/models/SceneWithoutspot.glb", (gltf) => {
        if (disposed.current) return;
        gltf.scene.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            if (obj.name === "DiscoBall" || obj.name.includes("Disco")) {
              if (obj.material) {
                obj.material.roughness = 0.05; 
                obj.material.metalness = 1; 
                if (obj.material.map) {
                  obj.material.map.colorSpace = THREE.SRGBColorSpace;
                  obj.material.map.needsUpdate = true;
                }
                obj.material.needsUpdate = true;
              }
            }
          }
        });
        scene.add(gltf.scene);

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          sceneMixers.push(mixer);
        }
      },
      undefined,
      (error) => console.error("SceneWithoutspot.glb error", error),
    );

    // BOBBY LOAD
    loader.load(
      "/models/SimpleBobby.glb", (gltf) => {
        if (disposed.current) return;
        const leftPlayer = new Player({
          scene,
          template: gltf.scene,
          animations: gltf.animations,
          position: { x: -4, y: 0.7, z: 1 },
          rotationY: 8,
          onChoiceFinished: (choice) => onPlayerFinishedRef.current?.("left", choice),
        });

        const rightPlayer = new Player({
          scene,
          template: gltf.scene,
          animations: gltf.animations,
          position: { x: 4, y: 0.7, z: 1 },
          rotationY: -8,
          onChoiceFinished: (choice) => onPlayerFinishedRef.current?.("right", choice),
        });

        playersRef.current.left = leftPlayer;
        playersRef.current.right = rightPlayer;

        leftPlayer.play(playerChoices.left);
        rightPlayer.play(playerChoices.right);
      },
      undefined,
      (error) => console.error("SimpleBobby.glb error", error),
    );

    // ANIMATION LOOP
    let frameId = 0;

    const animate = () => {
      if (disposed.current) return; // Sécurité stop immédiat
      
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      sceneMixers.forEach((mixer) => mixer.update(delta));
      getPlayers().forEach((player) => player.update(delta));

      if (camera.userData.shouldMove) {
        camera.position.lerp(endPosition, 0.04);
        currentLookAt.lerp(endLookAt, 0.04);
        camera.lookAt(currentLookAt);
      }

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("resize", setSize);


	//dispose is a function that cleans up all resources used by the scene, including geometries, materials, textures, and the renderer itself. It also stops any ongoing animations and removes the renderer's DOM element from the document.	
    return () => {
      disposed.current = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", setSize);
      
      if (mount) {
        resizeObserver.unobserve(mount);
      }
      resizeObserver.disconnect();
      
      getPlayers().forEach((player) => player.dispose());
      sceneMixers.forEach((mixer) => mixer.stopAllAction());

      playersRef.current.left = null;
      playersRef.current.right = null;
      cameraRef.current = null;
      
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
      if (envRT) envRT.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  //COMPONENT ACTION ANIMATION INTERCEPTOR
  useEffect(() => {
    playersRef.current.left?.play(playerChoices.left);
    playersRef.current.right?.play(playerChoices.right);
  }, [animationRequestId, playerChoices.left, playerChoices.right]);

  return (
    <div
      className={className}
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "320px",
        ...style,
      }}
    />
  );
}