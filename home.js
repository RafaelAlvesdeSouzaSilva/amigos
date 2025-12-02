const API = "http://localhost:3000";

// =============== PEGAR USUÁRIO LOGADO ===============
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "./login.html";
}

document.getElementById("userNome").innerText = user.nome;
document.getElementById("userFoto").src = user.foto_url;

// Logout
document.getElementById("logout").onclick = () => {
    localStorage.removeItem("user");
    window.location.href = "./login.html";
};


// =============== PESQUISA DE USUÁRIOS ===============
const input = document.getElementById("searchInput");
const results = document.getElementById("searchResults");

input.addEventListener("input", async () => {
    const q = input.value.trim();
    if (q.length === 0) {
        results.innerHTML = "";
        return;
    }

    const res = await fetch(`${API}/users/search?q=${q}`);
    const data = await res.json();

    results.innerHTML = "";

    data.forEach(u => {
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${u.foto_url}" width="40" height="40" style="border-radius:50%">
            <span>${u.nome}</span>
            <button data-id="${u.id}">Adicionar</button>
        `;

        div.querySelector("button").onclick = () => enviarSolicitacao(u.id);
        results.appendChild(div);
    });
});


// =============== ENVIAR SOLICITAÇÃO ===============
async function enviarSolicitacao(destinatario) {
    await fetch(`${API}/friends/request`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            remetente: user.id,
            destinatario
        })
    });

    alert("Solicitação enviada!");
}


// =============== LISTAR SOLICITAÇÕES ===============
async function carregarSolicitacoes() {
    const res = await fetch(`${API}/friends/requests/${user.id}`);
    const data = await res.json();

    const box = document.getElementById("requestsList");
    box.innerHTML = "";

    data.forEach(s => {
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${s.foto_url}" width="40" height="40" style="border-radius:50%">
            <span>${s.nome}</span>
            <button data-id="${s.id}" data-user="${s.id}">Aceitar</button>
        `;

        div.querySelector("button").onclick = () =>
            aceitarSolicitacao(s.id, s.id_remetente);

        box.appendChild(div);
    });
}


// =============== ACEITAR SOLICITAÇÃO ===============
async function aceitarSolicitacao(id_solicitacao, remetente) {
    await fetch(`${API}/friends/accept`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id_solicitacao,
            remetente,
            destinatario: user.id
        })
    });

    alert("Agora são amigos!");
    carregarSolicitacoes();
    carregarAmigos();
}


// =============== LISTAR AMIGOS ===============
async function carregarAmigos() {
    const res = await fetch(`${API}/friends/list/${user.id}`);
    const data = await res.json();

    const box = document.getElementById("friendsList");
    box.innerHTML = "";

    data.forEach(a => {
        const div = document.createElement("div");
        div.innerHTML = `
            <img src="${a.foto_url}" width="40" height="40" style="border-radius:50%">
            <span>${a.nome}</span>
        `;

        box.appendChild(div);
    });
}


// Inicializar
carregarSolicitacoes();
carregarAmigos();
