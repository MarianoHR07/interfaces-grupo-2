// TP5\js\games\flappy\models\obstacle.js
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

        this.colliderType = "rect"; // valor por defecto de colliderType
    }

    update(deltaTime) {
        // desplazamiento horizontal constante (hacia la izquierda) 
        super.update(deltaTime);
        // si sale de la pantalla, se marca como inactivo
        if (this.x + this.width < 0) {
            this.active = false;
        }
    }
    
    collidesWith(entity) {
        if (!this.active) return false;
        return super.collidesWith(entity);
    }
    
    /**
     * Método estático para crear un objeto con los atributos necesarios,
     * @param {HTMLImageElement} image imagen de la tubería
     * @returns {Object} Objeto con los siguientes atributos:
     *   - `width`: Ancho fijo del obstáculo (110).
     *   - `height`: Alto del obstáculo, basado en la altura de la imagen.
     *   - `vx`: Velocidad horizontal del obstáculo (-150).
     *   - `colliderType`: Tipo de colisionador ('rect').
     */
    static createObstacleData(image) {
        return {
            width: 110,
            height: image.height,
            vx: -150,
            colliderType: "rect"
        };
    }
}
