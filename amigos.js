// ---------------------------
// LOGOUT
// ---------------------------
document.getElementById("logoutBtn").onclick = async () => {
  await fetch("http://localhost:3000/logout", {
    method: "POST",
    credentials: "include"
  });
  window.location.href = "login.html";
};

// ---------------------------
// CARREGAR AMIGOS
// ---------------------------
async function carregarAmigos() {
  const res = await fetch("http://localhost:3000/amigos", {
    credentials: "include"
  });

  const lista = await res.json();
  const ul = document.getElementById("listaAmigos");
  ul.innerHTML = "";

  lista.forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${a.foto_url}">
      <span>${a.nome}</span>
    `;
    ul.appendChild(li);
  });
}

// ---------------------------
// CARREGAR SOLICITAÇÕES RECEBIDAS
// ---------------------------
async function carregarSolicitacoesRecebidas() {
  const res = await fetch("http://localhost:3000/solicitacoes/recebidas", {
    credentials: "include"
  });

  const lista = await res.json();
  const ul = document.getElementById("solicitacoesRecebidas");
  ul.innerHTML = "";

  lista.forEach(s => {
    const li = document.createElement("li");

    li.innerHTML = `
      <img src="${s.foto_url}">
      <span>${s.nome}</span>
      <button class="aceitar">Aceitar</button>
      <button class="recusar">Recusar</button>
    `;

    li.querySelector(".aceitar").onclick = () =>
      aceitarSolicitacao(s.id_solicitacao, s.id);

    li.querySelector(".recusar").onclick = () =>
      recusarSolicitacao(s.id_solicitacao);

    ul.appendChild(li);
  });
}

async function aceitarSolicitacao(idSolicitacao, idAmigo) {
  await fetch("http://localhost:3000/solicitacao/aceitar", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idSolicitacao, idAmigo })
  });

  carregarSolicitacoesRecebidas();
  carregarAmigos();
}

async function recusarSolicitacao(idSolicitacao) {
  await fetch("http://localhost:3000/solicitacao/recusar", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idSolicitacao })
  });

  carregarSolicitacoesRecebidas();
}

// ---------------------------
// CARREGAR SOLICITAÇÕES ENVIADAS
// ---------------------------
async function carregarSolicitacoesEnviadas() {
  const res = await fetch("http://localhost:3000/solicitacoes/enviadas", {
    credentials: "include"
  });

  const lista = await res.json();
  const ul = document.getElementById("solicitacoesEnviadas");
  ul.innerHTML = "";

  lista.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${s.foto_url}">
      <span>${s.nome}</span>
      <span style="color: yellow;">Pendente</span>
    `;
    ul.appendChild(li);
  });
}

// ---------------------------
// BUSCAR USUÁRIOS
// ---------------------------
document.getElementById("btnPesquisar").onclick = buscarUsuarios;

async function buscarUsuarios() {
  const termo = document.getElementById("pesquisa").value.trim();
  const ul = document.getElementById("resultadosPesquisa");
  ul.innerHTML = "";

  if (!termo) return;

  const res = await fetch(`http://localhost:3000/usuarios/procurar?q=${termo}`, {
    credentials: "include"
  });

  const lista = await res.json();

  lista.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${u.foto_url}">
      <span>${u.nome}</span>
      <button data-id="${u.id}">Adicionar</button>
    `;

    li.querySelector("button").onclick = () => enviarSolicitacao(u.id);

    ul.appendChild(li);
  });
}

async function enviarSolicitacao(idDestinatario) {
  await fetch("http://localhost:3000/solicitacao/enviar", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idDestinatario })
  });

  carregarSolicitacoesEnviadas();
}

// ---------------------------
carregarAmigos();
carregarSolicitacoesRecebidas();
carregarSolicitacoesEnviadas();
