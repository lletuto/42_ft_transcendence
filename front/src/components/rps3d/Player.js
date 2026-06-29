import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const DEFAULT_ANIMATION_MAP = {
    idle: "Waiting",
    rock: "Pierre",
    paper: "Feuille",
    scissors: "Ciseaux",
    well: "Puit",
    loser: "DramaLoser",
    winner: "DancingQueen",
    wave: "Wave",
};

export default class Player {
    constructor({
        scene,
        template,
        animations,
        position,
        rotationY = 0,
        scale = 2.3,
        animationMap = DEFAULT_ANIMATION_MAP,
        onChoiceFinished = null,
    }) {
        this.object = SkeletonUtils.clone(template);
        this.object.scale.set(scale, scale, scale);
        this.object.position.set(position.x, position.y, position.z);
        this.object.rotation.y = rotationY;
        this.initialRotationY = rotationY;
        this.object.traverse((obj) => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        this.scene = scene;
        this.scene.add(this.object);
        
        this.mixer = new THREE.AnimationMixer(this.object);
        this.animationMap = animationMap;
        this.onChoiceFinished = onChoiceFinished;
        
        this.clipByName = new Map(animations.map((clip) => [clip.name, clip]));
        this.currentAction = null;
        this.currentChoice = null;

        this.handleFinished = this.handleFinished.bind(this);
        this.mixer.addEventListener("finished", this.handleFinished);
        
        // play idle animation by default
        this.play("idle", true);
    }

    getClip(choice) {
        const clipName = this.animationMap[choice] ?? this.animationMap.idle;
        return this.clipByName.get(clipName);
    }

    play(choice, immediate = false) {
        if (!choice) return;
        
        const clip = this.getClip(choice);
        if (!clip) return;

        const nextAction = this.mixer.clipAction(clip);
        if (this.currentAction === nextAction) return;

        // DYNAMIC ROTATION GESTION (Face caméra for DancingQueen)
        if (choice === "winner") {
            if (immediate) {
                this.object.rotation.y = 0;
            } else {
                // we create a target rotation to smoothly rotate the character to face the camera
                this.targetRotationY = 0;
            }
        } else if (choice === "idle" && this.currentChoice === "winner") {
            // When it returns to idle AFTER winning, we reset it to its initial combat position
            // (The original value passed to the constructor, which we retrieve dynamically)
            this.targetRotationY = this.initialRotationY ?? this.object.rotation.y;
        }

        // Smooth transition between the old and new animations
        if (this.currentAction) {
            this.currentAction.fadeOut(immediate ? 0 : 0.1);
        }

        nextAction.reset();
        
        // Configuration based on animation type
        if (choice === "idle") {
            nextAction.setLoop(THREE.LoopRepeat, Infinity);
            nextAction.clampWhenFinished = false;
            nextAction.timeScale = 1.0; 
        } else {
            nextAction.setLoop(THREE.LoopOnce, 1);
            nextAction.clampWhenFinished = true;
            nextAction.timeScale = 1; 
        }

        nextAction.enabled = true;
        nextAction.fadeIn(immediate ? 0 : 0.1);
        nextAction.play();

        this.currentAction = nextAction;
        this.currentChoice = choice;
    }

    handleFinished(event) {
        // If the current attack/victory/defeat has just ended
        if (event.action === this.currentAction && this.currentChoice !== "idle") {
            // We notify the app (Next.js) that the anime has ended
            this.onChoiceFinished?.(this.currentChoice);
            // The character automatically returns to a guard stance
            this.play("idle");
        }
    }

    update(delta) {
        this.mixer.update(delta);

        // If a rotation target is set, the character is gently rotated toward it
        if (this.targetRotationY !== undefined) {
            // Mathematical Smoothing (LERP) for Smooth Rotation
            this.object.rotation.y = THREE.MathUtils.lerp(
                this.object.rotation.y,
                this.targetRotationY,
                10 * delta // Rotation speed (the higher the number, the faster it goes)
            );

            // We stop calculating if we're very close to the target
            if (Math.abs(this.object.rotation.y - this.targetRotationY) < 0.001) {
                this.object.rotation.y = this.targetRotationY;
                this.targetRotationY = undefined;
            }
        }
    }

    dispose() {
        // Unregister the event listener
        this.mixer.removeEventListener("finished", this.handleFinished);
        this.mixer.stopAllAction();
        
        // Complete cache cleanup for this cloned object
        this.mixer.uncacheRoot(this.object);

        // Clearing the GPU memory of cloned sub-elements (geometries and materials)
        this.object.traverse((obj) => {
            if (obj.isMesh) {
                if (obj.geometry) obj.geometry.dispose();
                
                if (obj.material) {
                    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                    materials.forEach((mat) => {
                        // Clearing the textures of the clone
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

        // Exit from the stage
        this.scene.remove(this.object);
        
        // Clear references to help the Garbage Collector
        this.clipByName.clear();
        this.currentAction = null;
    }
}