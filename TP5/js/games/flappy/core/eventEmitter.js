// core/eventEmitter.js
export class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(event, handler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            for (const handler of this.listeners[event]) {
                handler(data); // dispara el handler y le pasa data por parametro (data lo transmite el emisor )
            }
        }
    }
}
