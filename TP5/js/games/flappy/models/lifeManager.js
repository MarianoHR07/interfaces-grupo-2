// lifeManager.js
export class LifeManager {
    constructor(maxLives = 3) {
        this.maxLives = maxLives;
        this.currentLives = maxLives;
    }

    loseLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
        }
        return this.currentLives;
    }

    gainLife() {
        if (this.currentLives < this.maxLives) {
            this.currentLives++;
        }
        return this.currentLives;
    }

    setLives(lives) {
        if (lives < 0) lives = 0;
        if (lives > this.maxLives) lives = this.maxLives;
        this.currentLives = lives;
    }
}
