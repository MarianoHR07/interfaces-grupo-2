 import { Collectible } from "../core/collectible.js";

export class Bonus extends Collectible {
    
    constructor(x, y, sprite, frameCount, frameWidth, frameHeight, scale, colliderType="rect") {

        super(x, y, colliderType);
        // animación
        this.sprite = sprite;
        this.frameCount = frameCount;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.scale = scale;

        this.currentFrame = 0;
        this.frameSpeed = 8; // avanza un frame cada 5 updates
        this.frameTimer = 0;

        this.width = frameWidth * scale;
        this.height = frameHeight * scale;

        this.active = true; // indica si el bonus está activo (visible y recogible)
    }

    update(deltaTime, speed) {
        this.x -= speed * (deltaTime / 1000);  //(deltaTime / 1000): convierte milisegundos a segundos.;

        // animación
        this.frameTimer++;
        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }

        // borrar si sale de pantalla
        if (this.x + this.width < 0) {
            this.active = false;
        }
    }
}
