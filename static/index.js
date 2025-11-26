// Funções de Carrinho
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

// Funções Auxiliares para Atualização de Quantidade (NOVO)

/**
 * Atualiza a quantidade de um produto específico no array do carrinho e o salva.
 * @param {string} productId - O ID do produto.
 * @param {number} newQuantity - A nova quantidade.
 */
function updateCartItemQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart(cart); // Salva o carrinho atualizado
        return true;
    }
    return false;
}

/**
 * Remove completamente um item do carrinho.
 * @param {string} productId - O ID do produto.
 */
function removeFullItemFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart); // Salva o carrinho atualizado
    
    // Remove a linha da tabela no HTML
    const rowToRemove = document.querySelector(`tr[data-product-id="${productId}"]`); 
    if (rowToRemove) {
        rowToRemove.remove();
    }
}

// Lógica de remoção original (diminui em 1)
function removeItemFromCart(itemId) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === itemId);

    if (existingItemIndex > -1) {
        let item = cart[existingItemIndex];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            // Usa a nova função para remover o item inteiro
            removeFullItemFromCart(itemId);
            return; // Sai da função após a remoção completa
        }
        saveCart(cart);
    }
}

// Funções de Busca
async function performSearch(termo) {
    if (!termo) {
        alert("Por favor, digite um termo de busca.");
        return;
    }

    try {
        if (/^\d+$/.test(termo)) {
            window.location.href = `/livros/${termo}`;
            return;
        }

        const urlAutor = `/autor/${encodeURIComponent(termo)}/livros`;
        const resAutor = await fetch(urlAutor);
        if (resAutor.ok) {
            window.location.href = urlAutor;
            return;
        }

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

// Funções de Login
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

// Funções de Finalização de Compra (Checkout)
function coletarDadosDoFormulario(form) {
    const data = {};
    const formData = new FormData(form);

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    return data;
}

async function processarPagamento(enderecoData, metodoPagamento) {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Seu carrinho está vazio.");
        window.location.href = '/';
        return;
    }

    let valorTotal = 0;
    const taxaEntrega = 9.67;

    const itensParaAPI = cart.map(item => {
        valorTotal += item.price * item.quantity;
        return {
            id_livro: item.id,
            quantidade: item.quantity,
            preco_unitario: item.price
        };
    });

    valorTotal += taxaEntrega;

    const payload = {
        endereco: enderecoData,
        metodo_pagamento: metodoPagamento,
        carrinho: itensParaAPI,
        valor_total: valorTotal
    };

    try {
        const response = await fetch('/finalizar-pedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            saveCart([]);
            window.alert('Compra finalizada com sucesso✅. Entregue em até 7 dias!🚚');
            window.location.href = '/';
        } else {
            alert("Não foi possível concluir o pedido. Erro: " + result.message);
        }

    } catch (error) {
        console.error('Erro de rede ao finalizar compra:', error);
        alert("Erro de conexão com o servidor. Verifique sua rede e tente novamente.");
    }
}


// --- FUNÇÕES DE INICIALIZAÇÃO ---

function initSearch() {
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
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
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
                        // Atualiza o display da mini-sacola após remoção/diminuição
                        updateCartDisplay(getCart()); 
                    });
                }
                cartItemsList.appendChild(itemElement);
            });
        }
    }
    
    if (cartTotalValue) {
        cartTotalValue.textContent = total.toFixed(2).replace('.', ',');
    }
}


function initCart() {
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
}

//verificação de login
function initCheckout() {
    const checkoutButton = document.getElementById('checkout-button');
    const loginPageUrl = '/login';
    const checkoutPageUrl = '/compras';

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function(event) {
            event.preventDefault(); 
            
            const estaLogado = await isUserLoggedIn();
            
            if (estaLogado) {
                window.location.href = checkoutPageUrl;
            } else {
                window.location.href = loginPageUrl + '?next=' + encodeURIComponent(checkoutPageUrl);
            }
        });
    }
}


// --- Funções da Página de Compras---
function handleQuantityChange(productId, change) {
    const quantityDisplay = document.getElementById(`quantity-${productId}`);
    let currentQuantity = parseInt(quantityDisplay.textContent);

    let newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
        if (confirm("Deseja remover este item do carrinho?")) {
            removeFullItemFromCart(productId);
            shoppingCart();
            return;
        }
        return;
    }

    if (updateCartItemQuantity(productId, newQuantity)) {
        quantityDisplay.textContent = newQuantity;
        shoppingCart();
    }
}


function setupQuantityControls() {
    const tableBody = document.getElementById('cart-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('quantity-button')) {
                const productId = target.getAttribute('data-id');
                
                if (target.classList.contains('plus-btn')) {
                    handleQuantityChange(productId, 1);
                } else if (target.classList.contains('minus-btn')) {
                    handleQuantityChange(productId, -1);
                }
            }
        });
    }
}


function shoppingCart() {
    const cart = getCart();
    const tableBody = document.getElementById("cart-table-body");
    const subtotal = document.getElementById("subtotal");
    const delivery = document.getElementById("delivery");
    const total = document.getElementById("total");

    if (!tableBody) return; // Evita erros se não estiver na página de carrinho

    tableBody.innerHTML = '';
    const taxa = 9.67;
    let subtotalProduct = 0;
    
    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Seu carrinho está vazio :( </tr>';
        if(subtotal) subtotal.textContent = 'R$ 0,00';
        if(delivery) delivery.textContent = `R$ ${taxa.toFixed(2).replace(".",",")}`;
        if(total) total.textContent = 'R$ 0,00';
        return; 
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotalProduct += itemTotal;
        const priceFormat = item.price ? item.price.toFixed(2).replace('.',',') :'0,00';
        const itemTotalFormat = itemTotal.toFixed(2).replace('.',',');

        const row = document.createElement('tr');
        row.setAttribute('data-product-id', item.id);
        row.innerHTML = `
            <td><img src=${item.url_img} alt="imagem do livro" style="height:80px; width:70px;"></td>
            <td>${item.title}</td>
            <td>R$ ${priceFormat}</td>
            <td class="quantity-controls">
                <div class="quantity-wrapper">
                    <button class="quantity-button minus-btn" data-id="${item.id}">-</button> 
                    <span class="quantity-display" id="quantity-${item.id}">${item.quantity || 1}</span>
                    <button class="quantity-button plus-btn" data-id="${item.id}">+</button>
                </div>
            </td>
            <td id="total-${item.id}">R$ ${itemTotalFormat}</td>
        `;
        tableBody.appendChild(row);
    });
    
    const totalOfBuy = taxa + subtotalProduct;

    if(subtotal){
        const subtotalFormat = subtotalProduct.toFixed(2).replace(".",",");
        subtotal.textContent = `R$ ${subtotalFormat}`;
    }
    if(delivery){
        const deliveryFormat = taxa.toFixed(2).replace(".",",");
        delivery.textContent = `R$ ${deliveryFormat}`;
    }
    if(total){
        const totalFormat = totalOfBuy.toFixed(2).replace(".",",");
        total.textContent = `R$ ${totalFormat}`;
    }
}

function limparFormularioCEP() {
    const logradouro = document.getElementById('logradouro');
    if (logradouro) logradouro.value = "";
    const bairro = document.getElementById('bairro');
    if (bairro) bairro.value = "";
    const cidade = document.getElementById('cidade');
    if (cidade) cidade.value = "";
    const uf = document.getElementById('uf');
    if (uf) uf.value = "";
}

async function consultarCEP(cepValue) {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length !== 8) {
        limparFormularioCEP();
        return; 
    }
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.erro) {
            limparFormularioCEP();
            alert("CEP não encontrado. Por favor, digite o endereço manualmente.");
        } else {
            document.getElementById('logradouro').value = data.logradouro;
            document.getElementById('bairro').value = data.bairro;
            document.getElementById('cidade').value = data.localidade;
            document.getElementById('uf').value = data.uf;
        }

    } catch (error) {
        console.error('Erro ao consultar ViaCEP:', error);
        limparFormularioCEP();
        alert("Erro ao tentar buscar o CEP. Por favor, tente novamente.");
    }
}

// Handler para finalizar o pagamento (Etapa 2)
function handleFinishOrder(dadosEndereco, addressForm) {
    const metodoPagamento = addressForm.querySelector('input[name="paymentMethod"]:checked');
    
    if (!metodoPagamento) {
        alert('Por favor, selecione um método de pagamento.');
        return;
    }
    processarPagamento(dadosEndereco, metodoPagamento.value);
}

// pagina do carrinho
function initOrderPage() {
    shoppingCart();
    setupQuantityControls(); 
    
    var btnCloseOrder = document.getElementById('close-order');
    var formContainer = document.getElementById('address-form-container');
    var addressForm = document.getElementById('address-form');
    var btnContinueBuy = document.getElementById('continue-buy');
    
    let dadosEndereco = {}; 
    
    var paymentSection = document.getElementById('metodo-pagamento');
    var addressFields = addressForm.querySelectorAll('.form-field:not(.button-field)'); 
    var addressSubmitButtonContainer = addressForm.querySelector('#address-submit-button-container');
    var finishButton = document.getElementById('finish-order-button');

    if (btnCloseOrder && formContainer) {
        btnCloseOrder.addEventListener('click', function(event) {
            if (getCart().length === 0) {
                 alert("Adicione itens ao carrinho antes de fechar o pedido.");
                 return;
            }
            formContainer.classList.remove('hidden');
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            btnCloseOrder.disabled = true;
        });
    }

    if (addressForm) {
        addressForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (paymentSection.classList.contains('hidden')) { 
                
                if (!addressForm.checkValidity()) {
                    addressForm.reportValidity();
                    return;
                }
                
                dadosEndereco = coletarDadosDoFormulario(addressForm);
                
                addressFields.forEach(field => {
                    field.style.display = 'none';
                });
                
                if (addressSubmitButtonContainer) {
                    addressSubmitButtonContainer.style.display = 'none';
                }
                
                paymentSection.classList.remove('hidden');
                addressForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                const formTitle = addressForm.querySelector('h2');
                if (formTitle) formTitle.textContent = 'Confirmação de Pagamento';

                if (finishButton) {
                    finishButton.removeEventListener('click', () => handleFinishOrder(dadosEndereco, addressForm));
                    finishButton.addEventListener('click', () => handleFinishOrder(dadosEndereco, addressForm)); 
                }
            } 
        });
    }

    if (btnContinueBuy) {
        btnContinueBuy.addEventListener('click', function() {
            location.href = '/livros';
        });
    }
    
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', (e) => consultarCEP(e.target.value));
    }
}

// --- Funções de Carrossel ---
let slideIndex = 1;
let autoTimeout;

function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

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

function autoRotate() {
    showSlides(slideIndex += 1);
    autoTimeout = setTimeout(autoRotate, 5000);
}

// Expõe a função para que os botões do HTML (dot) possam chamar
window.currentSlide = function(n) {
    clearTimeout(autoTimeout);
    showSlides(slideIndex = n);
    autoTimeout = setTimeout(autoRotate, 5000); 
}


function initCarousel() {
    const slides = document.getElementsByClassName("mySlides");
    if (slides.length > 0) {
        showSlides(slideIndex);
        autoTimeout = setTimeout(autoRotate, 5000);
    }
}

// --- PONTO DE ENTRADA CENTRALIZADO ---

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initCart();
    initCheckout();
    
    if (document.querySelector('.slideshow-container')) {
        initCarousel();
    }
    
    // 2. Página de Compras
    if (window.location.pathname === '/compras') {
        initOrderPage();
    }
});
