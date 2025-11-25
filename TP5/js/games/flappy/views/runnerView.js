export class RunnerView {
    constructor(runner, ctx) {
        this.runner = runner;
        this.ctx = ctx;

        this.debug = false;

        // Timer interno para parpadeo
        this.invincibleTimer = 0;

        this.ctx.globalAlpha = 1;
    }

    draw() {
        const m = this.runner;

        // Si NO se cargo la imagen
        if (!m.sprite.complete) {
            this.ctx.globalAlpha = 1;
            return; // esperar carga
        }

        if (!m.isInvincible()) {
            this.invincibleTimer = 0;
        }

        // aplicar transparencia (parpadeo)
        this.ctx.globalAlpha = m.opacity ?? 1;

        // Si se quedo sin vidas → dibujar explosión
        if (m.isExploding) {
            this.drawExplosion();
            return;
        }

        // Si está invencible → efecto especial de la estrella
        if (m.isInvincible()) {
            this.drawInvincible();
            return;
        }

        // Dibujar runner normal
        this.drawNormal();

        // resetear alpha
        this.ctx.globalAlpha = 1;
    }

    drawNormal() {
        const m = this.runner;

        if (!m.sprite.complete) return;

        this.ctx.drawImage(
            m.sprite,
            m.currentFrame * m.frameWidth,
            0,
            m.frameWidth,
            m.frameHeight,
            m.x,
            m.y,
            m.width,
            m.height
        );
    }

     
    // ============================================================
    //         ★ Dibujar efecto al recolectar estrella ★
    // ============================================================
    drawInvincible() {
        const m = this.runner;

        if (!m.sprite.complete) return;

        // Tiempo para parpadeo
        const blink = m.shouldBlink();

        // Timer interno para controlar parpadeo
        this.invincibleTimer++;

        if (blink) {
            const blinkSpeed = 6; // velocidad del parpadeo
            const shouldSkip = Math.floor(this.invincibleTimer / blinkSpeed) % 2 === 0;

            if (shouldSkip) {
                return; // parpadeo → no dibujar nada
            }
        }
        // Dibujamos las partículas primero (para que queden "detrás")
        this.drawParticles();

        // AURA cuando NO está parpadeando
        this.ctx.save();
        this.ctx.shadowColor = "rgba(255,255,0,0.9)";
        this.ctx.shadowBlur = 25;

        // Dibujar sprite normal
        this.ctx.drawImage(
            m.sprite,
            m.currentFrame * m.frameWidth,
            0,
            m.frameWidth,
            m.frameHeight,
            m.x,
            m.y,
            m.width,
            m.height
        );

        this.ctx.restore();
    }

    // ============================================================
    //                  ★ Dibujar partículas ★
    // ============================================================
    drawParticles() {
        const m = this.runner;
        const ctx = this.ctx;

        m.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;

            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    // ============================================================
    //                  Dibujar explosión
    // ============================================================
    drawExplosion() {
        const m = this.runner;

        if (!m.explosionSprite.complete) return;

        const drawX = m.x + m.width / 2 - m.explosionWidth / 2;
        const drawY = m.y + m.height / 2 - m.explosionHeight / 2;

        this.ctx.drawImage(
            m.explosionSprite,
            m.explosionCurrentFrame * m.explosionFrameWidth,
            0,
            m.explosionFrameWidth,
            m.explosionFrameHeight,
            drawX,
            drawY,
            m.explosionWidth,
            m.explosionHeight
        );
    }

    toggleDebug() {
        this.debug = !this.debug;
    }
}
