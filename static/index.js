// --- FUNÇÕES DE LÓGICA CORE ---

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

function removeItemFromCart(itemId) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === itemId);

    if (existingItemIndex > -1) {
        let item = cart[existingItemIndex];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(existingItemIndex, 1);
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
    const dados = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        dados[key] = value;
    }
    if (dados.cep) {
        dados.cep = dados.cep.replace(/\D/g, '');
    }
    return dados;
}

async function finalizarCompra(enderecoData) {
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


// --- FUNÇÕES DE INICIALIZAÇÃO (INIT) ---

/** * Inicializa a funcionalidade de Busca (Search Bar)
 * Usado em todas as páginas onde a barra de busca está presente.
 */
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

/** * Atualiza o display do carrinho (ícone no cabeçalho e card)
 */
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

/**
 * Inicializa a funcionalidade do Carrinho (botões de adicionar e ícone)
 * Usado em todas as páginas onde o carrinho está visível.
 */
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
        // Toggle do carrinho
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartCard.classList.toggle('hidden');
        });

        // Fechar carrinho ao clicar fora
        document.addEventListener('click', (e) => {
            if (!cartCard.contains(e.target) && !cartIcon.contains(e.target) && !cartCard.classList.contains('hidden')) {
                cartCard.classList.add('hidden');
            }
        });
    }
}

/**
 * Inicializa a verificação de login para o botão de Checkout.
 * Usado em todas as páginas onde o botão de checkout está presente.
 */
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


// --- Funções Específicas da Página de Compras (/compras) ---

function shoppingCart() {
    const cart = getCart();
    const tableBody = document.getElementById("cart-table-body");
    const subtotal = document.getElementById("subtotal");
    const delivery = document.getElementById("delivery");
    const total = document.getElementById("total");

    tableBody.innerHTML = '';
    const taxa = 9.67;
    let subtotalProduct = 0;
    
    // Lógica de exibição e cálculo (mantida a sua lógica original)
    if (cart.length === 0) {
        // ... (código para carrinho vazio)
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Não há livro cadastrado ainda!!</tr>';
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
        row.innerHTML = `
        <td><img src=${item.url_img} alt="imagem do livro" style="height:80px; width:70px;"></td>
        <td>${item.title}</td>
        <td>R$ ${priceFormat}</td>
        <td>${item.quantity || 1}</td>
        <td>R$ ${itemTotalFormat}</td>
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
    document.getElementById('logradouro').value = "";
    document.getElementById('bairro').value = "";
    document.getElementById('cidade').value = "";
    document.getElementById('uf').value = "";
}

async function consultarCEP(cepValue) {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length !== 8) {
        limparFormularioCEP();
        return; 
    }
    // ... (Sua lógica de ViaCEP)
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

/**
 * Inicializa a funcionalidade da página de Compras (tabela e formulário de endereço).
 * Usado APENAS na página de Compras (/compras).
 */
function initOrderPage() {
    shoppingCart(); // Carrega a tabela do carrinho
    
    var btnCloseOrder = document.getElementById('close-order');
    var formContainer = document.getElementById('address-form-container');
    var addressForm = document.getElementById('address-form');
    var btnContinueBuy = document.getElementById('continue-buy');
    
    // Mostrar formulário
    if (btnCloseOrder && formContainer) {
        btnCloseOrder.addEventListener('click', function(event) {
            formContainer.classList.remove('hidden');
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            btnCloseOrder.disabled = true;
        });
    }

    // Submissão do formulário de endereço
    if (addressForm) {
        addressForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const enderecoData = coletarDadosDoFormulario(addressForm);
            finalizarCompra(enderecoData);
        });
    }

    // Botão continuar comprando
    if (btnContinueBuy) {
        btnContinueBuy.addEventListener('click', function() {
            location.href = '/livros';
        });
    }
    
    // Listener do CEP no formulário de endereço
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', (e) => consultarCEP(e.target.value));
    }
}

// --- Funções de Carrossel ---
let slideIndex = 1;
let autoTimeout;

function showSlides(n) {
    // ... (sua lógica de showSlides)
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

// Expõe a função para que os botões do HTML (dot) possam chamá-la
window.currentSlide = function(n) {
    clearTimeout(autoTimeout);
    showSlides(slideIndex = n);
    autoTimeout = setTimeout(autoRotate, 5000); 
}

/**
 * Inicializa o Carrossel.
 * Usado APENAS nas páginas onde o carrossel está presente.
 */
function initCarousel() {
    const slides = document.getElementsByClassName("mySlides");
    if (slides.length > 0) {
        showSlides(slideIndex);
        autoTimeout = setTimeout(autoRotate, 5000);
    }
}

// --- PONTO DE ENTRADA CENTRALIZADO ---

document.addEventListener('DOMContentLoaded', () => {
    // Estas funcionalidades são globais e necessárias em quase todas as páginas:
    initSearch();
    initCart();
    initCheckout(); // Verifica login para o botão de checkout

    // Inicialização condicional para módulos grandes:
    
    // 1. Carrossel: Se houver a classe 'slideshow-container' (geralmente na home)
    if (document.querySelector('.slideshow-container')) {
        // A função initCarousel é chamada aqui
        initCarousel();
    }
    
    // 2. Página de Compras: Se a URL for a página de compras
    if (window.location.pathname === '/compras') {
        // A função initOrderPage é chamada aqui
        initOrderPage();
    }

    // Nota: O seu carrossel estava usando 'window.onload', 
    // mudei para ser chamado aqui no DOMContentLoaded condicionalmente.
});