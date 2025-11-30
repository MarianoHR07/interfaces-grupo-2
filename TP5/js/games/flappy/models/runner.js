import { CollidableEntity } from "../core/collidableEntity.js";

export class Runner extends CollidableEntity {
    constructor(x, y) {
        super(x, y);
         // Sprite del runner
        this.sprite = new Image();
        this.sprite.src = "js/games/flappy/assets/images/runner/runner-spritesheet.png";

        // Sprite de explosión
        this.explosionSprite = new Image();
        this.explosionSprite.src = "js/games/flappy/assets/images/runner/explosion-spritesheet.png";

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

        // Física en MovableEntity → Runner
        this.jumpForce = -550; // fuerza hacia arriba
        this.maxFallSpeed = 200; // velocidad máxima de caída
         
        this.ay = 1500; // fuerza hacia abajo
        this.gravityDelay = 3000; // ms antes de aplicar gravedad
         
        this.timeSinceStart = performance.now();

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
        
        // --- Estrella / invencibilidad ---
        this.invincible = false;  
        this.particles = [];
        this.invincibleStartTime = 0;
        this.invincibleDuration = 0;// duración total (ms)

        // Parpadeo al colisionar
        this.isInvulnerable = false;
        this.blinkDuration = 800; // ms
        this.blinkInterval = 120; // ms

        this.collidable = true;
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
        this.collidable = true;

        // Animación normal
        this.currentFrame = 0;
        this.frameCount = 0;

        // Explosión
        this.isExploding = false;
        this.explosionFinished = false;
        this.explosionCurrentFrame = 0;
        this.explosionFrameCount = 0;

        // --- Reset invencibilidad ---
        this.invincible = false;
        this.particles = [];
        
        // --- Reset fisicas ---
        this.ay = 1500; 
        this.jumpForce = -550;
        this.maxFallSpeed = 200;
        
        this.timeSinceStart = performance.now();
    }

     update(deltaTime,timestamp) {
         // Actualiza la animación
        if (this.isExploding) {
            this._updateExplosion();
            return;
        }
        
        this._updateRunAnimation(); // animacion de spritesheet
        
        if (timestamp - this.timeSinceStart  < this.gravityDelay) {
           // No aplicar gravedad hasta que transcurran "gravityDelay" segundos
            return; 
        }

        // Física base (velocidad, aceleración, gravedad, movimiento)
        super.update(deltaTime);

        // Limitar velocidad de caída
        if (this.vy > this.maxFallSpeed) {
            this.vy = this.maxFallSpeed;
        }

        // Partículas
        this.generateParticles();
        this.updateParticles();

        // Cancelar invencibilidad cuando se acaba el tiempo
        if (this.invincible && this.getInvincibleTimeLeft() <= 0) {
            this.setInvincible(false);
        }
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

    setInvincible(value, duration = 0) {
        const now = performance.now();

        if (value) {
            // Extender duración si ya está activo
            if (this.invincible) {
                const timeLeft = this.getInvincibleTimeLeft();
                this.invincibleDuration = timeLeft + duration;
                this.invincibleStartTime = now;
            }
            // Activar desde cero
            else {
                this.invincible = true;
                this.invincibleStartTime = now;
                this.invincibleDuration = duration;
            }
        } else {
            // Apagar correctamete
            this.invincible = false;
            this.invincibleDuration = 0;
            this.invincibleStartTime = 0;
            this.particles = [];
        }
    }

    getInvincibleTimeLeft() {
        if (!this.invincible) return 0;

        const elapsed = performance.now() - this.invincibleStartTime;
        return Math.max(0, this.invincibleDuration - elapsed);
    }

    shouldBlink() {
        if (!this.invincible) return false;

        const timeLeft = this.getInvincibleTimeLeft();
        return timeLeft < 1000; // último segundo
    }

    isInvincible() {
        return this.invincible;
    }

    /** Genera partículas luminosas flotando alrededor del runner */
    generateParticles() {
        if (!this.invincible) return;
        const centerY = this.y + this.height / 2;
        const count = 2; // partículas por frame
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.x + (Math.random() * this.width - this.width/2),
                y: this.y + (Math.random() * this.height - this.height/2),
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                alpha: 1,
                size: 2 + Math.random() * 3
            });
        }
    }

    /** Actualiza la animación de partículas */
    updateParticles() {
        if (!this.invincible) return;

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
        });

        // limpiar partículas apagadas
        this.particles = this.particles.filter(p => p.alpha > 0);
    }


    //invulnerabilidad luego de recibir daño
    startInvulnerability() {
         
        this.isInvulnerable = true;
        this.opacity = 0.4;

        let blinkCount = 0;
        this.blinkInterval = setInterval(() => {

            this.opacity = (this.opacity === 1) ? 0.3 : 1;

            blinkCount++;

            if (blinkCount >= 14 || this.invincible) { // cantidad de parpadeos
                clearInterval(this.blinkInterval);
                this.opacity = 1;
                this.isInvulnerable = false;
            }
        }, 120); // cambia el valor de la opacidad en un intervalo de 0,12 segundos
        
    
    }
}

