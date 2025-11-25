// models/bonus.js
import { Collectible } from "../core/collectible.js";
import { EventEmitter } from "../core/eventEmitter.js";

export class Bonus extends Collectible {
    constructor(x, y, colliderType = "circle") {
        super(x, y, colliderType);
        this.collidable = true;
        this.collected = false;

        // // ---- Bonus ----
        this.active = true;
        this.events = new EventEmitter();

        // animación genérica
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.scale = 1;

        this.frameCount = 1;
        this.currentFrame = 0;
        this.frameSpeed = 8; // avanza un frame cada 8 updates
        this.frameTimer = 0;
        

        // ---- Destello ----
        this.flashFrameWidth = 347;     
        this.flashFrameHeight = 348;
        this.flashFrameCount = 8;

        this.flashScale = 2;      

        this.flashWidth = this.flashFrameWidth * this.flashScale;
        this.flashHeight = this.flashFrameHeight * this.flashScale;

        this.flashCurrentFrame = 0;
        this.flashFrameSpeed = 8;
        this.flashFrameTimer = 0;

        this.isFlashing = false;
        this.flashFinished = false;

        
    }

    /**
     * Metodo que debe ser sobrescrito por las subclases.
     * Contiene los datos del efecto del bonus.
     * @return {Object} datos del efecto del bonus
     */
    getEffectData() {
        return { type: "GENERIC" };
    }

    collect() {
        if (!this.active) return;
        
        this.startFlash();
        console.log("Bonus recolectado");

        // 🔥 EMITE EL EVENTO, EL CONTROLADOR LO MANEJA
        this.events.emit("COLLECT", this.getEffectData()); // Envia el tipo de efecto
        
    }

    update(deltaTime, speed) {
        // Animacion del flash
        if (this.isFlashing) {
            this.flashFrameTimer++;

            if (this.flashFrameTimer >= this.flashFrameSpeed) {
                this.flashFrameTimer = 0;
                this.flashCurrentFrame++;

                if (this.flashCurrentFrame >= this.flashFrameCount) {
                    this.flashFinished = true;
                    this.isFlashing = false;
                    this.events.emit("REMOVE", this); // Avisa que debe eliminarse
                }
            }
            // return;
        }

        this.x -= speed * (deltaTime / 1000);

        // animación genérica
        this.frameTimer++;
        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }

        if (this.x + this.width < 0) {
            this.active = false;
        }
    }

    /**
     * Método estático para crear un objeto con los atributos necesarios para un bonus.
     * Este método devuelve un objeto con las propiedades básicas de un bonus, como su tamaño
     * y el tipo de colisionador que tiene
     * @param {number} width - El ancho del bonus, que puede ser determinado por la imagen o el tamaño del bonus.
     * @param {number} height - La altura del bonus, también determinada por la imagen o el tamaño.
     * @param {string} colliderType - Tipo de colisionador del bonus. Puede ser "rect", "circle", "ellipse", etc.
     * 
     * @returns {Object} Objeto con los siguientes atributos:
     *   - `width`: El ancho del bonus proporcionado como parámetro.
     *   - `height`: La altura del bonus proporcionada como parámetro.
     *   - `colliderType`: Tipo de colisionador para el bonus. Ejemplo: "circle", "rect", "ellipse".
    */
    static createBonusData(width, height, colliderType) {
        return {
            width: width,
            height: height,
            colliderType: colliderType
        };
    }

    startFlash() {
        if (this.isFlashing || this.flashFinished) return; // evita reinicios
        this.isFlashing = true;
        this.flashCurrentFrame = 0;
        this.flashFrameTimer = 0;
        this.flashFinished = false;

        // El bonus desaparece visualmente, pero sigue "vivo" hasta que termine flash
        this.active = false;

        this.setCollidable(false);
    }

}
