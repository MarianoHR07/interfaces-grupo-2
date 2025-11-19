// import { CollidableEntity } from "../core/collidableEntity.js";

// export class Runner extends CollidableEntity {
//     constructor(x, y) {
//         super(x, y);

//         // this.width = 266 * 0.30;  // escala del sprite
//         // this.height = 207 * 0.30;

//         this.frameWidth = 266;
//         this.frameHeight = 207;
//         this.totalFrames = 15;
//         this.scale = 0.30;   // % del tamaño original

//         this.currentFrame = 0;
//         this.frameSpeed = 4;
//         this.frameCount = 0;

//         this.maxFallSpeed = 2;  // velocidad máxima de caída

//         // física
//         this.gravity = 900;       // px/s^2
//         this.jumpImpulse = -350;  // salto hacia arriba

//         // velocidad inicial
//         this.vx = 0;
//         this.vy = 0;

//         // estado
//         this.isAlive = true;

//         // Activamos gravedad
//         this.ay = this.gravity;
//     }

//     jump() {
//         if (!this.isAlive) return;
//         this.vy = this.jumpImpulse;
//     }

//     die() {
//         this.isAlive = false;
//         this.ay = this.gravity;
//     }

//     update(deltaTime) {
//         // Actualiza la animación
//         this.frameCount++;
//         if (this.frameCount >= this.frameSpeed) {
//             this.frameCount = 0;
//             this.currentFrame = (this.currentFrame + 1) % this.totalFrames;  // equivale a steps(15)
//             // Cada vez que cambia currentFrame, se mueve el recorte dentro del sprite. 
//         }
//         super.update(deltaTime);

//         if(this.vy > this.maxFallSpeed){  // limitamos la velocidad, aunque la gravedad siga sumando, nunca superara esa velocidad
//             this.vy = this.maxFallSpeed;
//         }
//         // Se mantiene dentro de los límites del vw del juego
//         if (this.y < 0) this.y = 0;
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

