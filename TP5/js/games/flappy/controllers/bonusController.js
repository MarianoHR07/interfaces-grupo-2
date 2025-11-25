// controllers/bonusController.js
import { EventEmitter } from "../core/eventEmitter.js";
import { BonusTypes } from "../core/bonusTypes.js";
import { BonusView } from "../views/bonusView.js";  

import { Bonus } from "../models/bonus.js";
import { Star } from "../models/star.js";
import { Coin } from "../models/coin.js";
import { Heart } from "../models/heart.js";
 

export class BonusController extends EventEmitter{
    constructor(ctx, spawnArea = {minY:0, maxY:0, x:0}, speed = -150) {
        super();

         /** Sprites de cada bonus */
        this.coinSprite = this._loadSprite("coin-spritesheet.png");
        this.starSprite = this._loadSprite("star-spritesheet.png");
        this.heartSprite = this._loadSprite("heart-spritesheet.png");

        /** @type {BonusView} vista de los bonus */
        this.bonusView = new BonusView(ctx);
        
        /** Datos de spawn */
        this.spawnArea = spawnArea;        // { minY, maxY, x }
        this.speed = speed;                // velocidad de desplazamiento lateral
        
        /** Lista de bonus activos */
        this.bonuses = [];

        /** Configuración de spawn */
        this.spawnCooldown = 1500;         // ms entre bonus posibles
        this.spawnTimer = 0;

        // probabilidades de aparición
        this.spawnTable = [
            { type: BonusTypes.COIN,  chance: 0.65 },
            { type: BonusTypes.HEART, chance: 0.05 },
            { type: BonusTypes.STAR,  chance: 0.3 }
        ];
        // this.spawnTable = [
        //     { type: BonusTypes.COIN,  chance: 0.0 },
        //     { type: BonusTypes.HEART, chance: 0.0 },
        //     { type: BonusTypes.STAR,  chance: 1 }
        // ];

        // this.onBonusTaken = onBonusTaken;
    }

     /** Carga de sprites */
    _loadSprite(fileName) {
        const img = new Image();
        img.src = `js/games/flappy/assets/images/bonus/${fileName}`;
        return img;
    }

    reset() {
        this.bonuses = [];
        this.spawnTimer = 0;
    }

    /** El GameController llama a esto cada frame */
    update(deltaTime) {
        // actualizar todos los bonus (animación + movimiento)
        for (const bonus of this.bonuses) {
            bonus.update(deltaTime, this.speed);
        }

        // limpiar bonus activos
        this.bonuses = this.bonuses.filter(b => b.active || !b.flashFinished);

        // manejar el cooldown del spawneo
        // this.spawnTimer += deltaTime;
        // if (this.spawnTimer >= this.spawnCooldown) {
        //     this.spawnTimer = 0;
        //     this.spawnBonus();
        // }
    }

    draw() {
        this.bonuses.forEach(b => this.bonusView.draw(b));
    }

    /**
     * Devuelve los datos de un bonus sin instanciarlo.
     * 
     * @param {typeof Bonus | String} type - Clase del bonus a obtener (Heart, Coin, Star).
     * @returns {Object} Objeto con los atributos del bonus:
     *   - `width`: Ancho del bonus.
     *   - `height`: Alto del bonus.
     *   - `colliderType`: Tipo de colisionador ("circle", "rect", etc.).
     */
    getBonusData(type) {
        switch (type) {
            case BonusTypes.STAR:
                return Star.createBonusData();

            case BonusTypes.HEART:
                return Heart.createBonusData();

            case BonusTypes.COIN:
                return Coin.createBonusData();
            default:
                console.warn("getBonusData: tipo inválido o falta createBonusData()", type);
                return null;     
        }
    }
    /**
     * Selecciona aleatoriamente un tipo de bonus utilizando
     * probabilidades acumuladas definidas en `spawnTable`.
     *
     * @returns {string} Uno de los valores de BonusTypes:
     *   - BonusTypes.COIN
     *   - BonusTypes.HEART
     *   - BonusTypes.STAR
     *
     * Este método devuelve un string que representa el tipo del bonus.
     */
    pickBonusType() {
        const r = Math.random();
        let acc = 0;

        for (const entry of this.spawnTable) {
            acc += entry.chance;
            if (r <= acc) {
                return entry.type;
            }
        }
        
        return BonusTypes.COIN; // fallback por si la suma no cubre el rango [0,1]
    }

    _typeToClass(type) {
        switch(type) {
            case BonusTypes.HEART: return Heart;
            case BonusTypes.STAR:  return Star;
            case BonusTypes.COIN: 
            default: return Coin;
        }
    }

    /**
     * Crea una instancia de bonus según el tipo recibido.
     *
     * @param {string} type - Uno de los valores de BonusTypes:
     *   - BonusTypes.COIN
     *   - BonusTypes.HEART
     *   - BonusTypes.STAR
     *   - ...
     *   - BonusTypes.OTHER_BONUS
     *
     * @returns {typeof Bonus} Una instancia del bonus correspondiente.
     */
    createBonus(type) {
        const y = this.randomY();

        switch (type) {
            case BonusTypes.STAR:
                return new Star(this.spawnArea.x, y, this.starSprite);

            case BonusTypes.HEART:
                return new Heart(this.spawnArea.x, y, this.heartSprite);

            case BonusTypes.COIN:
            default:
                return new Coin(this.spawnArea.x, y, this.coinSprite);
        }
    }
   
    
    /**
     * Spawnea un bonus en la posición definida por `spawnArea` y se suscribe automáticamente al evento `COLLECT`.
     * @param {String} type - debe pertenecer a alguno de los valores de BonusTypes
     * @returns {Star | Coin | Heart | null}
     */
    spawnBonus(type, spawnArea) {
        this.updateSpawnArea(spawnArea);
        const bonus = this.createBonus(type);
        if (!bonus) return null;

        // suscripción automática al evento del bonus
        // El bonus avisa cuando es tomado → BonusController reemite evento
        bonus.events.on("COLLECT", (effect) => {
            this.handleEffect(effect);
        });
        // cuando se recolecta → remover del controller
        bonus.events.on("REMOVE", (bonus) => {
            this.removeBonus(bonus);
        });

        this.bonuses.push(bonus);
        return bonus;
    }

    removeBonus(bonus) {
        const i = this.bonuses.indexOf(bonus);
        if (i >= 0) this.bonuses.splice(i, 1);
    }

    /**
     * Actualiza la zona donde se puede generar el bonus.
     * 
     * Esta zona se utiliza para determinar la posición vertical (`y`) 
     * y horizontal (`x`) de un bonus cuando se spawnea.
     * 
     * @param {Object} spawnArea - Objeto que define la zona de spawn.
     * @param {number} spawnArea.minY - Límite superior de la zona vertical.
     * @param {number} spawnArea.maxY - Límite inferior de la zona vertical.
     * @param {number} spawnArea.x - Posición horizontal donde se generará el bonus.
     */
    updateSpawnArea(area) {
        if (!area || typeof area !== "object") return;

        const { minY, maxY, x } = area;

        this.spawnArea = {
            minY: typeof minY === "number" ? minY : this.spawnArea.minY,
            maxY: typeof maxY === "number" ? maxY : this.spawnArea.maxY,
            x: typeof x === "number" ? x : this.spawnArea.x,
        };
    }


     /** Devuelve un Y aleatorio dentro del área de spawn: entre `minY` y `maxY` */
    randomY() {
        const { minY, maxY } = this.spawnArea;
        return minY + Math.random() * (maxY - minY);
    }

    /** 
     * Notifica que un bonus fue tomado.
     * Emite el evento "bonus-taken" para que el GameController,
     * HUD, sonidos u otros sistemas reaccionen.
     */
    handleEffect(effect) {
        this.emit("bonus-taken", effect);
    }
 
}
