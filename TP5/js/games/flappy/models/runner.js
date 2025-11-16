// import { Model } from "../core/model.js";

// export class Runner extends Model {
//     constructor() {
//         super();
//         this.x = 100;
//         this.y = 150;
//         this.velocity = 0;
//         this.gravity = 0.5;
//         this.jumpStrength = -8;
//     }

//     jump() {
//         this.velocity = this.jumpStrength;
//     }

//     update(deltaTime) {
//         this.velocity += this.gravity;
//         this.y += this.velocity;
//     }
// }

export class Runner {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.frameWidth = 266;
        this.frameHeight = 207;
        this.totalFrames = 15;

        this.scale = 0.30;   // % del tamaño original

        this.currentFrame = 0;
        this.frameSpeed = 4;
        this.frameCount = 0;

        // Física básica
        this.velocityY = 0;
        this.gravity = 0.2;   // fuerza hacia abajo
        this.jumpForce = -6.5;  // fuerza hacia arriba

        this.maxFallSpeed = 2;  // velocidad máxima de caída
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
        this.velocityY += this.gravity;  // gravedad
        if(this.velocityY > this.maxFallSpeed){  // limitamos la velocidad, aunque la gravedad siga sumando, nunca superara esa velocidad
            this.velocityY = this.maxFallSpeed;
        }
        this.y += this.velocityY;  // mover al personaje
    }

    jump() {
        this.velocityY = this.jumpForce;
    }
}
