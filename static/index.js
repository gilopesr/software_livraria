function getCart() {
    const cartJson = localStorage.getItem('shoppingCart');
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartDisplay(cart);
}

function addToCart(itemData) {
    const cart = getCart();

    const existingItem = cart.find(item => item.id === itemData.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: itemData.id,
            title: itemData.titulo,
            price: parseFloat(itemData.preco), 
            quantity: 1
        });
    }

    saveCart(cart);
}

function updateCartDisplay(cart) {
    const cartCountElement = document.querySelector('#cart-icon .count');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalValue = document.getElementById('cart-total-value');
    
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalUnits;
    }
    
    let total = 0;
    
    if (cartItemsList) {
        cartItemsList.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-message">Sua sacola está vazia.</p>';
        } else {
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const precoUnitarioFormatado = item.price.toFixed(2).replace('.', ',');
        
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');

        itemElement.innerHTML = `
            <p class="item-details">${item.title} (${item.quantity}x)</p>
            <span class="item-price-unitario">R$ ${precoUnitarioFormatado}</span>
            
            <button class="remove-item-btn" data-item-id="${item.id}">
                <i class="fa fa-trash"></i>
            </button>
        `;
        const removeButton = itemElement.querySelector('.remove-item-btn');
        if (removeButton) {
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                removeItemFromCart(item.id);
            });
        }
        
        cartItemsList.appendChild(itemElement);
    });
}}
    
    if (cartTotalValue) {
        cartTotalValue.textContent = total.toFixed(2).replace('.', ',');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buyButtons = document.querySelectorAll('.add-to-cart-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemData = {
                id: button.dataset.id,
                titulo: button.dataset.titulo,
                preco: button.dataset.preco
            };
            addToCart(itemData);
        });
    });

    updateCartDisplay(getCart());
    const cartIcon = document.getElementById('cart-icon');
    const cartCard = document.getElementById('cart-card');
    
    if (cartIcon && cartCard) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartCard.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!cartCard.contains(e.target) && !cartIcon.contains(e.target) && !cartCard.classList.contains('hidden')) {
                cartCard.classList.add('hidden');
            }
        });
    }
});

function removeItemFromCart(itemId) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === itemId);

    if (existingItemIndex > -1) {
        let item = cart[existingItemIndex];

        if (item.quantity > 1) {
            item.quantity -= 1;
            console.log(`Quantidade de ${item.title} reduzida para ${item.quantity}`);
        } else {
            cart.splice(existingItemIndex, 1);
            console.log(`${item.title} removido completamente.`);
        }
        saveCart(cart);
    }
}


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
        localStorage.setItem("Nome",user_name)
        window.alert('Direcionando para a próxima página!');
        location.href = '/login'
    }

    
}

// function login(){
//     var user_name = document.getElementById('user_name').value;
//     var password = document.getElementById('password').value;

//     var loginSucess = false

//             if(localStorage.getItem('Nome') === user_name || localStorage.getItem('senha')===password){
//                 loginSucess = true
//                 location.href = '/'
                            
//             }else if(localStorage.getItem('Nome') === '' ){
//                 window.alert('Primeiro realize o login!!')
//             }else if(user_name === '' || password === ''){
//                 window.alert('campos vazios')
//                 return
//             }
//             else{
//                window.alert('Usuário ou senha inválidos!')
//             }
//     }

    
// document.addEventListener('DOMContentLoaded',() => {
//     var make_login = document.querySelector('a#login')
//     var user_name = localStorage.getItem('Nome')
//     var logout = document.createElement('span')
//     var div_login = document.querySelector('div.login')

//     logout.style.color = 'red';
//     logout.textContent = 'sair';
//     logout.style.cursor = 'pointer';

//     if(make_login && user_name){
//         make_login.textContent = user_name + " | " 
//          div_login.appendChild(logout)

//          logout.addEventListener("click", function() {
//              make_login.textContent = 'Faça seu login';
//              localStorage.removeItem('Nome');
//              window.location.reload();
//          })
//     }
// }

// )
