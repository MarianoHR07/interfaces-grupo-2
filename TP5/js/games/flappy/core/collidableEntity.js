// Model → Entity → MovableEntity → CollidableEntity → {Obstacle, Enemy, Runner...}
import { MovableEntity } from "./movableEntity.js";

export class CollidableEntity extends MovableEntity {
  constructor(x, y) {
    super(x, y);
    this.isCollidable = true; // bandera (puede servir en un futuro para los power-ups del personaje evitando colisiones por un tiempo)
  }

  collidesWith(other) {
    // AABB — Axis-Aligned Bounding Box
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
