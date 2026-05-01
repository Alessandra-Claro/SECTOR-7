import * as Tone from 'tone';

export class AudioManager {
    constructor() {
        this.initialized = false;
        this.heartbeat = null;
    }

    async init() {
        if (this.initialized) return;
        await Tone.start();
        this.heartbeat = new Tone.MembraneSynth().toDestination();
        Tone.Transport.scheduleRepeat((time) => {
            this.heartbeat.triggerAttackRelease("C1", "8n", time);
        }, "1n");
        Tone.Transport.start();
        this.initialized = true;
    }

    setHeartbeatRate(bpm) {
        if (this.initialized) Tone.Transport.bpm.value = bpm;
    }
}
