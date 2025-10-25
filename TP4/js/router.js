"use strict";
import { initGameplay } from "./gameplay.js";
import { initLoading } from "./loading.js";
import { initHome } from "./home.js";
import { initBlocka } from "./games/blocka.js";
import { initPegSolitaire } from "./games/pegSolitaire/pegSolitaire.js";

// contenedor principal donde se cargan las páginas
const container = document.getElementById("container");

// ========================================
//              RUTEO PRINCIPAL
// ========================================

// Escucha cambios de URL (botón atrás/adelante)
window.addEventListener("popstate", () => {
    const page = getPageFromURL();
    loadPage(page);
});


// Devuelve el valor del parámetro ?page=
function getPageFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("page");
}

// Función para navegar (actualiza la URL y carga)
export function navigateTo(page) {
    history.pushState({}, "", `?page=${page}`);
    loadPage(page);
}


// ========================================
//              CARGA DE PÁGINAS
// ========================================

export function loadPage(page) {
    fetch(`./pages/${page}.html`)
        .then(res => {
            if (!res.ok) throw new Error(`No se encontró ${page}.html`);
            return res.text();
        })
        .then(html => {
            container.innerHTML = html;
            setupUI(page);
            setupPage(page);
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = "<p>Error al cargar la página</p>";
        });
}


// ========================================
//      CONFIGURACIONES GLOBALES 
// ========================================

function setupUI(page) {
    const sidebar = document.getElementById("sidebar-container");
    const hamburgerMenuLogin = document.querySelector(".header-menu-btn");
    const headerLogo = document.querySelector(".header-logo");
    const userIconHeader = document.querySelector(".header-user");
    const profileCard = document.querySelector(".profile-card");

    const loginPages = ["login", "register", "loading"];


    if (loginPages.includes(page)) {
        sidebar?.style.setProperty("display", "none");
        hamburgerMenuLogin?.style.setProperty("display", "none");
        if (headerLogo) {
        headerLogo.style.pointerEvents = "none";
        headerLogo.style.cursor = "default";
        }
        if (userIconHeader) {
        userIconHeader.style.display = "none";
        profileCard?.classList.remove("active");
        }
    } else {
        sidebar?.style.setProperty("display", "block");
        hamburgerMenuLogin?.style.setProperty("display", "block");
        if (headerLogo) {
        headerLogo.style.pointerEvents = "auto";
        headerLogo.style.cursor = "pointer";
        headerLogo.onclick = () => navigateTo("home");
        }
        if (userIconHeader) userIconHeader.style.display = "block";
    }
}


// ========================================
//   EVENTOS E INICIALIZADORES POR PÁGINA
// ========================================

function setupPage(page) {
    switch (page) {
        case "login":
            container.querySelector(".go-to-register")?.addEventListener("click", () => navigateTo("register"));
            container.querySelector(".login-button")?.addEventListener("click", () => navigateTo("loading"));
            if (typeof initValidation === "function") initValidation(container);
            break;

        case "loading":
            if (typeof initLoading === "function") initLoading(container);
            break;

        case "register":
            container.querySelectorAll(".go-to-login").forEach(el => el.addEventListener("click", () => navigateTo("login")));
            if (typeof initValidation === "function") initValidation(container);
            break;

        case "home":
            if (typeof initHome === "function") initHome(container);
            break;

        case "blocka":
            if (typeof initGameplay === "function") initGameplay(container);
            if (typeof initBlocka === "function") initBlocka(container);
            break;


        case "pegSolitaire":
            if(typeof initGameplay === "function") initGameplay(container);
            if(typeof initPegSolitaire === "function") initPegSolitaire();
            break;
    }
}

