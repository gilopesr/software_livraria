// =======================================================
// LÓGICA DE BUSCA
// =======================================================

const input = document.getElementById("search-input");
const resultado = document.getElementById("resultado");

/**
 * Realiza a busca por livro, tentando ISBN, Autor e Título em sequência.
 * @param {string} termo O termo de busca inserido pelo usuário.
 * @returns {Promise<string>} O conteúdo HTML renderizado pelo backend ou uma mensagem de erro.
 */
async function performSearch(termo) {
    try {
        let res;

        // 1. Tenta a busca por ISBN (somente números)
        if (/^\d+$/.test(termo)) {
            res = await fetch(`/livros/${parseInt(termo)}`);
            if (res.ok) {
                return await res.text();
            }
        }

        // 2. Tenta a busca por autor
        // Usamos encodeURIComponent para garantir que nomes com espaços ou caracteres especiais funcionem na URL
        res = await fetch(`/autor/${encodeURIComponent(termo)}/livros`);
        if (res.ok) {
            return await res.text();
        }

        // 3. Tenta a busca por título (busca parcial)
        res = await fetch(`/livros/titulo/${encodeURIComponent(termo)}`);
        if (res.ok) {
            return await res.text();
        }

        // Se nenhuma das tentativas anteriores retornar sucesso (código 200), lança erro.
        throw new Error("Nenhum resultado encontrado.");

    } catch (err) {
        // Captura a mensagem de erro do backend (se houver) e exibe
        // Esta parte é para tentar limpar a mensagem de erro que pode vir com status HTTP
        let errorMessage = err.message;
        if (errorMessage.includes('", 404')) {
             errorMessage = errorMessage.replace('", 404', '').replace('Error: ', '');
        } else if (errorMessage.startsWith("Error: ")) {
             errorMessage = errorMessage.substring(7); // Remove apenas "Error: "
        }
        
        return `<p style="color:red; text-align: center; margin-top: 20px;">${errorMessage}</p>`;
    }
}

// Listener no input ao pressionar Enter
input.addEventListener("keydown", async function(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const termo = input.value.trim();
    if (!termo) return;

    // Limpa resultados anteriores e adiciona um loader simples
    resultado.innerHTML = '<p style="text-align: center; margin-top: 20px;">Buscando...</p>';

    const htmlContent = await performSearch(termo);
    resultado.innerHTML = htmlContent;
});

// Listener no ícone de busca
document.getElementById("search-icon").addEventListener("click", async function() {
    const termo = input.value.trim();
    if (!termo) return;
    
    // Limpa resultados anteriores e adiciona um loader simples
    resultado.innerHTML = '<p style="text-align: center; margin-top: 20px;">Buscando...</p>';

    const htmlContent = await performSearch(termo);
    resultado.innerHTML = htmlContent;
});


// =======================================================
// LÓGICA DO CARROSSEL (SLIDESHOW)
// =======================================================

let slideIndex = 1;
let autoTimeout;

/**
 * Exibe a imagem de banner correspondente ao índice.
 * @param {number} n O índice do slide a ser mostrado.
 */
function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    
    // Se passar do último slide, volta para o primeiro
    if (n > slides.length) {
        slideIndex = 1;
    }
    // Se for antes do primeiro slide, vai para o último
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    // Esconde todos os slides
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // Remove a classe 'active' de todos os pontos
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // Exibe o slide atual e marca o ponto correspondente
    if (slides.length > 0) {
        slides[slideIndex - 1].style.display = "block";  
        dots[slideIndex - 1].className += " active";
    }
}

/**
 * Avança ou retrocede o slide. Chamado pelos botões Prev/Next.
 * @param {number} n 1 para avançar, -1 para retroceder.
 */
window.plusSlides = function(n) {
    clearTimeout(autoTimeout); // Cancela o auto-rotate ao interagir
    showSlides(slideIndex += n);
    // Reinicia o auto-rotate após a interação
    autoTimeout = setTimeout(autoRotate, 5000); 
}

/**
 * Define o slide atual. Chamado pelos indicadores (pontos).
 * @param {number} n O índice do slide para ir.
 */
window.currentSlide = function(n) {
    clearTimeout(autoTimeout); // Cancela o auto-rotate ao interagir
    showSlides(slideIndex = n);
    // Reinicia o auto-rotate após a interação
    autoTimeout = setTimeout(autoRotate, 5000); 
}

/**
 * Lógica para rotação automática dos slides.
 */
function autoRotate() {
    showSlides(slideIndex += 1); // Avança um slide
    // Chama a si mesma para continuar a rotação
    autoTimeout = setTimeout(autoRotate, 5000); // 5 segundos de espera
}

// Inicia o carrossel no carregamento da janela
window.onload = function() {
    // Garante que o carrossel inicie corretamente
    showSlides(slideIndex);
    // Inicia a rotação automática
    autoTimeout = setTimeout(autoRotate, 5000); // 5 segundos de espera
};
