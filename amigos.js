// 🔹 Logout
document.getElementById("logoutBtn").addEventListener("click", async ()=>{
  try{
    await fetch("http://localhost:3000/logout",{method:"POST", credentials:"include"});
    window.location.href = "login.html";
  } catch(err){
    console.error(err);
    alert("Erro ao fazer logout");
  }
});

// 🔹 Carregar amigos
async function carregarAmigos(){
  try{
    const res = await fetch("http://localhost:3000/amizades",{credentials:"include"});
    const amigos = await res.json();
    const lista = document.getElementById("listaAmigos");
    lista.innerHTML = "";

    amigos.forEach(amigo=>{
      const div = document.createElement("div");
      div.classList.add("usuario");
      div.innerHTML = `
        <img src="${amigo.foto_url}" alt="${amigo.nome}" class="foto">
        <span>${amigo.nome}</span>
        <a href="profile.html?id=${amigo.id}">Ver Perfil</a>
      `;
      lista.appendChild(div);
    });
  } catch(err){
    console.error(err);
    alert("Erro ao carregar amigos");
  }
}

// 🔹 Buscar usuários
const inputBusca = document.getElementById("inputBusca");
const resultados = document.getElementById("resultadosBusca");

inputBusca.addEventListener("input", async ()=>{
  const nome = inputBusca.value.trim();
  if(!nome){
    resultados.innerHTML="";
    return;
  }
  try{
    const res = await fetch(`http://localhost:3000/buscar-usuarios?nome=${nome}`, {credentials:"include"});
    const users = await res.json();

    resultados.innerHTML="";
    users.forEach(user=>{
      const div = document.createElement("div");
      div.classList.add("usuario");
      div.innerHTML = `
        <img src="${user.foto_url}" alt="${user.nome}" class="foto">
        <span>${user.nome}</span>
        <button data-id="${user.id}">Adicionar</button>
      `;
      resultados.appendChild(div);

      // Adicionar amigo sem substituir
      div.querySelector("button").addEventListener("click", async ()=>{
        try{
          await fetch("http://localhost:3000/add-amigo", {
            method:"POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({idAmigo: user.id}),
            credentials:"include"
          });
          alert(`${user.nome} adicionado!`);
          carregarAmigos(); // atualizar lista de amigos
        } catch(err){
          console.error(err);
          alert("Erro ao adicionar amigo");
        }
      });
    });
  } catch(err){
    console.error(err);
    resultados.innerHTML="";
  }
});

// Inicializar
carregarAmigos();
