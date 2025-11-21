import { Collectible } from "../core/collectible.js";

export class Bonus extends Collectible {
    
    constructor(x, y, sprite, frameCount, frameWidth, frameHeight, scale, colliderType="rect") {

        super(x, y, colliderType);
        this.colliderType = colliderType;

        // ---- Bonus ----
        this.sprite = sprite;
        this.frameCount = frameCount;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.scale = scale;

        this.currentFrame = 0;
        this.frameSpeed = 8; // avanza un frame cada 8 updates
        this.frameTimer = 0;

        this.width = frameWidth * scale;
        this.height = frameHeight * scale;

        this.active = true; // indica si el bonus está activo (visible y recogible)

        // ---- Destello ----
        this.flashFrameWidth = 347;     
        this.flashFrameHeight = 348;
        this.flashFrameCount = 8;

        this.flashScale = 2;      

        this.flashWidth = this.flashFrameWidth * this.flashScale;
        this.flashHeight = this.flashFrameHeight * this.flashScale;

        this.flashCurrentFrame = 0;
        this.flashFrameSpeed = 8;
        this.flashFrameTimer = 0;

        this.isFlashing = false;
        this.flashFinished = false;

        this.collected = false;
    }

    update(deltaTime, speed) {
        // Animacion del flash
        if (this.isFlashing) {
            this.flashFrameTimer++;
            if (this.flashFrameTimer >= this.flashFrameSpeed) {
                this.flashFrameTimer = 0;
                this.flashCurrentFrame++;

                if (this.flashCurrentFrame >= this.flashFrameCount) {
                    this.flashFinished = true;
                    this.isFlashing = false;
                }
            }
            return;
        }

        // Animacion del bonus 
        this.frameTimer++;
        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }

        this.x -= speed * (deltaTime / 1000);  //(deltaTime / 1000): convierte milisegundos a segundos.;

        // borrar si sale de pantalla
        if (this.x + this.width < 0) {
            this.active = false;
        }
    }

    startFlash() {
        if (this.isFlashing || this.flashFinished) return; // evita reinicios

        this.isFlashing = true;
        this.flashCurrentFrame = 0;
        this.flashFrameTimer = 0;
        this.flashFinished = false;

        // El bonus desaparece visualmente, pero sigue "vivo" hasta que termine flash
        this.active = false;

        this.setCollidable(false);
    }

}
