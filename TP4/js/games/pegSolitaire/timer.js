// ###########################
//      clase cronometro
// ###########################


export class Timer {
    constructor(limitSec, displayEl, onEnd) {
        this.limit = limitSec;
        this.timeLeft = limitSec;
        this.interval = null;
        this.displayEl = displayEl;
        this.onEnd = onEnd;
    }

    start() {
        this.stop();
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onEnd) this.onEnd();
            }
        }, 1000);
        this.updateDisplay();
    }

    stop() { if (this.interval) { clearInterval(this.interval); this.interval = null; } }

    reset() { this.timeLeft = this.limit; this.updateDisplay(); }

    updateDisplay() {
        const mm = Math.floor(this.timeLeft/60).toString().padStart(2,'0');
        const ss = (this.timeLeft%60).toString().padStart(2,'0');
        if (this.displayEl) this.displayEl.textContent = `${mm}:${ss}`;
    }
}

// window.Timer = Timer;

