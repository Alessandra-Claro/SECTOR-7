import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Enemy {
    constructor(scene, player, type, startPos) {
        this.scene = scene;
        this.player = player;
        this.type = type;
        this.config = CONFIG.ENEMY[type];
        this.mesh = this.createVisuals();
        this.mesh.position.copy(startPos);
        this.scene.add(this.mesh);
        this.state = 'PATROL';
        this.targetPoint = startPos.clone();
        this.patrolPoints = [startPos.clone(), new THREE.Vector3(startPos.x + 10, 0, startPos.z)];
        this.patrolIndex = 0;
        this.speed = this.config.SPEED;
        this.waitTime = 0;
    }

    createVisuals() {
        const texture = new THREE.TextureLoader().load(this.config.SPRITE);
        const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, roughness: 1, metalness: 0, color: 0x888888 });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(this.config.SCALE, this.config.SCALE), material);
        const group = new THREE.Group();
        group.add(plane);
        plane.position.y = this.config.OFFSET_Y;
        return group;
    }

    update(deltaTime) {
        const distToPlayer = this.mesh.position.distanceTo(this.player.mesh.position);
        this.mesh.lookAt(this.player.mesh.position.x, this.mesh.position.y, this.player.mesh.position.z);
        
        const detectionThreshold = this.config.DETECTION_RANGE * this.player.noiseLevel;
        if (distToPlayer < detectionThreshold) this.state = 'CHASE';
        else if (this.state === 'CHASE' && distToPlayer > detectionThreshold * 1.8) this.state = 'PATROL';

        if (this.state === 'CHASE') {
            this.moveTowards(this.player.mesh.position, deltaTime, this.speed * 1.5);
            if (distToPlayer < this.config.ATTACK_RANGE) window.dispatchEvent(new CustomEvent('playerCaught', { detail: { monster: this.type } }));
        } else { this.updatePatrol(deltaTime); }
        this.mesh.children[0].position.y = this.config.OFFSET_Y + Math.sin(Date.now() * 0.005) * 0.05;
    }

    updatePatrol(deltaTime) {
        if (this.waitTime > 0) { this.waitTime -= deltaTime; return; }
        if (this.mesh.position.distanceTo(this.targetPoint) < 1.0) {
            this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
            this.targetPoint = this.patrolPoints[this.patrolIndex];
            this.waitTime = 1.0 + Math.random() * 2.0;
        } else { this.moveTowards(this.targetPoint, deltaTime, this.speed); }
    }

    moveTowards(target, deltaTime, speed) {
        const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
        dir.y = 0;
        if (dir.lengthSq() > 0) this.mesh.position.addScaledVector(dir.normalize(), speed * deltaTime);
    }
}
