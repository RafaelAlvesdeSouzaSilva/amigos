async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if(!email || !senha) return alert("Preencha email e senha!");

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      credentials: "include"
    });

    const data = await res.json();

    if(res.status !== 200) return alert(data.error || "Erro ao logar");

    window.location.href = "amigos.html";

  } catch(err) {
    console.error(err);
    alert("Erro ao conectar com o servidor");
  }
}
