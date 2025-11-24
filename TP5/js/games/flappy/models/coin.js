// models/coin.js
import { BonusTypes } from "../core/bonusTypes.js";
import { Bonus } from "./bonus.js";

export class Coin extends Bonus {
    static defaultWidth = 5650 / 10 * 0.1;  // frameWidth * scale
    static defaultHeight = 566 * 0.1;        // frameHeight * scale
    static defaultColliderType = "circle";

    constructor(x, y, sprite) {
        super(x, y, "circle");

        this.sprite = sprite;

        this.frameCount = 10;
        this.frameWidth = 5650 / 10;
        this.frameHeight = 566;
        this.scale = 0.1;

        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

    }

    getEffectData() {
        return {
            type: BonusTypes.COIN,
            amount: 1
        };
    }

    /**
     * Método estático para crear un objeto con los atributos necesarios para un bonus "Coin".
     * Este método hereda de la clase base `Bonus` y devuelve un objeto con los atributos necesarios
     * para un bonus de tipo "Coin", con su tamaño y tipo de colisionador específicos.
     * 
     * @returns {Object} Objeto con los siguientes atributos:
     *   - `width`: El ancho del bonus "Coin", calculado a partir de la escala y el tamaño de los fotogramas.
     *   - `height`: La altura del bonus "Coin", también calculada a partir de la escala y el tamaño de los fotogramas.
     *   - `colliderType`: Tipo de colisionador para el bonus, en este caso siempre es "circle".
     */
    static createBonusData() {
    return super.createBonusData(Coin.defaultWidth, Coin.defaultHeight, Coin.defaultColliderType);;
    }
}
