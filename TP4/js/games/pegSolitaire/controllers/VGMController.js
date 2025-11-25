// ###############################################
//   Controlador de música y efectos de sonido (BGM / SFX)
// ###############################################

export class VGMController {
    constructor() {
        this.tracks = {};
        this.current = null;
        this.volume = 0.4; // volumen general por defecto
    }

    /**
     * Carga todas las pistas y las deja listas para usar.
     * @param {Object} trackList - Diccionario con id: src
     */
    async loadAll(trackList) {
        // const VGM, contiene pistas (archivos de audio) es un diccionario "key:value" { id: ruta }
        // Object.entries:Convierte el objeto en una lista de pares [id, src]
        const promises = Object.entries(trackList).map(async ([id, src]) => { 
        // .map(async ([id, src]) => {...}) 
        // Recorre esa lista y por cada par crea un objeto Audio, donde [id, src] se desestructura de cada par.
        
        //  Por ejemplo:
        //  Primer elemento de VGM { menu: "./js/games/pegSolitaire/assets/audio/music/gameplay-theme.mp3",..}
        //  se desestructura a {id = "menu", src = "./assets/audio/music/menu-theme.mp3"}
            const audio = new Audio(src);
            audio.loop = true;
            audio.volume = this.volume;
            this.tracks[id] = audio;
        });
        await Promise.all(promises);
    }

    /**
     * Reproduce una pista (detiene la anterior si la hay).
     * @param {string} id - ID de la pista en this.tracks
     * @param {boolean} loop - si debe reproducirse en bucle
     */
    play(id, loop = true) {
        this.stop();
        const track = this.tracks[id];
        if (track) {
            track.loop = loop;
            track.currentTime = 0;
            track.volume = this.volume;
            track.play().catch(err =>
                console.warn("🔇 Audio bloqueado hasta interacción del usuario:", err)
            );
            this.current = track;
        }
    }

    /** Detiene la pista actual */
    stop() {
        if (this.current) {
            this.current.pause();
            this.current.currentTime = 0;
        }
        // Devuelve una lista con todos los valores del objeto this.tracks  (todas las instancias de Audio que fueron cargadas)
        Object.values(this.tracks).forEach(audio => audio.pause()); //ejemplo:[HTMLAudioElement(menu), HTMLAudioElement(gameplay)]
        this.current = null;
    }

    /** Pausa sin reiniciar */
    pause() {
        if (this.current) this.current.pause();
    }

    /** Reanuda la pista actual */
    resume() {
        if (this.current) this.current.play();
    }

    /** Ajusta volumen global */
    setVolume(value) {
        this.volume = value;
        Object.values(this.tracks).forEach(track => track.volume = value);
    }

    /** Libera toda referencia a las pistas (al salir del juego) */
    dispose() {
        this.stop();
        Object.values(this.tracks).forEach(audio => {
            audio.src = "";  // Recorre cada pista y borra su fuente de audio, liberando la referencia al archivo (liberamos memoria).
        });
        this.tracks = {};
        this.current = null;
    }
}
