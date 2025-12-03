import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*"})); // sem login por enquanto

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "3101",
  database: "ashezdb"
});

// Enviar solicitação
app.post("/solicitacao/enviar", async (req,res)=>{
  const { idRemetente, idDestinatario } = req.body;
  if(!idRemetente || !idDestinatario) return res.status(400).json({error:"ID inválido"});

  const [existe] = await db.query(
    "SELECT * FROM solicitacoes_amizade WHERE id_remetente=? AND id_destinatario=? AND status='pendente'",
    [idRemetente, idDestinatario]
  );
  if(existe.length > 0) return res.json({ok:true});

  await db.query(
    "INSERT INTO solicitacoes_amizade (id_remetente, id_destinatario) VALUES (?,?)",
    [idRemetente, idDestinatario]
  );
  res.json({ok:true});
});

// Solicitações recebidas
app.get("/solicitacoes/recebidas/:id", async (req,res)=>{
  const idUser = req.params.id;
  const [rows] = await db.query(
    `SELECT s.id AS id_solicitacao, u.id, u.nome 
     FROM solicitacoes_amizade s
     JOIN usuarios u ON u.id=s.id_remetente
     WHERE s.id_destinatario=? AND s.status='pendente'`,
    [idUser]
  );
  res.json(rows);
});

// Aceitar solicitação
app.post("/solicitacao/aceitar", async (req,res)=>{
  const { idSolicitacao, idUser, idAmigo } = req.body;
  await db.query(
    "UPDATE solicitacoes_amizade SET status='aceito' WHERE id=? AND id_destinatario=?",
    [idSolicitacao, idUser]
  );
  await db.query("INSERT INTO amizades (id_usuario,id_amigo) VALUES (?,?)",[idUser,idAmigo]);
  await db.query("INSERT INTO amizades (id_usuario,id_amigo) VALUES (?,?)",[idAmigo,idUser]);
  res.json({ok:true});
});

app.listen(3000,()=>console.log("Servidor rodando na porta 3000"));
