import { Model } from '../core/model.js';

export class Obstacle extends Model {
    /**
     * 
     * @param {number} x posición inicial en el eje X
     * @param {number} y posición inicial en el eje Y
     * @param {string} type 'top' o 'bottom'
     * @param {HTMLImageElement} image imagen de la tubería
     */
    constructor(x, y, type, image) {
        super();
        this.x = x;
        this.y = y;  
        // this.vx = 0; // velocidad en el eje X (pixeles por segundo).
        // this.vy = 0; // velocidad en el eje Y (pixeles por segundo).
        this.type = type;
        this.image = image;
        this.width = 110;
        this.height = image.height;
    }

    update(deltaTime, speed) {
        // desplazamiento horizontal constante (hacia la izquierda) 
        this.x -= speed * (deltaTime / 1000);  //(deltaTime / 1000): convierte milisegundos a segundos.
        /**
         * "Avanzá en X la cantidad de píxeles que corresponden a moverse 
         *  vx píxeles por segundo, durante el tiempo que pasó entre frames."
        */
        // si sale de la pantalla, se marca como inactivo
        if (this.x + this.width < 0) {
            this.active = false;
        }
    }
}
