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

const loginRegisters = [];

function cadastro(){
    var name = document.querySelector('input#name').value;
    var email = document.querySelector('input#email').value;
    var data_nasc = document.querySelector('input#data_nasc').value;
    var endereco = document.querySelector('input#endereco').value;
    var user_name = document.querySelector('input#user').value;
    var password = document.querySelector('input#password_user').value;
    var confirm_password = document.querySelector('input#confirm_password').value;

    var error = document.querySelector('p#error');
    error.style.color = 'red'

    if(name==='' || email==='' || data_nasc==='' || endereco===''){
        error.textContent = 'Todos os campos devem ser preenchidos!';
    }else if(password != confirm_password){
        error.textContent = 'As senhas devem ser iguais'
    }else{
        loginRegisters.push({'usuário':user_name,'senha':password})
        console.log(loginRegisters)
        window.alert('Direcionando para a próxima página!');
        location.href = '/templates/login.html'
    }

    
}

function login(){
    var user_name = document.getElementById('user');
    var password = document.getElementById('password');
    
        console.log(loginRegisters)
    for(let user of loginRegisters){
            if(user.usuário != user_name || password != user.senha){
                alert('Erro ! senha ou usuário inválidos')
            }else{
                location.href = '/templates/index.html'
            }
    }

    
}

