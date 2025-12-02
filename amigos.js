const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

searchBtn.addEventListener("click", buscarUsuario);

async function buscarUsuario() {
    const texto = searchInput.value.trim();
    
    if (!texto) {
        resultsDiv.innerHTML = "<p>Digite algo para buscar.</p>";
        return;
    }

    const resposta = await fetch(`/buscar-usuarios?nome=${encodeURIComponent(texto)}`);
    const dados = await resposta.json();

    if (dados.length === 0) {
        resultsDiv.innerHTML = "<p>Nenhum usuário encontrado.</p>";
        return;
    }

    resultsDiv.innerHTML = "";

    dados.forEach(user => {
        const box = document.createElement("div");
        box.className = "user-result";

        box.innerHTML = `
            <strong>${user.username}</strong><br>
            <button class="add-btn" onclick="adicionar(${user.id})">Adicionar</button>
        `;

        resultsDiv.appendChild(box);
    });
}

async function adicionar(id) {
    const resp = await fetch("/add-amigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idAmigo: id })
    });

    const data = await resp.json();
    alert(data.msg);
}
