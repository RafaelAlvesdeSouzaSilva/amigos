async function enviarSolicitacao(idRemetente,idDestinatario){
  await fetch("http://localhost:3000/solicitacao/enviar",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({idRemetente,idDestinatario})
  });
  alert("Solicitação enviada!");
}

async function carregarRecebidas(idUser){
  const res = await fetch(`http://localhost:3000/solicitacoes/recebidas/${idUser}`);
  const lista = await res.json();

  const container = document.getElementById("recebidas");
  container.innerHTML = "";

  lista.forEach(s=>{
    const div = document.createElement("div");
    div.innerHTML = `${s.nome} <button onclick="aceitar(${s.id},${idUser},${s.id})">Aceitar</button>`;
    container.appendChild(div);
  });
}

async function aceitar(idSolicitacao,idUser,idAmigo){
  await fetch("http://localhost:3000/solicitacao/aceitar",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({idSolicitacao,idUser,idAmigo})
  });
  carregarRecebidas(idUser);
}
