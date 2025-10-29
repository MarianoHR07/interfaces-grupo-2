// ############################################
//       Carga y gestion de las imagenes
// ############################################

 export class AssetsManager {
    constructor() {
        this.images = {};
    }

    load(name, src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => { 
                this.images[name] = img; 
                res(img); 
            };
            img.onerror = rej;
            img.src = src;
        });
    }

    get(name) { return this.images[name]; }

    loadAll(list) {
        return Promise.all(list.map(item => this.load(item.name, item.src)));
    }
}


// window.AssetsManager = AssetsManager;


