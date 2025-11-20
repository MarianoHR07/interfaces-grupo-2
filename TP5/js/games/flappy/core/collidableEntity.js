// Model → Entity → MovableEntity → CollidableEntity → {Obstacle, Enemy, Runner...}
import { MovableEntity } from "./movableEntity.js";

export class CollidableEntity extends MovableEntity {
  /**
   * 
   * @param {number} x define la posición horizontal inicial de la entidad en el canvas
   * @param {number} y define la posición vertical inicial de la entidad en el canvas
   * @param {string} colliderType tipo de collider ("rect", "circle", "ellipse", etc.)
  */
  constructor(x, y, colliderType = "rect") {
    super(x, y);
    this.colliderType = colliderType; // valor por defecto
    this.isCollidable = true; // bandera (puede servir en un futuro para los power-ups del personaje evitando colisiones por un tiempo)
  }

 
  /**
  * Detección de colisiones AABB (colisión de cajas alineadas a los ejes).
  * Verifica si esta entidad colisiona con otra entidad
  * @param {CollidableEntity} otherEntity otra entidad con la cual verificar colisión 
  * @returns {boolean} true si colisionan, false en caso contrario
  */
  collidesWith(otherEntity) {
    // AABB — Axis-Aligned Bounding Box
    return (
      this.x < otherEntity.x + otherEntity.width &&   // this.x no está a la derecha de other
      this.x + this.width > otherEntity.x &&          // this.x no está a la izquierda de other
      this.y < otherEntity.y + otherEntity.height &&  // this.y no está debajo de other
      this.y + this.height > otherEntity.y
    );
  }

  /**
   * Devuelve los límites del collider de la entidad.
   * @returns {object} objeto con las propiedades del collider
   * { type, x, y, width, height, active }
   */
  colliderBounds() {
        return {
            type: this.colliderType,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            active: this.active
        };
    }
}
