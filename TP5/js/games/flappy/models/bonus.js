// models/bonus.js
import { Collectible } from "../core/collectible.js";
import { EventEmitter } from "../core/eventEmitter.js";

export class Bonus extends Collectible {
    constructor(x, y, colliderType = "circle") {
        super(x, y, colliderType);

        this.active = true;
        this.events = new EventEmitter();

        // animación genérica
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.scale = 1;

        this.frameCount = 1;
        this.currentFrame = 0;
        this.frameSpeed = 5;
        this.frameTimer = 0;
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
        console.log("Bonus recolectado");
        this.active = false;

        // 🔥 EMITE EL EVENTO, EL CONTROLADOR LO MANEJA
        this.events.emit("COLLECT", this.getEffectData()); // Envia el tipo de efecto
        this.events.emit("REMOVE", this); // Avisa que debe eliminarse
    }

    update(deltaTime, speed) {
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
}
