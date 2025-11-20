// TP5\js\games\flappy\models\runner.js
import { CollidableEntity } from "../core/collidableEntity.js";

export class Runner extends CollidableEntity {
    constructor(x, y) {
        super(x, y);

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
        this.isAlive = true;
        this.currentFrame = 0;
        this.frameCount = 0;
    }

    update() {
        // Actualiza la animación
        this.frameCount++;
        if (this.frameCount >= this.frameSpeed) {
            this.frameCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;  // equivale a steps(15)
            // Cada vez que cambia currentFrame, se mueve el recorte dentro del sprite. 
        }

        // Física (caída y movimiento)
        this.vy += this.gravity;  // gravedad
        if(this.vy > this.maxFallSpeed){  // limitamos la velocidad, aunque la gravedad siga sumando, nunca superara esa velocidad
            this.vy = this.maxFallSpeed;
        }
        this.y += this.vy;  // mover al personaje
    }

    jump() {
        this.vy = this.jumpForce;
    }

    die() {
        this.isAlive = false;
    }
}

