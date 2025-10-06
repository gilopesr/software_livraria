document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById("search-input");
    const searchIcon = document.getElementById("search-icon");
    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }

    // Seletor para todos os botões de "Comprar" na página
    const buyButtons = document.querySelectorAll('.card button');
    
    // Seletor para o elemento que exibe a contagem do carrinho
    const cartCountElement = document.querySelector('.cart .count');

    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Converte o texto da contagem para um número
            let currentCount = parseInt(cartCountElement.textContent, 10);

            currentCount += 1;

            cartCountElement.textContent = currentCount;
        });
    });
});


async function performSearch(termo) {
    if (!termo) {
        alert("Por favor, digite um termo de busca.");
        return;
    }

    try {
        // Tenta a busca por ISBN
        if (/^\d+$/.test(termo)) {
            window.location.href = `/livros/${termo}`;
            return;
        }

        // Tenta a busca por autor
        const urlAutor = `/autor/${encodeURIComponent(termo)}/livros`;
        const resAutor = await fetch(urlAutor);
        if (resAutor.ok) {
            window.location.href = urlAutor;
            return;
        }

        // Tenta a busca por título
        const urlTitulo = `/livros/titulo/${encodeURIComponent(termo)}`;
        const resTitulo = await fetch(urlTitulo);
        if (resTitulo.ok) {
            window.location.href = urlTitulo;
            return;
        }

        alert("Nenhum resultado encontrado para o termo de busca.");

    } catch (err) {
        console.error("Erro na busca:", err);
        alert("Ocorreu um erro ao tentar realizar a busca.");
    }
}


//CARROSSEL

let slideIndex = 1;
let autoTimeout;

function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");

    if (n > slides.length) {
        slideIndex = 1;
    }

    if (n < 1) {
        slideIndex = slides.length;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    if (slides.length > 0) {
        slides[slideIndex - 1].style.display = "block";  
        dots[slideIndex - 1].className += " active";
    }
}

window.currentSlide = function(n) {
    clearTimeout(autoTimeout); // Cancela o auto-rotate ao interagir
    showSlides(slideIndex = n);
    // Reinicia o auto-rotate após a interação
    autoTimeout = setTimeout(autoRotate, 5000); 
}

function autoRotate() {
    showSlides(slideIndex += 1);
    autoTimeout = setTimeout(autoRotate, 5000); // 5 segundos de espera
}

// Inicia o carrossel no carregamento da janela
window.onload = function() {
    showSlides(slideIndex);
    autoTimeout = setTimeout(autoRotate, 5000);
};
