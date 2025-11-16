// import { Entity } from "../core/entity.js";

// import { Model } from '../core/model.js';
// C:\interfaces de usuario\TPE 5\interfaces-grupo-2\TP5\js\games\flappy\models\obstacle.js
import { CollidableEntity } from "../core/collidableEntity.js";
export class Obstacle extends CollidableEntity {
    /**
     * 
     * @param {number} x posición inicial en el eje X
     * @param {number} y posición inicial en el eje Y
     * @param {string} type 'top' o 'bottom'
     * @param {HTMLImageElement} image imagen de la tubería
     */
    constructor(x, y, type, image) {
        super(x, y);  

        this.type = type; // "top" o "bottom"
        this.image = image;

        this.width = 110; // ancho fijo
        this.height = image.height;

        this.vx = -150; // px/s hacia la izquierda (es equivalente a vx = -150)
    }

    update(deltaTime) {
        // desplazamiento horizontal constante (hacia la izquierda) 
        super.update(deltaTime);
    }
    
    collidesWith(entity) {
        if (!this.active) return false;
        return super.collidesWith(entity);
    }
}
