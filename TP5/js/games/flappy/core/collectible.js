// Model → Entity → MovableEntity → CollidableEntity → Collectible →  {Coin, Power-Up, ...}
import { CollidableEntity  } from  "./collidableEntity.js";

export class Collectible extends CollidableEntity  {
  constructor(x, y, colliderType="circle", value = 1) {
    super(x, y, colliderType);
    this.value = value;
    this.vx = -150;
  }

  collect() {
    this.deactivate();
    return this.value;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.x + this.width < 0) this.deactivate();
  }
}
