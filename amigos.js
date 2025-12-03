// 🔹 Elementos do DOM
const listaAmigos = document.getElementById("listaAmigos");
const inputBusca = document.getElementById("inputBusca");
const btnBuscar = document.getElementById("btnBuscar");
const listaSolicitacoes = document.getElementById("listaSolicitacoes");

// 🔹 Carregar amigos
async function carregarAmigos() {
  try {
    const res = await fetch("http://localhost:3000/amizades", { credentials: "include" });
    const amigos = await res.json();
    if (!Array.isArray(amigos)) { console.error("Erro:", amigos); return; }

    listaAmigos.innerHTML = "";
    amigos.forEach(amigo=>{
      const div = document.createElement("div");
      div.classList.add("amigo-card");
      div.innerHTML = `
        <img src="${amigo.foto_url || 'https://i.imgur.com/QpZyV2K.png'}" alt="${amigo.nome}">
        <span>${amigo.nome}</span>
      `;
      listaAmigos.appendChild(div);
    });
  } catch(err) { console.error(err); alert("Erro ao carregar amigos"); }
}

// 🔹 Buscar usuários
async function buscarUsuarios() {
  const nome = inputBusca.value.trim();
  if(!nome) return;

  try{
    const res = await fetch(`http://localhost:3000/buscar-usuarios?nome=${nome}`, { credentials:"include" });
    const usuarios = await res.json();
    if(!Array.isArray(usuarios)) { console.error("Erro:", usuarios); return; }

    usuarios.forEach(usuario=>{
      const existe = Array.from(listaAmigos.children).some(
        c=>c.querySelector("span").textContent === usuario.nome
      );
      if(existe) return;

      const div = document.createElement("div");
      div.classList.add("amigo-card");
      div.innerHTML = `
        <img src="${usuario.foto_url || 'https://i.imgur.com/QpZyV2K.png'}" alt="${usuario.nome}">
        <span>${usuario.nome}</span>
        <button onclick="solicitarAmizade(${usuario.id})">Adicionar</button>
      `;
      listaAmigos.appendChild(div);
    });

  }catch(err){ console.error(err); alert("Erro ao buscar usuários"); }
}

// 🔹 Solicitar amizade
async function solicitarAmizade(idAmigo){
  try{
    const res = await fetch("http://localhost:3000/add-amigo", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({idAmigo}),
      credentials:"include"
    });
    const data = await res.json();
    if(res.status!==200) return alert(data.error);
    alert("Solicitação enviada!");
    carregarSolicitacoes();
  }catch(err){ console.error(err); alert("Erro ao enviar solicitação"); }
}

// 🔹 Carregar solicitações recebidas
async function carregarSolicitacoes(){
  try{
    const res = await fetch("http://localhost:3000/solicitacoes", { credentials:"include" });
    const solicitacoes = await res.json();
    if(!Array.isArray(solicitacoes)) { console.error("Erro:", solicitacoes); return; }

    listaSolicitacoes.innerHTML = "";
    solicitacoes.forEach(s=>{
      const div = document.createElement("div");
      div.classList.add("solicitacao-card");
      div.innerHTML = `
        <img src="${s.foto_url || 'https://i.imgur.com/QpZyV2K.png'}" alt="${s.nome}">
        <span>${s.nome}</span>
        <button onclick="aceitarSolicitacao(${s.solicitacaoId})">Aceitar</button>
        <button onclick="recusarSolicitacao(${s.solicitacaoId})">Recusar</button>
      `;
      listaSolicitacoes.appendChild(div);
    });
  }catch(err){ console.error(err); alert("Erro ao carregar solicitações"); }
}

// 🔹 Aceitar solicitação
async function aceitarSolicitacao(id){
  try{
    const res = await fetch("http://localhost:3000/solicitacoes/aceitar", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({solicitacaoId:id}),
      credentials:"include"
    });
    const data = await res.json();
    if(res.status!==200) return alert(data.error);
    alert("Solicitação aceita!");
    carregarSolicitacoes();
    carregarAmigos();
  }catch(err){ console.error(err); }
}

// 🔹 Recusar solicitação
async function recusarSolicitacao(id){
  try{
    const res = await fetch("http://localhost:3000/solicitacoes/recusar", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({solicitacaoId:id}),
      credentials:"include"
    });
    const data = await res.json();
    if(res.status!==200) return alert(data.error);
    alert("Solicitação recusada!");
    carregarSolicitacoes();
  }catch(err){ console.error(err); }
}

// 🔹 Eventos
btnBuscar.addEventListener("click", buscarUsuarios);

// 🔹 Inicializar
carregarAmigos();
carregarSolicitacoes();
