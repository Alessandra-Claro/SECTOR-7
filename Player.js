import * as THREE from 'three';
import { PlayerController, FirstPersonCameraController } from './rosie/controls/rosieControls.js';
import { CONFIG } from './config.js';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);

        this.controller = new PlayerController(this.mesh, { moveSpeed: CONFIG.PLAYER.MOVE_SPEED, groundLevel: 0 });
        this.cameraController = new FirstPersonCameraController(this.camera, this.mesh, domElement, { eyeHeight: CONFIG.PLAYER.EYE_HEIGHT });
        
        this.flashlight = new THREE.SpotLight(0xffffff, 20, 20, Math.PI / 6, 0.5, 1);
        this.flashlight.position.set(0, 0, 0);
        this.flashlight.target.position.set(0, 0, -1);
        this.camera.add(this.flashlight);
        this.camera.add(this.flashlight.target);
        
        this.cameraController.setCameraMode = (mode) => {
            if (mode === 'first-person') { this.cameraController.enable(); this.flashlight.visible = true; }
            else { this.cameraController.disable(); this.flashlight.visible = false; }
        };

        this.inventory = { hasKeycard: false };
        this.isSprinting = false;
        this.isSneaking = false;
        this.flickerTimer = 0;
        this.setupInput();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ShiftLeft') this.isSprinting = true;
            if (e.code === 'KeyC' || e.code === 'ControlLeft') this.isSneaking = true;
            if (e.code === 'KeyE') window.dispatchEvent(new CustomEvent('playerInteract'));
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ShiftLeft') this.isSprinting = false;
            if (e.code === 'KeyC' || e.code === 'ControlLeft') this.isSneaking = false;
        });
    }

    update(deltaTime) {
        if (this.flickerTimer > 0) {
            this.flickerTimer -= deltaTime;
            this.flashlight.intensity = Math.random() > 0.5 ? 20 : 2;
        } else { this.flashlight.intensity = 20; }

        if (this.isSprinting) this.controller.moveSpeed = CONFIG.PLAYER.RUN_SPEED;
        else if (this.isSneaking) this.controller.moveSpeed = CONFIG.PLAYER.SNEAK_SPEED;
        else this.controller.moveSpeed = CONFIG.PLAYER.MOVE_SPEED;

        const rotation = this.cameraController.update();
        this.controller.update(deltaTime, rotation);
        this.keepInBounds();
    }

    triggerFlicker(duration) { this.flickerTimer = duration; }
    keepInBounds() {
        this.mesh.position.x = Math.max(-25, Math.min(25, this.mesh.position.x));
        this.mesh.position.z = Math.max(-25, Math.min(25, this.mesh.position.z));
    }
    get noiseLevel() { return this.isSprinting ? 2.0 : (this.isSneaking ? 0.2 : 1.0); }
}
