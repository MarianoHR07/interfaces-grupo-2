"use strict";

function initTweets(container) {
    // Tweets:
    const tweets = [
        {   text: '🔥 ¡Nuevos juegos en ' +
                '<span class="hashtag">#Gamix</span> ' + 
                '! 🎮. Prepárate para horas de diversión. ' +
                '<span class="hashtag">#Gaming</span> ' +
                '<span class="hashtag">#NuevosJuegos</span>', 
            publicationDay: "12:30 PM · Septiembre 15, 2025 ·"
        },
        {   text: 'Muy pronto agregaremos nuevos juegos y funciones para que te diviertas como nunca. 👾 ' +
                '<span class="hashtag">#Gamix</span> ', 
            publicationDay: "15:33 PM · Agosto 09, 2025 ·"
        },
        {   text: '🕹️ ¿Un ratito libre? Transformalo en horas de diversión con nuestros juegos online. ' +
                '<span class="hashtag">#Gamix</span> ',
            publicationDay: "13:11 PM · Agosto 01, 2025 ·"
        },
        {   text: '💥 Los clásicos que amás + los estrenos que estabas esperando. '+ 
                '<span class="hashtag">#Gamix</span> ',
            publicationDay: "17:44 PM · Julio 18, 2025 ·"
        },
        { text: '🔥 Nuevos desafíos diarios para que nunca te aburras. ' +
                '<span class="hashtag">#Gamix</span> ',
            publicationDay: "07:02 PM · Marzo 29, 2025 ·"
        },
        { text: '📢 Cada semana sumamos juegos nuevos para que nunca falte acción. ' +
                '<span class="hashtag">#Gamix</span> ',
            publicationDay: "09:43 PM · Abril 20, 2025 ·"
        }
    ];
    
    
    
    // Referencias al DOM:
    const tweetContainer = container.querySelector("#tweets-container");
    
    
    // Traigo el template desde tweet.html:
    fetch("components/tweet/tweet.html")
        .then(res => res.text())
        .then(html => {
            container.querySelector("#tweets-container").innerHTML = html;
    
            const template = container.querySelector("#tweet-template");
    
            tweets.forEach(tweet => {
                let clone = template.content.cloneNode(true);
                clone.querySelector(".tweet-text").innerHTML = tweet.text;
                clone.querySelector(".tweet-date").textContent = tweet.publicationDay;
                tweetContainer.appendChild(clone);
            });
        });

}


