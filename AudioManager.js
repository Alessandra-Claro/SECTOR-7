import * as Tone from 'tone';
import * as THREE from 'three';

export class AudioManager {
    constructor() {
        this.initialized = false;
        this.heartbeat = null;
        this.ambient = null;
    }

    async init() {
        if (this.initialized) return;
        await Tone.start();
        this.ambient = new Tone.Noise("brown").start();
        const autoFilter = new Tone.AutoFilter({ frequency: "4n", baseFrequency: 200, octaves: 2.6 }).toDestination().start();
        this.ambient.connect(autoFilter);
        this.ambient.volume.value = -30;

        this.heartbeat = new Tone.MembraneSynth().toDestination();
        Tone.Transport.scheduleRepeat((time) => {
            this.heartbeat.triggerAttackRelease("C1", "8n", time);
            this.heartbeat.triggerAttackRelease("C1", "8n", time + 0.3);
        }, "1n");

        this.breathingFilter = new Tone.AutoFilter({ frequency: "2n", baseFrequency: 400, octaves: 2 }).toDestination().start();
        this.breathingNoise = new Tone.Noise("white").connect(this.breathingFilter).start();
        this.breathingNoise.volume.value = -Infinity;

        Tone.Transport.start();
        this.initialized = true;
    }

    setBreathingIntensity(intensity) {
        if (!this.initialized) return;
        const vol = THREE.MathUtils.lerp(-40, -10, intensity);
        this.breathingNoise.volume.rampTo(intensity > 0.01 ? vol : -Infinity, 0.5);
        this.breathingFilter.frequency.rampTo(intensity > 0.5 ? "4n" : "2n", 0.5);
    }

    setHeartbeatRate(bpm) { if (this.initialized) Tone.Transport.bpm.value = bpm; }
}
