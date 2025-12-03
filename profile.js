// Buscar usuário logado
async function carregarUsuario(){
  try{
    const res = await fetch("http://localhost:3000/meu-usuario",{credentials:"include"});
    const user = await res.json();
    document.getElementById("fotoAtual").src = user.foto_url || "https://i.imgur.com/QpZyV2K.png";
  } catch(err){
    console.error(err);
    alert("Erro ao carregar usuário. Faça login novamente.");
  }
}

// Atualizar foto
const form = document.getElementById("formFoto");
form.addEventListener("submit", async(e)=>{
  e.preventDefault();
  const arquivo = document.getElementById("foto").files[0];
  if(!arquivo) return alert("Escolha uma foto!");
  
  const formData = new FormData();
  formData.append("foto", arquivo);

  try{
    const res = await fetch("http://localhost:3000/atualizar-foto", {
      method:"POST",
      body:formData,
      credentials:"include"
    });
    const data = await res.json();
    if(res.status!==200) return alert(data.error);
    alert("Foto atualizada!");
    carregarUsuario();
  } catch(err){
    console.error(err);
    alert("Erro ao enviar a foto");
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async()=>{
  try{
    await fetch("http://localhost:3000/logout",{method:"POST", credentials:"include"});
    window.location.href = "login.html";
  } catch(err){
    console.error(err);
    alert("Erro ao fazer logout");
  }
});

carregarUsuario();
