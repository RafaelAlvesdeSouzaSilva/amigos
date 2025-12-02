async function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const resp = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    const data = await resp.json();

    if (data.erro) {
        alert(data.erro);
        return;
    }

    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    window.location.href = "amigos.html";
}
