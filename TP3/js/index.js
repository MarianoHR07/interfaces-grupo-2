"use strict";
// ================================
// IMPORTS DE COMPONENTES GLOBALES
// ================================
import "./../components/header/header.js";
import "./../components/sidebar/sidebar.js";
import "./../components/footer/footer.js";
import "./../components/background/background.js";

// ================================
//   IMPORT DEL ROUTER PRINCIPAL
// ================================
import { loadPage } from "./router.js";

// ================================
//      INICIALIZACIÓN GLOBAL
// ================================
document.addEventListener("DOMContentLoaded", () => {
    // carga la página actual o la default (login)
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") || "login";
    loadPage(page, false);
});

 
export { loadPage };

