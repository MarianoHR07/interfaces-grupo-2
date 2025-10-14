"use strict";

function initComments(container) {
    // Comentarios antiguos:
    const comments = [
        { nameUser: "thiaguitoxd", publicationDay: "7 de Enero", likes: 553, description: "juegazooo" },
        { nameUser: "Patatasss", publicationDay: "22 de Marzo", likes: 3498, description: "Me encanta el juego pero los anuncios lo hacen insufrible." },
        { nameUser: "ElChulo232", publicationDay: "10 de Junio", likes: 267, description: "Muy pasado de moda." },
        { nameUser: "PaulitaPiola5", publicationDay: "2 de Julio", likes: 5000, description: "Que gran juego!! Se lo recomende a mi madre que es fanatica del Peg Solitaire, no entendio nada pero dijo que se veia muy lindo." },
        { nameUser: "Mario1233", publicationDay: "23 de Septiembre", likes: 881, description: "Muy divertido, aunque no me guste Minecraft." }
    ];
    
    
    // Referencias al DOM:
    const commentsContainer = container.querySelector("#comments-others");
    const input = container.querySelector(".input-opinion");
    const postBtn = container.querySelector(".post-button");
    
    
    // Cargo el template desde game-comment.html
    fetch("components/game-comment/game-comment.html")
        .then(res => res.text())
        .then(html => {
            // const temp = container.createElement("div");
            const temp = document.createElement("div");
            
            temp.innerHTML = html;
            container.appendChild(temp.firstElementChild);
    
            const template = container.querySelector("#comment-template");
    
            // Render inicial de comentarios
            comments.forEach(c => renderComment(c, template));
    
            // Evento para Postear
            postBtn.addEventListener("click", () => {
                const text = input.value.trim();
                if (text !== "") {
                    const newComment = {
                        nameUser: "Random-222", 
                        publicationDay: getCurrentDate(),
                        likes: 0,
                        description: text
                    };
                    renderComment(newComment, template);
    
                    input.value = ""; // vacio el input luego de postear
                }
            });
        });
    
    // Funcion que devuelve el dia actual
    function getCurrentDate() {
      const date = new Date();
    
      const day = date.getDate();
      const month = date.toLocaleDateString("es-AR", { month: "long" });
      
      const uppercaseMonth = month.charAt(0).toUpperCase() + month.slice(1);    // que el mes comience en mayuscula
      
      return `${day} de ${uppercaseMonth}`;
    }
    
    // Función para clonar el template y rellenarlo
    function renderComment(comment, template) {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".name-user").textContent = comment.nameUser;
        clone.querySelector(".publication-day").textContent = comment.publicationDay;
        clone.querySelector(".number-of-likes").textContent = comment.likes;
        clone.querySelector(".comment-description").textContent = comment.description;
    
        const likeBtn = clone.querySelector(".likeCommentBtn");
        const likeCount = clone.querySelector(".number-of-likes");
    
        let likes = comment.likes
    
        likeBtn.addEventListener("click", () => {
            likeBtn.classList.toggle("active");
    
            if (likeBtn.classList.contains("active")) {
                likes++;
            } else {
                likes--;
            }
    
            likeCount.textContent = likes;
        });
    
        commentsContainer.prepend(clone);
    }

}

