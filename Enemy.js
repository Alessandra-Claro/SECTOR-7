import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Enemy {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.mesh = this.createMesh();
        this.mesh.position.set(0, 0, -15);
        this.scene.add(this.mesh);
        this.state = 'PATROL';
        this.targetPoint = new THREE.Vector3(0, 0, -15);
        this.patrolPoints = [new THREE.Vector3(0, 0, -15), new THREE.Vector3(0, 0, 5)];
        this.patrolIndex = 0;
        this.speed = CONFIG.ENEMY.LURKER_SPEED;
    }

    createMesh() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
        body.position.y = 0.8;
        group.add(body);
        return group;
    }

    update(deltaTime) {
        const distToPlayer = this.mesh.position.distanceTo(this.player.mesh.position);
        if (distToPlayer < CONFIG.ENEMY.DETECTION_RANGE * this.player.noiseLevel) this.state = 'CHASE';

        if (this.state === 'CHASE') {
            this.moveTowards(this.player.mesh.position, deltaTime, this.speed * 1.5);
            if (distToPlayer < CONFIG.ENEMY.ATTACK_RANGE) window.dispatchEvent(new CustomEvent('playerCaught'));
        } else {
            this.updatePatrol(deltaTime);
        }
        this.mesh.lookAt(this.player.mesh.position);
    }

    moveTowards(target, deltaTime, speed) {
        const dir = new THREE.Vector3().subVectors(target, this.mesh.position).normalize();
        this.mesh.position.addScaledVector(dir, speed * deltaTime);
    }
}
