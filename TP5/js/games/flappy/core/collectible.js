// Model → Entity → MovableEntity → CollidableEntity → Collectible →  {Coin, Power-Up, ...}
import { CollidableEntity  } from "./CollidableEntity .js";

export class Collectible extends CollidableEntity  {
  constructor(x, y, value = 1) {
    super(x, y);
    this.value = value;
    this.vx = -150;
  }

  onCollect(player) {
    this.deactivate();
    return this.value;
  }

  update(deltaTime) {
    super.update(deltaTime);
    if (this.x + this.width < 0) this.deactivate();
  }
}
