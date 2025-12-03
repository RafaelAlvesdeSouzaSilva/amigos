const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const foto = document.getElementById("foto").files[0]; // arquivo selecionado

  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("email", email);
  formData.append("senha", senha);
  if (foto) formData.append("foto", foto);

  try {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.error) {
      alert("Erro: " + data.error);
    } else {
      alert(data.msg || "Cadastro realizado com sucesso!");
      window.location.href = "login.html"; // redireciona para login
    }
  } catch (err) {
    console.error("Erro no cadastro:", err);
    alert("Erro ao registrar usuário.");
  }
});
