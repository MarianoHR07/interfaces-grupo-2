// TP5\js\games\flappy\controllers\gameController.js

import { ObstacleController } from './obstacleController.js';

import { Runner } from "../models/runner.js";
import { RunnerView } from "../views/runnerView.js";

import { ColliderSystem } from '../core/colliderSystem.js';
import { DebugColliderView } from '../views/debugColliderView.js';

import { BonusTypes } from '../core/bonusTypes.js';
import { BonusController } from './bonusController.js';
import { CoinView } from '../views/coinView.js';

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
        
        this.aux_obstacle = this.obstacleController.getObstacleData();

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

        // ----------------- Bonus ---------------- 
        this.coinView = new CoinView(ctx);
        this.bonusController = new BonusController(
            ctx,
            { minY: 0, maxY: 0, x: 0 },  // spawnArea
            this.speed,                  // speed 
        );
        // Nos suscribimos al evento emitido por BonusController
        this.bonusController.on("bonus-taken", (effect) => {
            this.applyBonusEffect(effect); // callback
        });

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
        this.bonusController.reset();
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

        // Detectar colision → activar explosion SOLO una vez
        if (this.isGameOver()) {
            if (this.state === "playing") {
                this.runner.startExplosion();
                this.state = "exploding";
                this.explosionStartTime = performance.now();
            }
        }
        
        // Actualizar siempre el runner (caminar / explosion / gravedad)
        this.runner.update();

        // actualizar bonus (animación + movimiento)
        this.bonusController.update(deltaTime);

        // Estado: explosión
        if (this.state === "exploding") {
            // si la explosión terminó → pasar al estado finishDelay
            if (this.runner.explosionFinished) {
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

        // Si está jugando (playing): actualizar obstáculos y bonus
        const { topHeight: topHeight, bottomY: bottomY} = this.obstacleController.update(deltaTime, timestamp);
        // SpawnArea = this.obstacleController.getLastSpawnArea();
        
        if(topHeight!== null && bottomY !== null){ 
            if (Math.random() < 0.7) {  // BONUS: 70% de probabilidad de generar un bonus
                this.#spawnBonus(topHeight, bottomY);

                // el bonus siempre depende de dos tuberias, con lo cual si se genera(ya que tienen un porcentaje de aparicion),
                // solo se genera en el momento en que instanciamos un par de obstaculos
            }
        }

        // --- COLISIÓN CON EL SUELO ---
        const starActive = this.runner.isInvincible();
        const bottomLimit = this.ctx.canvas.height - this.runner.frameHeight * this.runner.scale;

        if (this.runner.y > bottomLimit) {
            this.runner.y = bottomLimit;

            // activar game over por colisión con el suelo
            if (!starActive && this.state === "playing") {
                this.runner.startExplosion();
                this.state = "exploding";
                this.explosionStartTime = performance.now();
            }

            return; // no seguir actualizando el juego
        }

        // --- COLISIÓN CON EL TECHO ---
        if (this.runner.y < 0) {
            this.runner.y = 0;

            // activar game over por colisión con el techo
            if (!starActive && this.state === "playing") {
                this.runner.startExplosion();
                this.state = "exploding";
                this.explosionStartTime = performance.now();
            }

            return;
        }        
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacleController.draw();
        
        this.bonusController.draw();

        this.runnerView.draw();

        // Depuración: dibujar cajas de colisión
        this.debugView.enabled = false; // activar/desactivar vista de depuración
        if(this.debugView.enabled)
            this.#drawCollidersBox(this.runner, this.obstacleController.obstacles, this.bonusController.bonuses);

        this.coinView.draw(this.score);
    }


    #spawnBonus(topHeight, bottomY) {
        if (!this.obstacleController.obstacles) return;

        const halfObstacleX = this.aux_obstacle ? this.aux_obstacle.width / 2 : 0;

        // Elegir tipo de bonus (clase)
        const type = this.bonusController.pickBonusType();

        // Obtener datos del bonus sin instanciar
        const bonusData = this.bonusController.getBonusData(type);
        const bonusHeight = bonusData.height;
        const halfBonusWidth = bonusData.width / 2;

        // -------------------------
        //   ZONAS VÁLIDAS
        // -------------------------
        const zones = [];
        const margin = 20;
        const canvasW = this.ctx.canvas.width;
        const canvasH = this.ctx.canvas.height;
        const distanceBetweenObstacles = this.distancePipes

        //  ##### Zona A #### En el pasillo entre dos tuberias de arriba
        const topMin = (topHeight / 2) + margin;
        const topMax = topHeight - bonusHeight - margin;
        if (topMax > topMin) {
            zones.push({
                minY: topMin,
                maxY: topMax,
                x: canvasW + distanceBetweenObstacles/2 + halfBonusWidth  // cuanto me despego del centro de la tuberia hacia la derecha
            });
        }

        // ##### Zona B ##### En el gap(entre las bocas de dos tuberias)
        /** @type {number} */
        const gapMin = topHeight + margin;
        const gapMax = bottomY - bonusHeight - margin;
        if (gapMax > gapMin) {
            zones.push({
                minY: gapMin,
                maxY: gapMax,
                x: canvasW + halfObstacleX - halfBonusWidth // posición normal
            });
        }

        // ##### Zona C ##### Debajo del tubo inferior
        const bottomMin = bottomY - margin;
        const bottomMax = canvasH - bonusHeight - margin;
        if (bottomMax > bottomMin) {
            zones.push({
                minY: bottomMin,
                maxY: bottomMax,
                x: canvasW + distanceBetweenObstacles/2 + halfBonusWidth 
            });
        }

        // Si no hay zonas válidas, no spawnear
        if (zones.length === 0) return;

        // Elegir zona válida al azar
        const spawnArea = zones[Math.floor(Math.random() * zones.length)];

        // Crear bonus real
        this.bonusController.spawnBonus(type,spawnArea);
    }


    /**
     * Aplica el efecto recibido desde un bonus.
     * Cada bonus envía un objeto `effect` con datos como:
     *   - type     → tipo de bonus (STAR, COIN, HEART)
     *   - amount   → cantidad a sumar (monedas)
     *   - duration → duración de la invencibilidad (estrella)
     *   - heal     → cantidad de vidas a recuperar (corazón)
     *
     * @param {Object} effect - Efecto emitido por un bonus.
     */
    applyBonusEffect(effect) {
        switch(effect.type) {

            case BonusTypes.STAR:
                // this.runner.setInvincible(true);

                // setTimeout(() => {
                //     this.runner.setInvincible(false);
                // }, effect.duration);
                

                // this.runner.setInvincible(true, effect.duration);
                // setTimeout(() => {
                //     this.runner.setInvincible(false);
                // }, effect.duration);

                this.runner.setInvincible(true, effect.duration);
                break;

            case BonusTypes.COIN:
                this.score += effect.amount;

                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    console.log("Has impuesto un nuevo record: " + this.score);
                }
                // console.log("Bonus collected!");
                // console.log("Score: " + this.score);
                break;

            case BonusTypes.HEART:
                this.lives = (this.lives < 3) ? (this.lives += effect.heal) : this.lives
                break;

            default:
                console.warn("Bonus desconocido:", effect.type);
        }
    }

    

    /**
        * Maneja las colisiones entre el runner y otros objetos con los que puede interactuar.
        * @return {boolean} true si hubo colisión con un obstáculo (game over), false en caso contrario
    */
    #handleCollitions() {

        const starActive = this.runner.isInvincible();

        // Colisiones con obstáculos solo si NO es invencible
        if (!starActive) {
            const obstacles = this.obstacleController.obstacles;
            if (ColliderSystem.checkAgainstList(this.runner, obstacles)) {
                this.runner.die();
                return true;
            }
        }

        // Colisiones con BONUS (SIEMPRE)
        const hitBonus = ColliderSystem.checkAgainstList(
            this.runner,
            this.bonusController.bonuses
        );

        if (hitBonus) {
            hitBonus.collect(); // dispara COLLECT y REMOVE automáticamente
        }

        return false;
    }

    isGameOver() {
        return this.#handleCollitions();
    }

    #drawCollidersBox(runner, obstacles, coins) {
        this.debugView.drawCollider(runner);
        obstacles.forEach(o => this.debugView.drawCollider(o));
        coins.forEach(c => this.debugView.drawCollider(c));
    }
}
