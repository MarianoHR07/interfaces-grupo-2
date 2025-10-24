"use strict";
import { initGameplay } from "./gameplay.js";
import { initLoading } from "./loading.js";

document.addEventListener("DOMContentLoaded", () => {
    loadPage("login.html");
});

// contenedor principal donde se cargan las páginas
const container = document.getElementById("container");

export function loadPage(page) {

// función que carga un html dentro del contenedor
// function loadPage(page, addToHistory = true) {
    fetch(`${page}`)
        .then(res => res.text())
        .then(html => {
            const vaciar_principal=document.getElementById("container");
            vaciar_principal.innerHTML="";
            container.innerHTML = html;
            setupEvents(page);  // después de cargar, engancho los eventos de esa página
        })
}

// seteo los eventos según la página actual
function setupEvents(page) {
    const sidebar = document.getElementById("sidebar-container");
    const hamburgerMenuLogin = document.querySelector(".header-menu-btn");
    const headerLogo = document.querySelector(".header-logo");
    const userIconHeader = document.querySelector(".header-user");
    const profileCard = document.querySelector(".profile-card");

    if (["login.html", "register.html", "loading.html"].includes(page)) {
        if (sidebar) sidebar.style.display = "none";
        if (hamburgerMenuLogin) hamburgerMenuLogin.style.display = "none";
        if (headerLogo) {
            headerLogo.style.pointerEvents = "none"; // Desactiva clics
            headerLogo.style.cursor = "default";     // Cambia el cursor
        }
        if(userIconHeader) {
            userIconHeader.style.display = "none";
            if (profileCard && profileCard.classList.contains("active")) {
                profileCard.classList.remove("active");
            }
        }
    }else {
        if (sidebar) sidebar.style.display = "block";
        if (hamburgerMenuLogin) hamburgerMenuLogin.style.display = "block";
        if (headerLogo) {
            headerLogo.style.pointerEvents = "auto"; // Reactiva clics
            headerLogo.style.cursor = "pointer";
            headerLogo.addEventListener("click", () => loadPage("home.html"));
        }
        if(userIconHeader) userIconHeader.style.display = "block";
    }

    if (["home.html", "gameplay.html"].includes(page)) {
        const closeSesion = document.querySelector(".close-sesion");
        closeSesion.addEventListener("click", () =>{
            loadPage("login.html");
        });
    }


    if (page === "login.html") {
        const registerLink = container.querySelector(".go-to-register");
        const loginBtn = container.querySelector(".login-button");
        // const background = document.querySelector(".game-grid");
        // console.log(background);
        // const fragmentoDeTemplate = templateElemento.content; 

        if (registerLink) {
            registerLink.addEventListener("click", () => loadPage("register.html"));
        }

        if (loginBtn) {
            loginBtn.addEventListener("click", () => loadPage("loading.html"));
        }

        /*if (background) {
            // Verifica que el fragmento exista antes de clonar
            if (fragmentoDeTemplate) { 
                const clon = fragmentoDeTemplate.cloneNode(true); 
                background.appendChild(clon);
            }
        }*/
        
        if (typeof initValidation === "function") {
            initValidation(container); // engancho la lógica del js de login
        }

            
    }

    if(page =="loading.html"){
        if (typeof initLoading === "function") {
            initLoading(container); // engancho la lógica del js de loading
        }
    }

    if (page === "register.html") {
        const backToLogin = container.querySelectorAll(".go-to-login");
        if (backToLogin) {
            backToLogin.forEach(element => {
                element.addEventListener("click", () => loadPage("login.html"));
            });
        }

        if (typeof initValidation === "function") {
            initValidation(container); // engancho la lógica del js de register
        }
    }

    if (page === "home.html") {
        const playBtn = container.querySelector(".play-peg-solitaire");
        if (playBtn) {
            playBtn.addEventListener("click", () => loadPage("gameplay.html"));
        }

        if (typeof initHome === "function") {
            initHome(container); // engancho la lógica del js de home
        }
    }

    if (page === "gameplay.html") {
        const returnHome = container.querySelector(".return-home");
        if (returnHome) {
            returnHome.addEventListener("click", () => loadPage("home.html"));
        }

        if (typeof initGameplay === "function") {
            initGameplay(container); // engancho la lógica del js de gameplay
        }
    }
}


 
