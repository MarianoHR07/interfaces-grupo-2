// Model → Entity → MovableEntity → {Background, Particle, ...}

import { Entity } from "./entity.js";

export class MovableEntity extends Entity {
    
  constructor(x, y, width = 0, height = 0) {

    super(x, y, width, height);

    this.vx = 0; // velocidad horizontal (pixeles por segundo)
    this.vy = 0; // velocidad vertical (pixeles por segundo)

    this.ax = 0; // aceleración horizontal (pixeles por segundo al cuadrado)
    this.ay = 0; // aceleración vertical (pixeles por segundo al cuadrado ej: gravedad)
  }

  /**
   * Actualiza la velocidad según la aceleración 
   * y luego la posición según la velocidad
   * @param {number} deltaTime tiempo transcurrido desde el último frame (en ms)
   */
  update(deltaTime) {
    this.#velocityUpdate(deltaTime);
    this.#positionUpdate(deltaTime);
  }

  #positionUpdate(deltaTime) { // actualiza la posición de la entidad, según la velocidad
    // movimiento genérico
    /**
     * "Avanzá en X la cantidad de píxeles que corresponden a moverse 
     *  vx píxeles por segundo, durante el tiempo que pasó entre frames."
    */
   // la direccion del desplazamiento depende del signo de la velocidad
    this.x += this.vx * (deltaTime / 1000); // desplazamiento horizontal constante (hacia la izquierda o derecha) 
    this.y += this.vy * (deltaTime / 1000); // desplazamiento vertical constante (hacia arriba o abajo)
  }
   
  #velocityUpdate(deltaTime) { // actualiza la velocidad según la aceleración
    // aplicar aceleraciones sobre las velocidades
    this.vx += this.ax * (deltaTime / 1000);
    this.vy += this.ay * (deltaTime / 1000); 
  }
}
