import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";
const router = express.Router();

// LOGIN ---------------------------
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    const [rows] = await db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
    );

    if (rows.length === 0) return res.json({ erro: "Usuário não encontrado" });

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) return res.json({ erro: "Senha incorreta" });

    res.json({
        mensagem: "Logado!",
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            foto_url: usuario.foto_url
        }
    });
});

// REGISTRO -------------------------
router.post("/register", async (req, res) => {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        await db.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            [nome, email, senhaHash]
        );
        res.json({ mensagem: "Usuário criado!" });
    } catch {
        res.json({ erro: "Email já existe!" });
    }
});

export default router;
