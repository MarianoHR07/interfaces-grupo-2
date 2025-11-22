import { CollidableEntity } from "../core/collidableEntity.js";

export class Runner extends CollidableEntity {
    constructor(x, y) {
        super(x, y);

        // --- Datos del RUNNER ---
        this.frameWidth = 266;
        this.frameHeight = 207;
        this.totalFrames = 15;

        this.scale = 0.30;   // % del tamaño original

        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;
        
        this.currentFrame = 0;
        this.frameSpeed = 4;
        this.frameCount = 0;

        // Física básica
        this.vy = 0;
        this.gravity = 0.2;   // fuerza hacia abajo
        this.jumpForce = -6.5;  // fuerza hacia arriba

        this.maxFallSpeed = 2;  // velocidad máxima de caída

        this.colliderType = "ellipse";

        // --- Datos de EXPLOSIÓN ---
        this.explosionFrameWidth = 130;    
        this.explosionFrameHeight = 126;  
        this.explosionTotalFrames = 6;   

        this.explosionScale = 3;         // tamaño escala explosion

        this.explosionWidth = this.explosionFrameWidth * this.explosionScale;
        this.explosionHeight = this.explosionFrameHeight * this.explosionScale;

        this.explosionCurrentFrame = 0;
        this.explosionFrameSpeed = 8;
        this.explosionFrameCount = 0;

        this.isExploding = false;
        this.explosionFinished = false;

        // Parpadeo al colisionar
        this.isInvulnerable = false;
        this.blinkDuration = 800; // ms
        this.blinkInterval = 120; // ms
    }

    /**
     * Le devuelve a la posición inicial y reinicia su estado.
     * Se usa al reiniciar el juego.
     * @param {number} initialPosX
     * @param {number} initialPosY
     */
    reset(initialPosX, initialPosY) {
        this.x = initialPosX;
        this.y = initialPosY;
        this.vy = 0;
        this.active = true;

        // Animación normal
        this.currentFrame = 0;
        this.frameCount = 0;

        // Explosión
        this.isExploding = false;
        this.explosionFinished = false;
        this.explosionCurrentFrame = 0;
        this.explosionFrameCount = 0;
    }

    update() {
        // Actualiza la animación
        if (this.isExploding) {
            this._updateExplosion();
            return;
        }
        this._updateRunAnimation();

        // Física (caída y movimiento)
        this.vy += this.gravity;  // gravedad
        if(this.vy > this.maxFallSpeed){  // limitamos la velocidad, aunque la gravedad siga sumando, nunca superara esa velocidad
            this.vy = this.maxFallSpeed;
        }
        this.y += this.vy;  // mover al personaje
    }

    _updateRunAnimation() {
        this.frameCount++;
        if (this.frameCount >= this.frameSpeed) {
            this.frameCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames; // Cada vez que cambia currentFrame, se mueve el recorte dentro del sprite. 
                                                                            // Sirve para avanzar un frame de animación y hacer que, cuando llega al último, vuelva al frame 0 automáticamente.
                                                                            // equivale a steps(15)
        }
    }

    _updateExplosion() {
        this.explosionFrameCount++;
        if (this.explosionFrameCount >= this.explosionFrameSpeed) {
            this.explosionFrameCount = 0;
            this.explosionCurrentFrame++;

            if (this.explosionCurrentFrame >= this.explosionTotalFrames) {
                this.explosionFinished = true;
            }
        }
    }

    jump() {
        if (!this.isExploding) {
            this.vy = this.jumpForce;
        }
    }

    die() {
        this.active = false;
        this.startExplosion();
    }

    startExplosion() {
        this.isExploding = true;
        this.explosionCurrentFrame = 0;
        this.explosionFrameCount = 0;
        this.explosionFinished = false;
    }


    isCollidable() { 
        return this.collidable;
    }

    setCollidable(state) { 
        this.collidable = state;
    }

    startInvulnerability() {
        this.isInvulnerable = true;
        this.opacity = 0.4;

        let blinkCount = 0;
        this.blinkInterval = setInterval(() => {
            this.opacity = this.opacity === 1 ? 0.3 : 1;
            blinkCount++;

            if (blinkCount >= 14) { // 7 parpadeos
                clearInterval(this.blinkInterval);
                this.opacity = 1;
                this.isInvulnerable = false;
            }
        }, 120);
    }

}

