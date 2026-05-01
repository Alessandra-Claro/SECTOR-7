import * as THREE from 'three';
import { PlayerController, FirstPersonCameraController } from './rosie/controls/rosieControls.js';
import { CONFIG } from './config.js';

export class Player {
    constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0, 10);
        this.scene.add(this.mesh);

        this.controller = new PlayerController(this.mesh, { moveSpeed: CONFIG.PLAYER.MOVE_SPEED, groundLevel: 0 });
        this.cameraController = new FirstPersonCameraController(this.camera, this.mesh, domElement, { eyeHeight: CONFIG.PLAYER.EYE_HEIGHT });
        
        this.inventory = { hasKeycard: false };
        this.isSprinting = false;
        this.isSneaking = false;
        this.setupInput();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ShiftLeft') this.isSprinting = true;
            if (e.code === 'KeyC' || e.code === 'ControlLeft') this.isSneaking = true;
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ShiftLeft') this.isSprinting = false;
            if (e.code === 'KeyC' || e.code === 'ControlLeft') this.isSneaking = false;
        });
    }

    update(deltaTime) {
        if (this.isSprinting) this.controller.moveSpeed = CONFIG.PLAYER.RUN_SPEED;
        else if (this.isSneaking) this.controller.moveSpeed = CONFIG.PLAYER.SNEAK_SPEED;
        else this.controller.moveSpeed = CONFIG.PLAYER.MOVE_SPEED;

        const rotation = this.cameraController.update();
        this.controller.update(deltaTime, rotation);
    }

    get noiseLevel() {
        if (this.isSprinting) return 2.0;
        if (this.isSneaking) return 0.2;
        return 1.0;
    }
}
