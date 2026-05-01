import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        const loader = new THREE.TextureLoader();
        const concreteTex = loader.load('assets/concrete_texture.webp');
        concreteTex.wrapS = concreteTex.wrapT = THREE.RepeatWrapping;
        concreteTex.repeat.set(2, 2);

        const rustedTex = loader.load('assets/rusted_metal_texture.webp');
        rustedTex.wrapS = rustedTex.wrapT = THREE.RepeatWrapping;

        this.materials = {
            concrete: new THREE.MeshStandardMaterial({ map: concreteTex, color: CONFIG.COLORS.CONCRETE, roughness: 0.9, metalness: 0.1 }),
            rustedMetal: new THREE.MeshStandardMaterial({ map: rustedTex, roughness: 0.8, metalness: 0.6 }),
            blood: new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.BLOOD, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.8 })
        };
        
        this.flickeringLights = [];
        this.doors = [];
        this.buildFacility();
    }

    buildFacility() {
        const floorGeo = new THREE.PlaneGeometry(200, 200);
        const floorMat = this.materials.concrete.clone();
        floorMat.map.repeat.set(20, 20);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        for(let i = -2; i <= 2; i++) {
            this.createCorridor(i * 10, 0, 0, 50, 'z');
            this.createCorridor(0, 0, i * 10, 50, 'x');
        }
        
        this.addDoor(0, 0, 10, 'x');
        this.addDoor(10, 0, 0, 'z');
        this.addDoor(0, 0, -10, 'x');
        this.addDoor(-10, 0, 0, 'z');

        for(let i = 0; i < 5; i++) {
            this.addCable(Math.random() * 20 - 10, 4, Math.random() * 20 - 10);
        }

        this.ambientLight = new THREE.AmbientLight(0x444444);
        this.scene.add(this.ambientLight);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.05);
    }

    addDoor(x, y, z, axis) {
        const doorGroup = new THREE.Group();
        const doorGeo = axis === 'x' ? new THREE.BoxGeometry(2, 4, 0.2) : new THREE.BoxGeometry(0.2, 4, 2);
        const door = new THREE.Mesh(doorGeo, this.materials.rustedMetal);
        door.position.y = 2;
        doorGroup.add(door);
        doorGroup.position.set(x, y, z);
        this.scene.add(doorGroup);
        this.doors.push({ mesh: doorGroup, isOpen: false, axis: axis });
    }

    interactDoors(playerPos) {
        this.doors.forEach(door => {
            const dist = door.mesh.position.distanceTo(playerPos);
            if (dist < 3) {
                door.isOpen = !door.isOpen;
                door.mesh.position.y = door.isOpen ? 5 : 0;
            }
        });
    }

    createCorridor(x, y, z, length, axis) {
        const w = CONFIG.FACILITY.CORRIDOR_WIDTH;
        const h = CONFIG.FACILITY.CORRIDOR_HEIGHT;
        const wallMat = this.materials.concrete;
        if (axis === 'z') {
            const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(length, h), wallMat);
            leftWall.position.set(x - w/2, y + h/2, z);
            leftWall.rotation.y = Math.PI / 2;
            this.scene.add(leftWall);
            const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(length, h), wallMat);
            rightWall.position.set(x + w/2, y + h/2, z);
            rightWall.rotation.y = -Math.PI / 2;
            this.scene.add(rightWall);
        } else {
            const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(length, h), wallMat);
            frontWall.position.set(x, y + h/2, z - w/2);
            this.scene.add(frontWall);
            const backWall = new THREE.Mesh(new THREE.PlaneGeometry(length, h), wallMat);
            backWall.position.set(x, y + h/2, z + w/2);
            backWall.rotation.y = Math.PI;
            this.scene.add(backWall);
        }
    }

    setAmbientIntensity(intensity) {
        this.ambientLight.intensity = intensity;
    }

    update(time) {}
    addCable(x, y, z) {
        const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(x-2, y, z), new THREE.Vector3(x-1, y-1, z), new THREE.Vector3(x+1, y-1, z), new THREE.Vector3(x+2, y, z));
        this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(10)), new THREE.LineBasicMaterial({ color: 0x000000 })));
    }
}
