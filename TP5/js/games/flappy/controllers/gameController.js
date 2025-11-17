import { ObstacleController } from './obstacleController.js';

import { Runner } from "../models/runner.js";
import { RunnerView } from "../views/runnerView.js";

import { Bonus } from "../models/bonus.js";
import { BonusView } from "../views/bonusView.js";

export class GameController {
    /**
     * @param {CanvasRenderingContext2D} ctx  
     */
    constructor(ctx) {
        this.ctx = ctx;

        /** @type {ObstacleController} controlador de obstáculos */
        this.obstacleController = new ObstacleController(ctx);

        // **************VER DE LLEVAR A UNA CLASE EN COMUN PARA BONUS Y OBSTACLE***************
        this.speed = 150; // px/s hacia la izquierda (es equivalente a vx = -150)
        // *****************(velocidad comun para bonus y obstacle)*****************************

        this.distancePipes = this.speed * (this.spawnInterval / 1000);   // distancia entre dos tuberias
       

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
            this.runner.jump;
        });
    }

    // actualiza el estado del juego y de cada uno de los objetos
    update(deltaTime, timestamp) {
        const { topHeight: topHeight, bottomY: bottomY} = this.obstacleController.update(deltaTime, timestamp);
        // BONUS: 40% de probabilidad de generar un bonus
        if(topHeight!== null && bottomY !== null){
            if (Math.random() < 0.7) {
                this.#spawnBonus(topHeight, bottomY);
            }
        }

        // Runner
        this.runner.update();

        // Limite con el suelo(CAMBIAR:::: para que al colicionar con el techo o el suelo explote) <<<=============================
        const bottomLimit = this.ctx.canvas.height - this.runner.frameHeight * this.runner.scale;
        if(this.runner.y > bottomLimit){
            this.runner.y = bottomLimit;
            // this.runner.velocityY = 0;
            this.runner.vy = 0;
        }

        // Limite con el techo
        if (this.runner.y < 0) {
            this.runner.y = 0;
            // this.runner.velocityY = 0; 
            this.runner.vy = 0; 
        }

        // actualizar bonus (animación + movimiento)
        this.bonuses.forEach(b => b.update(deltaTime, this.speed));
        this.bonuses = this.bonuses.filter(b => b.active);
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacleController.draw();
        // this.obstacles.forEach(o => this.obstacleView.draw(o));

        this.runnerView.draw();

        this.bonuses.forEach(b => this.bonusView.draw(b));
    }

    // Generacion de bonus
    // spawnBonus(topHeight, bottomY) {
    //     // 3 posiciones posibles
    //     // - arriba del gap
    //     // - en el centro del gap
    //     // - abajo del gap
    //     const positions = ["topGap", "middleGap", "bottomGap"];
    //     const chosen = positions[Math.floor(Math.random() * positions.length)];

    //     const gapTop = topHeight;
    //     const gapBottom = bottomY;
    //     const gapCenter = Math.floor((gapTop + gapBottom) / 2);
    //     let bonusY = gapCenter - this.coinFrameHeight * 0.4;

    //     if (chosen === "topGap") {
    //         bonusY = topHeight - 40;  // un poco arriba del inicio del gap
    //     } 
    //     else if (chosen === "middleGap") {
    //         bonusY = topHeight + (this.gap / 2) - 30; // centro del gap
    //     } 
    //     else { // bottomGap
    //         bonusY = bottomY + 40; // un poco debajo del gap
    //     }


    //     // Tipo aleatorio: moneda o estrella
    //     const type = Math.random() < 0.5 ? "coin" : "star";

    //     let sprite, frameCount, frameWidth, frameHeight, scale;

    //     // ------------ CONFIG SEGÚN TIPO ------------
    //     if (type === "coin") {
    //         sprite = this.coinSprite;
    //         frameCount = 10;
    //         frameWidth = this.coinFrameWidth;    // 565
    //         frameHeight = this.coinFrameHeight;  // 566
    //         scale = 0.1;
    //     } 
    //     else { // star
    //         sprite = this.starSprite;
    //         frameCount = 12;
    //         frameWidth = this.starFrameWidth;    // 74
    //         frameHeight = this.starFrameHeight;  // 69
    //         scale = 0.8;
    //     }

    //     // Crear bonus usando tu constructor original
    //     const bonus = new Bonus(
    //         this.ctx.canvas.width, // x al borde derecho
    //         bonusY,                // y calculado
    //         sprite,                // imagen
    //         frameCount,
    //         frameWidth,
    //         frameHeight,
    //         scale
    //     );


    //     this.bonuses.push(bonus);
    // }





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








    // spawnBonus(topHeight, bottomY) {

    //     const canvasH = this.ctx.canvas.height;
    //     const margen = 20;

    //     // Tipo aleatorio: moneda o estrella
    //     const type = Math.random() < 0.5 ? "coin" : "star";

    //     let sprite, frameCount, frameWidth, frameHeight, scale;

    //     if (type === "coin") {
    //         sprite = this.coinSprite;
    //         frameCount = 10;
    //         frameWidth = this.coinFrameWidth;   // 565
    //         frameHeight = this.coinFrameHeight; // 566
    //         scale = 0.1;                        // tu escala
    //     } else {
    //         sprite = this.starSprite;
    //         frameCount = 12;
    //         frameWidth = this.starFrameWidth;   // 74
    //         frameHeight = this.starFrameHeight; // 69
    //         scale = 0.8;                        // tu escala
    //     }

    //     const bonusHeightScaled = frameHeight * scale;

    //     // -------------------------
    //     //   DEFINIR ZONAS VÁLIDAS
    //     // -------------------------

    //     const zonas = [];

    //     // 🔵 Zona A — Arriba del tubo superior
    //     const arribaMin = margen;
    //     const arribaMax = topHeight - bonusHeightScaled - margen;
    //     if (arribaMax > arribaMin) {
    //         zonas.push({ min: arribaMin, max: arribaMax });
    //     }

    //     // 🟢 Zona B — En el gap
    //     const gapMin = topHeight + margen;
    //     const gapMax = bottomY - bonusHeightScaled - margen;
    //     if (gapMax > gapMin) {
    //         zonas.push({ min: gapMin, max: gapMax });
    //     }

    //     // 🔴 Zona C — Debajo del tubo inferior
    //     const abajoMin = bottomY + margen;
    //     const abajoMax = canvasH - bonusHeightScaled - margen;
    //     if (abajoMax > abajoMin) {
    //         zonas.push({ min: abajoMin, max: abajoMax });
    //     }

    //     // Elegir zona válida al azar
    //     const zona = zonas[Math.floor(Math.random() * zonas.length)];

    //     // Y final dentro de esa zona
    //     const bonusY = Math.floor(Math.random() * (zona.max - zona.min) + zona.min);

    //     // -------------------------
    //     // Crear BONUS
    //     // -------------------------
    //     const bonus = new Bonus(
    //         this.ctx.canvas.width,
    //         bonusY,
    //         sprite,
    //         frameCount,
    //         frameWidth,
    //         frameHeight,
    //         scale
    //     );

    //     // Pasar velocidad del obstáculo 
    //     bonus.speed = this.gameSpeed;

    //     this.bonuses.push(bonus);
    // }




    // spawnBonus(topHeight, bottomY) {

    //     const canvasH = this.ctx.canvas.height;
    //     const margen = 20;

    //     // Tipo aleatorio
    //     const type = Math.random() < 0.5 ? "coin" : "star";

    //     let sprite, frameCount, frameWidth, frameHeight, scale;

    //     if (type === "coin") {
    //         sprite = this.coinSprite;
    //         frameCount = 10;
    //         frameWidth = this.coinFrameWidth;
    //         frameHeight = this.coinFrameHeight;
    //         scale = 0.1;
    //     } else {
    //         sprite = this.starSprite;
    //         frameCount = 12;
    //         frameWidth = this.starFrameWidth;
    //         frameHeight = this.starFrameHeight;
    //         scale = 0.8;
    //     }

    //     const bonusH = frameHeight * scale;

    //     // ----------------------------------
    //     // NUEVOS LIMITES CORRECTOS
    //     // ----------------------------------

    //     const zonas = [];

    //     // 🟦 ZONA A: encima del tubo superior
    //     // tubo superior llega hasta topHeight
    //     const arribaMin = margen;
    //     const arribaMax = topHeight - bonusH - margen;

    //     if (arribaMax > arribaMin) zonas.push({ min: arribaMin, max: arribaMax });

    //     // 🟩 ZONA B: en el gap (esto ya funcionaba)
    //     const gapMin = topHeight + margen;
    //     const gapMax = bottomY - bonusH - margen;

    //     if (gapMax > gapMin) zonas.push({ min: gapMin, max: gapMax });

    //     // 🟥 ZONA C: debajo del tubo inferior (tubo empieza en bottomY)
    //     const abajoMin = bottomY + margen;
    //     const abajoMax = canvasH - bonusH - margen;

    //     if (abajoMax > abajoMin) zonas.push({ min: abajoMin, max: abajoMax });

    //     // elegir zona al azar
    //     const zona = zonas[Math.floor(Math.random() * zonas.length)];

    //     // valor final dentro de esa zona
    //     const bonusY = Math.floor(Math.random() * (zona.max - zona.min) + zona.min);

    //     // crear BONUS
    //     const bonus = new Bonus(
    //         this.ctx.canvas.width,
    //         bonusY,
    //         sprite,
    //         frameCount,
    //         frameWidth,
    //         frameHeight,
    //         scale
    //     );

    //     this.bonuses.push(bonus);
    // }





    // spawnBonus(topHeight, bottomY) {

    //     const canvasH = this.ctx.canvas.height;
    //     const canvasW = this.ctx.canvas.width;
    //     const margen = 20;

    //     // Tipo aleatorio
    //     const type = Math.random() < 0.5 ? "coin" : "star";

    //     let sprite, frameCount, frameWidth, frameHeight, scale;

    //     if (type === "coin") {
    //         sprite = this.coinSprite;
    //         frameCount = 10;
    //         frameWidth = this.coinFrameWidth;
    //         frameHeight = this.coinFrameHeight;
    //         scale = 0.1;
    //     } else {
    //         sprite = this.starSprite;
    //         frameCount = 12;
    //         frameWidth = this.starFrameWidth;
    //         frameHeight = this.starFrameHeight;
    //         scale = 0.8;
    //     }

    //     const bonusH = frameHeight * scale;
    //     const bonusW = frameWidth * scale;

    //     // ----------------------------------
    //     // OBTENER TUBO SUPERIOR REAL
    //     // ----------------------------------

    //     const topPipe = this.obstacles.find(o => o.type === "top");
    //     if (!topPipe) return; // seguridad

    //     const pipeX = topPipe.x;
    //     const pipeW = topPipe.width; // = 110

    //     // ----------------------------------
    //     // ZONAS ACTUALIZADAS
    //     // ----------------------------------

    //     const zonas = [];

    //     // --------------------------------------------------
    //     // 🟦 ZONA A (NUEVA): AL COSTADO DEL TUBO SUPERIOR
    //     // --------------------------------------------------

    //     const arribaYmin = margen;
    //     const arribaYmax = topHeight - bonusH - margen;

    //     if (arribaYmax > arribaYmin) {

    //         // izquierda
    //         const izqMin = margen;
    //         const izqMax = pipeX - bonusW - margen;

    //         if (izqMax > izqMin) {
    //             zonas.push({
    //                 xMin: izqMin,
    //                 xMax: izqMax,
    //                 yMin: arribaYmin,
    //                 yMax: arribaYmax
    //             });
    //         }

    //         // derecha
    //         const derMin = pipeX + pipeW + margen;
    //         const derMax = canvasW - bonusW - margen;

    //         if (derMax > derMin) {
    //             zonas.push({
    //                 xMin: derMin,
    //                 xMax: derMax,
    //                 yMin: arribaYmin,
    //                 yMax: arribaYmax
    //             });
    //         }
    //     }

    //     // --------------------------------------------------
    //     // 🟩 ZONA B: en el gap (como antes)
    //     // --------------------------------------------------

    //     const gapMin = topHeight + margen;
    //     const gapMax = bottomY - bonusH - margen;

    //     if (gapMax > gapMin) {
    //         zonas.push({
    //             xMin: canvasW - bonusW - margen,
    //             xMax: canvasW - bonusW - margen,
    //             yMin: gapMin,
    //             yMax: gapMax
    //         });
    //     }

    //     // --------------------------------------------------
    //     // 🟥 ZONA C: debajo del tubo inferior
    //     // --------------------------------------------------

    //     const abajoMin = bottomY + margen;
    //     const abajoMax = canvasH - bonusH - margen;

    //     if (abajoMax > abajoMin) {
    //         zonas.push({
    //             xMin: canvasW - bonusW - margen,
    //             xMax: canvasW - bonusW - margen,
    //             yMin: abajoMin,
    //             yMax: abajoMax
    //         });
    //     }

    //     // elegir zona
    //     const zona = zonas[Math.floor(Math.random() * zonas.length)];

    //     // elegir X e Y
    //     let bonusX;
    //     if (zona.xMin === zona.xMax) bonusX = zona.xMin;
    //     else bonusX = Math.random() * (zona.xMax - zona.xMin) + zona.xMin;

    //     const bonusY = Math.random() * (zona.yMax - zona.yMin) + zona.yMin;

    //     // crear BONUS
    //     const bonus = new Bonus(
    //         this.ctx.canvas.width,
    //         bonusY,
    //         sprite,
    //         frameCount,
    //         frameWidth,
    //         frameHeight,
    //         scale
    //     );

    //     this.bonuses.push(bonus);
    // }





}
