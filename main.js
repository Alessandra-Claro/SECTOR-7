import * as THREE from 'three';
import { Environment } from './Environment.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { CONFIG } from './config.js';
import { AudioManager } from './AudioManager.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.audio = new AudioManager();
        this.environment = new Environment(this.scene);
        this.player = new Player(this.scene, this.camera, this.renderer.domElement);
        this.enemy = new Enemy(this.scene, this.player);
        
        this.keycard = this.createKeycard();
        
        this.isPaused = true;
        this.clock = new THREE.Clock();

        this.setupUI();
        this.setupEvents();
        
        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    createKeycard() {
        const group = new THREE.Group();
        const geo = new THREE.BoxGeometry(0.2, 0.02, 0.3);
        const mat = new THREE.MeshStandardMaterial({ color: 0x0088ff, emissive: 0x0044ff });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        
        const light = new THREE.PointLight(0x0088ff, 1, 3);
        group.add(light);
        
        group.position.set(15, 0.5, 20);
        this.scene.add(group);
        return group;
    }

    setupUI() {
        const startBtn = document.getElementById('start-btn');
        const overlay = document.getElementById('overlay');

        startBtn.addEventListener('click', async () => {
            await this.audio.init();
            overlay.style.display = 'none';
            this.isPaused = false;
            this.player.cameraController.setCameraMode('first-person');
        });
    }

    setupEvents() {
        window.addEventListener('playerCaught', () => {
            this.gameOver("CAUGHT BY LURKER");
        });
    }

    gameOver(message) {
        this.isPaused = true;
        this.audio.setHeartbeatRate(60);
        const overlay = document.getElementById('overlay');
        overlay.style.display = 'flex';
        overlay.querySelector('h1').innerText = "TERMINATED";
        overlay.querySelector('p').innerText = message + ". The facility remains locked.";
        overlay.querySelector('button').innerText = "RETRY";
        document.exitPointerLock();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        if (!this.isPaused) {
            this.player.update(deltaTime);
            this.enemy.update(deltaTime);
            this.environment.update(this.clock.elapsedTime);
            
            const distToEnemy = this.player.mesh.position.distanceTo(this.enemy.mesh.position);
            const heartbeat = THREE.MathUtils.lerp(180, 60, Math.min(distToEnemy / 20, 1));
            this.audio.setHeartbeatRate(heartbeat);

            if (!this.player.inventory.hasKeycard) {
                const dist = this.player.mesh.position.distanceTo(this.keycard.position);
                if (dist < 1.5) {
                    this.player.inventory.hasKeycard = true;
                    this.scene.remove(this.keycard);
                    document.getElementById('game-status').innerText = "Keycard Acquired | Proceed to Lift";
                    document.getElementById('game-status').style.color = "#00ff00";
                }
                this.keycard.rotation.y += deltaTime;
            } else {
                const startPoint = new THREE.Vector3(0, 0, 10);
                if (this.player.mesh.position.distanceTo(startPoint) < 2) {
                    this.win();
                }
            }

            if (this.enemy.state === 'CHASE') {
                document.getElementById('flash-red').style.display = 'block';
                document.getElementById('game-status').innerText = "DETECTION ALERT | HOSTILE PURSUIT";
            } else {
                document.getElementById('flash-red').style.display = 'none';
                if (this.player.inventory.hasKeycard) {
                    document.getElementById('game-status').innerText = "Keycard Acquired | Proceed to Lift";
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    win() {
        this.isPaused = true;
        this.audio.setHeartbeatRate(60);
        const overlay = document.getElementById('overlay');
        overlay.style.display = 'flex';
        overlay.querySelector('h1').innerText = "ESCAPED";
        overlay.querySelector('h1').style.color = "#00ff00";
        overlay.querySelector('p').innerText = "You have bypassed Sector 7. The elevator is ascending.";
        overlay.querySelector('button').innerText = "PLAY AGAIN";
        document.exitPointerLock();
    }
}

new Game();
