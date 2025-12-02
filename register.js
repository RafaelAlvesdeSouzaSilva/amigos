async function register() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    alert("Conta criada com sucesso!");
    window.location.href = "./login.html";
}
