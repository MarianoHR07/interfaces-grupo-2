// TP5\js\games\flappy\controllers\gameController.js

import { ObstacleController } from './obstacleController.js';

import { Runner } from "../models/runner.js";
import { RunnerView } from "../views/runnerView.js";

import { Bonus } from "../models/bonus.js";
import { BonusView } from "../views/bonusView.js";

import { ColliderSystem } from '../core/colliderSystem.js';
import { DebugColliderView } from '../views/debugColliderView.js';

export class GameController {
    /**
     * @param {CanvasRenderingContext2D} ctx  
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.debugView = new DebugColliderView(this.ctx);
        this.gameOver = false;
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

        // --------------- Runner --------------------
        this.runner = new Runner(100, 150);
        this.runnerView = new RunnerView(this.runner, ctx);
        this.registerInput();

        // --------------- cargar bonus ----------------
        this.bonuses = []; 
        this.bonusView = new BonusView(ctx);

        // objeto de bonificacion
        this.coinSprite = new Image();
        this.coinSprite.src = "js/games/flappy/assets/images/bonus/coin-spritesheet.png";

        this.starSprite = new Image();
        this.starSprite.src = "js/games/flappy/assets/images/bonus/star-spritesheet.png";

        // Tamaños calculados
        this.coinFrameWidth = 5650 / 10;
        this.coinFrameHeight = 566;

        this.starFrameWidth = 893 / 12;
        this.starFrameHeight = 69;
    }

    /**
        * Resetea el estado del juego a los valores iniciales.
        * @return {void}
     */
    reset() {
        // Reiniciar estado del juego
        this.gameOver = false;
        this.score = 0;

        // Reiniciar Runner
        this.runner.reset(100, 150);

        // Reiniciar Obstaculos
        this.obstacleController.reset();
        
        // Reiniciar Bonus
        this.bonuses = [];
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
        
        if (this.isGameOver()) return; // si hay colisión con un obstáculo, termina la actualización del juego}

        const { topHeight: topHeight, bottomY: bottomY} = this.obstacleController.update(deltaTime, timestamp);
        // BONUS: 40% de probabilidad de generar un bonus
        if(topHeight!== null && bottomY !== null){ // esto hay que sacarlo porque el spawn interval determina cuando generar un obstaculo e intenta generar un bonus. 
            if (Math.random() < 0.7) {
                this.#spawnBonus(topHeight, bottomY);
                // el bonus siempre depende de dos tuberias, con lo cual si se genera(ya que tienen un porcentaje de aparicion),
                // solo se genera en el momento en que instanciamos un par de obstaculos
            }
        }

        // Runner
        this.runner.update(); 

        // Limite con el suelo(CAMBIAR:::: para que al colicionar con el techo o el suelo explote) <<<=============================
        const bottomLimit = this.ctx.canvas.height - this.runner.frameHeight * this.runner.scale;
        if(this.runner.y > bottomLimit){
            this.runner.y = bottomLimit;
            this.runner.vy = 0;
        }

        // Limite con el techo
        if (this.runner.y < 0) {
            this.runner.y = 0;
            this.runner.vy = 0; 
        }

        // actualizar bonus (animación + movimiento)
        this.bonuses.forEach(b => b.update(deltaTime, this.speed));
        this.bonuses = this.bonuses.filter(b => b.active);

        
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacleController.draw();

        this.runnerView.draw();

        this.bonuses.forEach(b => this.bonusView.draw(b));

        // Depuración: dibujar cajas de colisión
        this.debugView.enabled = false; // activar/desactivar vista de depuración
        if(this.debugView.enabled)
            this.#drawCollidersBox(this.runner, this.obstacleController.obstacles, this.bonuses);
    }

    // Generacion de bonus
    #spawnBonus(topHeight, bottomY) {
        // Tipo aleatorio: moneda o estrella
        const type = Math.random() < 0.5 ? "coin" : "star";

        let sprite, frameCount, frameWidth, frameHeight, scale;

        // ------------ CONFIG SEGÚN TIPO ------------
        if (type === "coin") {
            sprite = this.coinSprite;
            frameCount = 10;
            frameWidth = this.coinFrameWidth;    // 565
            frameHeight = this.coinFrameHeight;  // 566
            scale = 0.1;
        } 
        else { // star
            sprite = this.starSprite;
            frameCount = 12;
            frameWidth = this.starFrameWidth;    // 74
            frameHeight = this.starFrameHeight;  // 69
            scale = 0.8;
        }

        const bonusHeightScaled = frameHeight * scale;

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
                x: canvasW  // posición normal
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
        const bonus = new Bonus(
            zona.x + 25,
            bonusY,
            sprite,
            frameCount,
            frameWidth,
            frameHeight,
            scale
        );


        this.bonuses.push(bonus);
    }

    #drawCollidersBox(runner, obstacles, coins) {
        this.debugView.drawCollider(runner);
        obstacles.forEach(o => this.debugView.drawCollider(o));
        coins.forEach(c => this.debugView.drawCollider(c));
    }

    /**
        * Maneja las colisiones entre el runner y otros objetos con los que puede interactuar.
        * @return {boolean} true si hubo colisión con un obstáculo (game over), false en caso contrario
    */
    #handleCollitions() {
        // si el runner tiene power-up activo, no colisiona con obstaculos
        const hasPowerUpColision = !this.runner.isCollidable(); 

        // colisiones runner - obstáculos
        let obstaclesColision = false;
        if(!hasPowerUpColision){ // si no tiene power-up activo, chequea colisiones con obstaculos
            const obstacles = this.obstacleController.obstacles;
            obstaclesColision = ColliderSystem.checkAgainstList(this.runner, obstacles);
        }
   
        if (obstaclesColision) {
            this.gameOver = true;
            console.log("Game Over!");
            this.runner.die();
            return true;
        }   

        // colisiones runner - bonus
        const bonusColision = ColliderSystem.checkAgainstList(this.runner, this.bonuses);
        if (bonusColision) {
            this.score += bonusColision.collect();
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
            }
            console.log("Bonus collected!");
            console.log("Score: " + this.score);
        }

        return false;
    }

    isGameOver() {
        return this.#handleCollitions();
    }
        

}
