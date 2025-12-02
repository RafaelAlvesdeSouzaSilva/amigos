import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔵 CONEXÃO COM SEU BANCO
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "3101",
  database: "ashezdb"
});

// 🔵 ROTA PARA BUSCAR USUÁRIOS
app.get("/buscar-usuarios", async (req, res) => {
  try {
    const nome = req.query.nome || "";

    const [rows] = await db.execute(
      "SELECT id, username FROM usuarios WHERE username LIKE ? LIMIT 20",
      [`%${nome}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// 🔵 ROTA PARA ADICIONAR AMIGO
app.post("/add-amigo", async (req, res) => {
  try {
    const { idAmigo } = req.body;

    // Aqui você precisa definir o ID do usuário logado
    // por enquanto vou colocar um fixo só pra funcionar
    const idUsuario = 1;

    await db.execute(
      "INSERT INTO amigos (id_usuario, id_amigo) VALUES (?, ?)",
      [idUsuario, idAmigo]
    );

    res.json({ msg: "Amigo adicionado com sucesso!" });

  } catch (err) {
    console.error("Erro ao adicionar amigo:", err);
    res.status(500).json({ error: "Erro ao adicionar amigo" });
  }
});

// 🔵 INICIAR SERVIDOR
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
