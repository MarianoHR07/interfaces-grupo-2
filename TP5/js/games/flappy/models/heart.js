// models/heart.js
import { BonusTypes } from "../core/bonusTypes.js";
import { Bonus } from "./bonus.js";

export class Heart extends Bonus {
    static defaultWidth = 1036 / 14 * 0.7;  // frameWidth * scale
    static defaultHeight = 66 * 0.7;        // frameHeight * scale
    static defaultColliderType = "circle";

    constructor(x, y, sprite) {
        super(x, y, "circle");

        this.sprite = sprite;

        this.frameCount = 14;
        this.frameWidth = 1036 / 14;
        this.frameHeight = 66;
        this.scale = 0.7;

        this.width = this.frameWidth * this.scale;
        this.height = this.frameHeight * this.scale;

    }

    getEffectData() {
        return {
            type: BonusTypes.HEART,
            heal: 1
        };
    }

    /**
     * Método estático para crear un objeto con los atributos necesarios para un bonus "Heart".
     * Este método hereda de la clase base `Bonus` y devuelve un objeto con los atributos necesarios
     * para un bonus de tipo "Heart", con su tamaño y tipo de colisionador específicos.
     * 
     * @returns {Object} Objeto con los siguientes atributos:
     *   - `width`: El ancho del bonus "Heart", calculado a partir de la escala y el tamaño de los fotogramas.
     *   - `height`: La altura del bonus "Heart", también calculada a partir de la escala y el tamaño de los fotogramas.
     *   - `colliderType`: Tipo de colisionador para el bonus, en este caso siempre es "circle".
     */
    static createBonusData() {
    return super.createBonusData(Heart.defaultWidth, Heart.defaultHeight, Heart.defaultColliderType);
    }
}
