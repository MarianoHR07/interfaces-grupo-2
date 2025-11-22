import { ObstacleController } from './obstacleController.js';

import { Runner } from "../models/runner.js";
import { RunnerView } from "../views/runnerView.js";

import { Bonus } from "../models/bonus.js";
import { BonusView } from "../views/bonusView.js";

import { ColliderSystem } from '../core/colliderSystem.js';
import { DebugColliderView } from '../views/debugColliderView.js';

import { LifeManager } from '../models/lifeManager.js';
import { LifeBarView } from '../views/lifeBarView.js';

export class GameController {
    /**
     * @param {CanvasRenderingContext2D} ctx  
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.debugView = new DebugColliderView(this.ctx);
        // this.gameOver = false;
        this.score = 0;
        this.bestScore = 0;

        // --------------- Obstáculos ----------------  

        /** @type {ObstacleController} controlador de obstáculos */
        this.obstacleController = new ObstacleController(ctx);

        // **************VER DE LLEVAR A UNA CLASE EN COMUN PARA BONUS Y OBSTACLE***************
        this.speed = 150; // px/s hacia la izquierda (es equivalente a vx = -150)
        // *****************(velocidad comun para bonus y obstacle)*****************************
        
        // ******** ESTO HAY QUE MIGRARLO, PERTENECE A LAS CLASES COIN Y POWER-UP
        this.spawnInterval = 2000; // cada 2 segundos
        this.distancePipes = this.speed * (this.spawnInterval / 1000);   // distancia entre dos tuberias
        // ***********************************************************************

        this.state = "playing";
        this.explosionStartTime = null;

        // --------------- Runner --------------------
        this.runner = new Runner(100, 150);
        this.runnerView = new RunnerView(this.runner, ctx);
        this.registerInput();

        // ----------------- Bonus --------------------
        this.bonuses = []; 
        this.bonusView = new BonusView(ctx);

        // objeto de bonificacion
        this.coinSprite = new Image();
        this.coinSprite.src = "js/games/flappy/assets/images/bonus/coin-spritesheet.png";

        this.starSprite = new Image();
        this.starSprite.src = "js/games/flappy/assets/images/bonus/star-spritesheet.png";

        this.heartSprite = new Image();
        this.heartSprite.src = "js/games/flappy/assets/images/bonus/heart-spritesheet.png";

        // Tamaños calculados
        this.coinFrameWidth = 5650 / 10;
        this.coinFrameHeight = 566;

        this.starFrameWidth = 893 / 12;
        this.starFrameHeight = 69;

        this.heartFrameWidth = 1036 / 14;
        this.heartFrameHeight = 66;

        // ----------------- Sistema de Vidas --------------------
        this.lifeManager = new LifeManager(3);
        this.lifeBar = new LifeBarView(ctx, this.lifeManager);
        
        // flag para evitar múltiples pérdidas por la misma colisión
        this.runnerRecentlyHit = false;
        this.hitCooldown = 500; // ms sin recibir daño
    }

    /**
        * Resetea el estado del juego a los valores iniciales.
        * @return {void}
     */
    reset() {
        // Reiniciar estado del juego
        this.state = "playing";
        this.score = 0;

        // Reiniciar Runner
        this.runner.reset(100, 150);

        // Reiniciar Obstaculos
        this.obstacleController.reset();
        
        // Reiniciar Bonus
        this.bonuses = [];

        // Reiniciar vidas
        this.lifeManager.setLives(this.lifeManager.maxLives);
        this.runnerRecentlyHit = false;
    }

    registerInput() {
        // Barra espaciadora
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                this.runner.jump();
            }
        });

        // Click del mouse
        window.addEventListener("mousedown", () => {
            this.runner.jump();
        });
    }

    // actualiza el estado del juego y de cada uno de los objetos
    update(deltaTime, timestamp) {
        this.checkObstacleCollision();
        this.checkBonusCollision();

        // Estado: explosión
        if (this.state === "exploding") {
            this.runner.update();
            
            if (this.runner.explosionFinished) { // si la explosión terminó → pasar al estado finishDelay
                this.state = "finishDelay";
                this.explosionStartTime = performance.now();
            }

            // durante explosion, NO actualizar mundo ni obstáculos
            return;
        }

        // Estado: esperar 2 segundos luego de la explosión
        if (this.state === "finishDelay") {
            const elapsed = performance.now() - this.explosionStartTime;

            if (elapsed >= 2000) {
                this.state = "gameOver";
            }

            return; // seguir dibujando, pero no actualizar nada del juego
        }

        // Estado: Game Over
        if (this.state === "gameOver") return;

        // Estado: Playing
        this.runner.update();

        // Obastaculos
        const { topHeight, bottomY } = this.obstacleController.update(deltaTime, timestamp);
        
        if(topHeight!== null && bottomY !== null){ 
            if (Math.random() < 0.7) {  // BONUS: 70% de probabilidad de generar un bonus
                this.#spawnBonus(topHeight, bottomY);
                // el bonus siempre depende de dos tuberias, con lo cual si se genera(ya que tienen un porcentaje de aparicion),
                // solo se genera en el momento en que instanciamos un par de obstaculos
            }
        }

        const bottomLimit = this.ctx.canvas.height - this.runner.frameHeight * this.runner.scale;

        // --- Límite inferior ---
        if (this.runner.y > bottomLimit) {
            this.runner.y = bottomLimit;
            this.handleRunnerDamage();
            return;
        }

        // --- Límite superior ---
        if (this.runner.y < 0) {
            this.runner.y = 0;
            this.handleRunnerDamage();
            return;
        }

        // actualizar bonus (animación + movimiento)
        this.bonuses.forEach(b => b.update(deltaTime, this.speed));
        this.bonuses = this.bonuses.filter(b => b.active || !b.flashFinished);
        
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacleController.draw();

        this.runnerView.draw();

        this.bonuses.forEach(b => this.bonusView.draw(b));

        this.lifeBar.draw();


        // #############Depuración: dibujar cajas de colisión###########
        this.debugView.enabled = false; // activar/desactivar vista de depuración
        if(this.debugView.enabled)
            this.#drawCollidersBox(this.runner, this.obstacleController.obstacles, this.bonuses);
        // ############################
    }

    gameOver() {
        console.log("GAME OVER");
    }

    // Generacion de bonus
    #spawnBonus(topHeight, bottomY) {
        // Tipo aleatorio: moneda, estrella o corazon
        const type = this.#randomBonus();

        let sprite, frameCount, frameWidth, frameHeight, scale;

        // ------------ CONFIG SEGÚN TIPO ------------
        if (type === "coin") {
            sprite = this.coinSprite;
            frameCount = 10;
            frameWidth = this.coinFrameWidth;    // 565
            frameHeight = this.coinFrameHeight;  // 566
            scale = 0.1;
        } else {
            if(type === "star"){
                sprite = this.starSprite;
                frameCount = 12;
                frameWidth = this.starFrameWidth;    // 74
                frameHeight = this.starFrameHeight;  // 69
                scale = 0.8;
            } else {
                if(type === "heart"){
                    sprite = this.heartSprite;
                    frameCount = 14;
                    frameWidth = this.heartFrameWidth;    // 74
                    frameHeight = this.heartFrameHeight;  // 66
                    scale = 0.7;
                }
            }
            
        }

        const bonusHeightScaled = frameHeight * scale;
        let halfBonusScaled = frameWidth*scale/2;

        // -------------------------
        //   ZONAS VÁLIDAS
        // -------------------------

        const zones = [];
        const margin = 20;

        const canvasW = this.ctx.canvas.width;
        const canvasH = this.ctx.canvas.height;

        //  ##### Zona A #### En el pasillo entre dos tuberias de arriba
        const topMin = (topHeight / 2) + margin;
        const topMax = topHeight - bonusHeightScaled - margin;
        if (topMax > topMin) {
            zones.push({
                min: topMin,
                max: topMax,
                x: canvasW + this.distancePipes / 2  // cuanto me despego del centro de la tuberia hacia la derecha
            });
        }

        // ##### Zona B ##### En el gap(entre las bocas de dos tuberias)
        const gapMin = topHeight + margin;
        const gapMax = bottomY - bonusHeightScaled - margin;
        if (gapMax > gapMin) {
            zones.push({
                min: gapMin,
                max: gapMax,
                x: canvasW - halfBonusScaled // posición normal
            });
        }

        // ##### Zona C ##### Debajo del tubo inferior
        const bottomMin = bottomY - margin;
        const bottomMax = canvasH - bonusHeightScaled - margin;
        if (bottomMax > bottomMin) {
            zones.push({
                min: bottomMin,
                max: bottomMax,
                x: canvasW + this.distancePipes / 2
            });
        }

        // Elegir zona válida al azar
        const zona = zones[Math.floor(Math.random() * zones.length)];

        // Y final dentro de esa zona
        const bonusY = Math.floor(Math.random() * (zona.max - zona.min) + zona.min);


        // -------------------------
        // Crear BONUS
        // -------------------------
        const firstObstacle = this.obstacleController.obstacles.at(0);
        let halfObstacleX = 0;
        
        if(firstObstacle) halfObstacleX=firstObstacle.width/2;
        
        const bonus = new Bonus(
            zona.x + halfObstacleX,
            bonusY,
            sprite,
            frameCount,
            frameWidth,
            frameHeight,
            scale
        );

        bonus.type = type;

        this.bonuses.push(bonus);
    }

    #drawCollidersBox(runner, obstacles, coins) {
        this.debugView.drawCollider(runner);
        obstacles.forEach(o => this.debugView.drawCollider(o));
        coins.forEach(c => this.debugView.drawCollider(c));
    }


    checkObstacleCollision() {
        if (this.state !== "playing") return;

        const obstacles = this.obstacleController.obstacles;

        // Revisar colisión usando el sistema centralizado
        /** @type {CollidableEntity || null} obstaculo que el runner acaba de colisiónar */
        let collision = ColliderSystem.checkAgainstList(this.runner, obstacles);

        if (!collision) return;

        if (!collision.isCollidable()) return;

        collision.setCollidable(false);

        this.handleRunnerDamage();
    }


    checkBonusCollision() {
        for (let bonus of this.bonuses) {
            if (bonus.collected) continue;  // evitar colisiones múltiples: si ya se recogió, ignorar 

            // Ver si colisiona
            if (ColliderSystem.rectVsRect(this.runner.colliderBounds(), bonus.colliderBounds())) {

                // // ---- MONEDA ----
                // if (bonus.type === "coin") {
                //     // ejemplo:
                //     // this.score += bonus.collect();
                // }

                // // ---- ESTRELLA (power-up) ----
                // if (bonus.type === "star") {
                //     // ejemplo:
                //     // this.runner.activateStarPowerUp();
                // }


                // ---- CORAZÓN (vida extra) ----
                // marcar como recogido
                bonus.collected = true;

                // desactivar collider para evitar colisiones múltiples
                bonus.active = false;

                // activar flash de desaparición
                bonus.startFlash();

                if (bonus.type === "heart") {
                    this.lifeManager.gainLife();
                }
 
            }
        }

        // eliminar bonus recogidos + permitir animación flash
        this.bonuses = this.bonuses.filter(b => b.active || !b.flashFinished);
    }

    /**
     * Maneja daño al runner desde cualquier fuente (suelo, techo, tubería, etc)
     * @return {void}
     */
    handleRunnerDamage() {
        if (this.state !== "playing") return;

        // Evitar daño si está invulnerable o en cooldown
        if (this.runner.isInvulnerable || this.runnerRecentlyHit) return;

        const remainingLives = this.lifeManager.loseLife();

        // Si todavía tiene vidas → parpadeo
        if (remainingLives > 0) {
            this.runner.startInvulnerability();
        } else {
            // Si NO tiene vidas → explota
            this.runner.startExplosion();
            this.state = "exploding";
            this.explosionStartTime = performance.now();
        }

        // Activar cooldown anti-daño inmediato
        this.runnerRecentlyHit = true;
        setTimeout(() => (this.runnerRecentlyHit = false), this.hitCooldown);
    }



    #randomBonus(){
        const probabilities = {
            coin: 0.65,   // 65%
            star: 0.3,   // 30%
            heart: 0.05   // 5%
        };

        const r = Math.random();
        let type;

        if (r < probabilities.coin) {
            type = "coin";
        } else if (r < probabilities.coin + probabilities.star) {
            type = "star";
        } else {
            type = "heart";
        }
        return type;
    }


}
