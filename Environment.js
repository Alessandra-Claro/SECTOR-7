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
        this.buildFacility();
    }

    buildFacility() {
        const floorGeo = new THREE.PlaneGeometry(100, 100);
        const floorMat = this.materials.concrete.clone();
        floorMat.map.repeat.set(10, 10);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        this.createCorridor(0, 0, 0, 40, 'z');
        this.createCorridor(-20, 0, 20, 40, 'x');
        this.createCorridor(20, 0, 20, 40, 'x');
        
        this.addCable(0, 4, 5);
        this.addCable(0, 4, -5);
        this.addBloodDecal(2, 0.01, 5);
        this.addFlickeringLight(0, 3.5, 0);
        
        const ambient = new THREE.AmbientLight(0x111111);
        this.scene.add(ambient);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.1);
    }

    addFlickeringLight(x, y, z) {
        const light = new THREE.PointLight(CONFIG.COLORS.EMERGENCY_RED, 15, 12);
        light.position.set(x, y, z);
        this.scene.add(light);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: CONFIG.COLORS.EMERGENCY_RED }));
        bulb.position.set(x, y, z);
        this.scene.add(bulb);
        this.flickeringLights.push({ light, bulb, timer: Math.random() * 2 });
    }

    update(time) {
        this.flickeringLights.forEach(item => {
            item.timer -= 0.016;
            if (item.timer <= 0) {
                const isOn = Math.random() > 0.2;
                item.light.intensity = isOn ? 15 : 0;
                item.timer = Math.random() * 0.2 + 0.05;
            }
        });
    }

    // Helper methods for corridor/decal generation omitted for brevity...
}
