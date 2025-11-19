import { Obstacle } from '../models/obstacle.js';
import { ObstacleView } from '../views/obstacleView.js';

import { Runner } from "../models/runner.js";
import { RunnerView } from "../views/runnerView.js";

import { Bonus } from "../models/bonus.js";
import { BonusView } from "../views/bonusView.js";

export class GameController {
    constructor(ctx) {
        this.ctx = ctx;

        // **************VER DE LLEVAR A UNA CLASE EN COMUN PARA BONUS Y OBSTACLE***************
        this.speed = 150; // px/s hacia la izquierda (es equivalente a vx = -150)
        // *****************(velocidad comun para bonus y obstacle)*****************************

        this.obstacleView = new ObstacleView(ctx);
        this.obstacles = [];

        this.spawnInterval = 2000; // cada 2 segundos
        this.distancePipes = this.speed * (this.spawnInterval / 1000);   // distancia entre dos tuberias
        this.lastSpawn = 0;

        this.gap = 150; // distancia entre top y bottom
        this.minHeight = 80;
        this.maxHeight = 300;

        // ------------- cargar tuberias ---------------
        this.imgTop = new Image();
        this.imgTop.src = 'js/games/flappy/assets/images/obstacle/obstaculo_superior.png';

        this.imgBottom = new Image();
        this.imgBottom.src = 'js/games/flappy/assets/images/obstacle/obstaculo_inferior.png';

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
        // generar obstáculos nuevos
        if (timestamp - this.lastSpawn > this.spawnInterval) {
            this.spawnPair();
            this.lastSpawn = timestamp;
        }

        // actualizar obstáculos
        this.obstacles.forEach(o => o.update(deltaTime, this.speed));

        // eliminar los que ya salieron de pantalla
        this.obstacles = this.obstacles.filter(o => o.active);

        // Runner
        this.runner.update();

        // Limite con el suelo(CAMBIAR:::: para que al colicionar con el techo o el suelo explote) <<<=============================
        const bottomLimit = this.ctx.canvas.height - this.runner.frameHeight * this.runner.scale;
        if(this.runner.y > bottomLimit){
            this.runner.y = bottomLimit;
            this.runner.velocityY = 0;
        }

        // Limite con el techo
        if (this.runner.y < 0) {
            this.runner.y = 0;
            this.runner.velocityY = 0; 
        }

        // actualizar bonus (animación + movimiento)
        this.bonuses.forEach(b => b.update(deltaTime, this.speed));
        this.bonuses = this.bonuses.filter(b => b.active);
    }

    // renderiza el estado actual del juego en la pantalla
    draw() {
        this.obstacles.forEach(o => this.obstacleView.draw(o));

        this.runnerView.draw();

        this.bonuses.forEach(b => this.bonusView.draw(b));
    }

    spawnPair() {
        const canvasHeight = this.ctx.canvas.height;

        // altura aleatoria para el top
        // topHeight ∈ [minHeight, maxHeight]
        const topHeight = Math.floor(
            Math.random() * (this.maxHeight - this.minHeight) + this.minHeight
        );
        // Ejemplo: 
        // Sean: minHeight=50, maxHeight=300
        //       topHeight ∈ [50, 300]
        // (maxHeight - minHeight) = 250 nos da el rango de variación
        // Math.random() * (maxHeight - minHeight) ∈ [0, 250]
        // + minHeight desplaza el rango a [50, 300]

        const bottomY = topHeight + this.gap;

        // crear obstáculos arriba
        const top = new Obstacle(
            this.ctx.canvas.width,
            topHeight - this.imgTop.height,
            'top',
            this.imgTop
        );

        // crear obstáculos abajo
        const bottom = new Obstacle(
            this.ctx.canvas.width,
            bottomY,
            'bottom',
            this.imgBottom
        );

        this.obstacles.push(top, bottom);

        // BONUS: 40% de probabilidad de generar un bonus
        if (Math.random() < 0.7) {
            this.spawnBonus(topHeight, bottomY);
        }
    }


    spawnBonus(topHeight, bottomY) {
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



}
