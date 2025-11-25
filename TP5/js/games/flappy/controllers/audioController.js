
export class AudioController {
    constructor() {
        this.bgmTracks = {};   // Música
        this.sfxTracks = {};   // Sonidos de efectos

        this.currentBGM = null;

        this.bgmVolume = 0.3;
        this.sfxVolume = 0.7;

        this.muted = false;
    }

    /** Carga todos los audios */
    async load(bgmList = {}, sfxList = {}) {

        const loadAudio = (src, loop = false) => {
            const audio = new Audio(src);
            audio.loop = loop;
            return audio;
        };

        // --- Cargar BGM ---
        for (const [id, src] of Object.entries(bgmList)) {
            this.bgmTracks[id] = loadAudio(src, true);
            this.bgmTracks[id].volume = this.bgmVolume;
        }

        // --- Cargar SFX ---
        for (const [id, src] of Object.entries(sfxList)) {
            this.sfxTracks[id] = src;  
        }

        console.log("🎵 AudioController cargado.");
    }

    // -----------------------------
    //      🎼  MÚSICA (BGM)
    // -----------------------------
    playBGM(id) {
        if (this.muted) return;

        this.stopAllBGM();

        const track = this.bgmTracks[id];
        if (!track) return;

        track.currentTime = 0;
        track.volume = this.bgmVolume;

        track.play().catch(() =>
            console.warn("⚠️ El audio necesita interacción del usuario.")
        );

        this.currentBGM = track;
    }

    stopBGM() {
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
        }
        this.currentBGM = null;
    }

    stopAllBGM() {
        for (const key in this.bgmTracks) {
            const track = this.bgmTracks[key];
            track.pause();
            track.currentTime = 0;
        }

        // Si había un track suelto (menú viejo), pausarlo también
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
        }
    }

    
    setBGMVolume(v) {
        this.bgmVolume = v;
        if (this.currentBGM) this.currentBGM.volume = v;
    }


    // -----------------------------
    //      🔊  EFECTOS (SFX)
    // -----------------------------
    playSFX(id) {
        if (this.muted) return;

        const src = this.sfxTracks[id];
        if (!src) return;

        // Creamos una instancia NUEVA para permitir solapamiento
        const audio = new Audio(src);
        audio.volume = this.sfxVolume;
        audio.play();
    }

    setSFXVolume(v) {
        this.sfxVolume = v;
    }

    // Limpieza completa
    dispose() {
        this.stopAllBGM();
        this.bgmTracks = {};
        this.sfxTracks = {};
    }


}
