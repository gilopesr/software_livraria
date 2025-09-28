const input = document.getElementById("search-input");
const resultado = document.getElementById("resultado");

input.addEventListener("keydown", async function(event) {
    if (event.key !== "Enter") return;  // só executa se apertar Enter
    event.preventDefault();

    const termo = input.value.trim();
    if (!termo) return;

    try {
        let res;

        if (/^\d+$/.test(termo)) {
            // somente números = ISBN
            res = await fetch(`/livros/${parseInt(termo)}`);
            if (!res.ok) throw new Error("Livro não encontrado pelo ISBN");
        } else {
            // letras = tenta título -> gênero -> autor
            res = await fetch(`/livros/titulo/${encodeURIComponent(termo)}`);
            if (!res.ok) {
                res = await fetch(`/livros/genero/${encodeURIComponent(termo)}`);
            }
            if (!res.ok) {
                res = await fetch(`/autor/${encodeURIComponent(termo)}/livros`);
            }
            if (!res.ok) throw new Error("Nenhum resultado encontrado");
        }

        // se chegou aqui, alguma rota funcionou
        resultado.innerHTML = await res.text();
    } catch (err) {
        resultado.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
});
