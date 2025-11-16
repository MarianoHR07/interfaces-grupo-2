import { CollidableEntity } from "../core/collidableEntity.js";

export class Runner extends CollidableEntity {
    constructor(x, y) {
        super(x, y);

        this.width = 40;
        this.height = 35;

        // física
        this.gravity = 900;       // px/s^2
        this.jumpImpulse = -350;  // salto hacia arriba

        // velocidad inicial
        this.vx = 0;
        this.vy = 0;

        // estado
        this.isAlive = true;

        // Activamos gravedad
        this.ay = this.gravity;
    }

    jump() {
        if (!this.isAlive) return;
        this.vy = this.jumpImpulse;
    }

    die() {
        this.isAlive = false;
        this.ay = this.gravity;
    }

    update(deltaTime) {
        super.update(deltaTime);
        // Se mantiene dentro de los límites del vw del juego
        if (this.y < 0) this.y = 0;
    }
}
