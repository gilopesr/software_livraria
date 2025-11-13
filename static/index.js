document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');

    if (searchInput && searchIcon) {
        
        searchIcon.addEventListener('click', () => {
            const termo = searchInput.value.trim();
            performSearch(termo);
        });

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const termo = searchInput.value.trim();
                performSearch(termo);
            }
        });
    }
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
            quantity: 1,
            url_img: itemData.url_img
        });
    }

    saveCart(cart);
}

/* */function updateCartDisplay(cart) {
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
        }else  {

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
                preco: button.dataset.preco,
                url_img: button.dataset.url_img
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

///// VERIFICAÇÃO LOGIN 
document.addEventListener('DOMContentLoaded', function() {
    const checkoutButton = document.getElementById('checkout-button');
    const loginPageUrl = '/login';
    const checkoutPageUrl = '/checkout.html';

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function(event) {
            event.preventDefault(); 
            
            const estaLogado = await isUserLoggedIn();
            
            if (estaLogado) {
                // Usuáriologado: redireciona para a página de checkout
                window.location.href = checkoutPageUrl;
            } else {
                // Usuário NÃO logado: redireciona para a página de login
                window.location.href = loginPageUrl + '?next=' + encodeURIComponent(checkoutPageUrl);
            }
        });
    }
});


async function isUserLoggedIn() {
    try {
        const response = await fetch('/status_login'); 
        if (!response.ok) {
            console.error('Erro na resposta do servidor:', response.statusText);
            return false;
        }

        const data = await response.json();
        return data.logged_in; 

    } catch (error) {
        console.error('Erro ao verificar status de login:', error);
        return false; 
    }
}


//// FINALIZAR COMPRA 
/**
 * * Envia os dados do pedido para a API, finalizando a transação.
 * * @param {object} enderecoData - O objeto contendo o CEP, numero, complemento, etc., do formulário.
 */
async function finalizarCompra(enderecoData) {
    const cart = getCart();
    
    // 1. Verificação de Carinho Vazio (Safety Check)
    if (cart.length === 0) {
        alert("Seu carrinho está vazio.");
        window.location.href = '/'; 
        return;
    }
    
    // 2. Mapeamento dos Itens para o Formato Esperado pela API
    // A API espera 'id_livro' e 'quantidade'
    const itensParaAPI = cart.map(item => ({
        id_livro: item.id,      
        quantidade: item.quantity
    }));

    // 3. Montagem do Payload JSON Completo
    const payload = {
        endereco: enderecoData, 
        itens: itensParaAPI
    };

    try {
        // 4. Chamada à API (Backend Python)
        const response = await fetch('/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            // 🚀 SUCESSO (Status 201)
            
            // 5. Limpeza do Carrinho e Redirecionamento
            saveCart([]); // Esvazia o carrinho APENAS após a confirmação do servidor!
            
            // Redireciona para a página de confirmação usando o ID do novo pedido
            window.location.href = '/pedido_concluido.html?id=' + result.id_pedido;
        } else {
            // ❌ FALHA (Status 4xx ou 5xx)
            // A mensagem de erro da API (ex: "Estoque insuficiente") é exibida
            alert("Não foi possível concluir o pedido. Erro: " + result.message);
            // O carrinho PERMANECE intacto
        }

    } catch (error) {
        console.error('Erro de rede ao finalizar compra:', error);
        alert("Erro de conexão com o servidor. Verifique sua rede e tente novamente.");
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


function shoppingCart(){
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const tableBody = document.getElementById("cart-table-body");
    const totalDisplay = document.getElementById("final-total");
    const subtotal = document.getElementById("subtotal");
    const delivery = document.getElementById("delivery");
    const total = document.getElementById("total");

    tableBody.innerHTML = '';
    let totalFinal = 0;
    const taxa = 9.67;
    let subtotalProduct = 0;

    if(cart.length ===0){
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Não há livro cadastrado ainda!!</tr>';
        if(totalDisplay) totalDisplay.textContent = 'R$ 0,00';
        if(subtotal) subtotal.textContent = 'R$ 0,00';
        if(delivery) delivery.textContent = `R$ ${taxa.toFixed(2).replace(".",",")}`;
        if(total) total.textContent = 'R$ 0,00';
        return 
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotalProduct += itemTotal

        const priceFormat = item.price ? item.price.toFixed(2).replace('.',',') :'0,00';
        const itemTotalFormat = itemTotal.toFixed(2).replace('.',',');

        const row = document.createElement('tr');
        row.innerHTML = `
        <td><img src=${item.url_img} alt="imagem do livro" style="height:150px; width:150px;"></td>
        <td>${item.title}</td>
        <td>R$: ${priceFormat}</td>
        <td>${item.quantity || 1}</td>
        <td>${itemTotalFormat}</td>
        `;
        

        tableBody.appendChild(row);
    })
    const totalOfBuy = taxa + subtotalProduct


    if(totalDisplay){
        totalDisplay.textContent = `R$ ${totalFinal.toFixed(2).replace('.',',')}`;
    }
    if(subtotal){
        const subtotalFormat = subtotalProduct.toFixed(2).replace(".",",")
        subtotal.textContent = `R$ ${subtotalFormat}`
    }
    if(delivery){
        const deliveryFormat = taxa.toFixed(2).replace(".",",")
        delivery.textContent = `R$ ${deliveryFormat}`
    }
     if(total){
        const totalFormat = totalOfBuy.toFixed(2).replace(".",",")
        total.textContent = `R$ ${totalFormat}`
        
    }

}

document.addEventListener('DOMContentLoaded',shoppingCart);


var btn = document.querySelector("button.checkout-btn")
btn.addEventListener('click', function(){
    location.href = '/compras'
})

/*var btnCloseOrder = document.getElementById("close-order");
btnCloseOrder.addEventListener('click',function(){
    window.alert('Compra finalizada com sucesso✅. Entregue em até 7 dias!🚚')
    location.href = '/'
})*/