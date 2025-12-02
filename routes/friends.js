import express from "express";
import db from "../db.js";

const router = express.Router();

/* ============================
    LISTAR AMIGOS DO USUÁRIO
============================ */
router.get("/:id", (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT 
            u.id,
            u.nome,
            u.foto_url
        FROM amizades a
        JOIN usuarios u 
            ON (u.id = a.usuario1 AND a.usuario2 = ?)
            OR (u.id = a.usuario2 AND a.usuario1 = ?)
    `;

    db.query(sql, [id, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
        }

        res.json(result);
    });
});

/* ============================
     ENVIAR SOLICITAÇÃO
============================ */
router.post("/solicitar", (req, res) => {
    const { id_remetente, id_destinatario } = req.body;

    const sql = `
        INSERT INTO solicitacoes_amizade (id_remetente, id_destinatario)
        VALUES (?, ?)
    `;

    db.query(sql, [id_remetente, id_destinatario], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({ msg: "Solicitação enviada" });
    });
});

/* ============================
     LISTAR SOLICITAÇÕES
============================ */
router.get("/solicitacoes/:id", (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT 
            s.id,
            u.nome,
            u.foto_url
        FROM solicitacoes_amizade s
        JOIN usuarios u ON u.id = s.id_remetente
        WHERE s.id_destinatario = ? AND s.status = 'pendente'
    `;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
});

/* ============================
        ACEITAR AMIZADE
============================ */
router.post("/aceitar", (req, res) => {
    const { id_solicitacao, id_remetente, id_destinatario } = req.body;

    const sqlDelete = `UPDATE solicitacoes_amizade SET status='aceito' WHERE id = ?`;
    const sqlAdd = `INSERT INTO amizades (usuario1, usuario2) VALUES (?, ?)`;

    db.query(sqlDelete, [id_solicitacao], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(sqlAdd, [id_remetente, id_destinatario], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            res.json({ msg: "Agora vocês são amigos!" });
        });
    });
});

export default router;
