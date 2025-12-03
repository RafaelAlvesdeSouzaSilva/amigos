import express from "express";
import mysql from "mysql2/promise";
import session from "express-session";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Corrigir __dirname e __filename no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ===============================
//  CORS (Live Server + Cookies)
// ===============================
app.use(cors({
 origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  credentials: true
}));

// ===============================
//  SESSÃO (ESSENCIAL!!!)
// ===============================
app.use(
  session({
    secret: "segredoTop",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,   // http
      httpOnly: true,
      sameSite: "lax"  // 🔥 obrigatório para funcionar no Live Server
    }
  })
);

// ===============================
// BANCO
// ===============================
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "3101",
  database: "ashezdb"
});

// ===============================
// UPLOADS
// ===============================
const upload = multer({ dest: path.join(__dirname, "uploads") });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================
// MIDDLEWARE AUTENTICAÇÃO
// ===============================
function auth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
}

// ===============================
// LOGIN
// ===============================
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
  if (rows.length === 0)
    return res.status(400).json({ error: "Usuário não encontrado" });

  const user = rows[0];

  if (user.senha !== senha)
    return res.status(400).json({ error: "Senha incorreta" });

  req.session.userId = user.id;

  return res.json({ ok: true });
});

// ===============================
// MEU USUÁRIO
// ===============================
app.get("/meu-usuario", auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, nome, email, foto_url FROM usuarios WHERE id = ?",
    [req.session.userId]
  );
  res.json(rows[0]);
});

// ===============================
// ATUALIZAR FOTO
// ===============================
app.post("/atualizar-foto", auth, upload.single("foto"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Envie uma imagem" });

  const fotoUrl = `http://localhost:3000/uploads/${req.file.filename}`;

  await db.query(
    "UPDATE usuarios SET foto_url = ? WHERE id = ?",
    [fotoUrl, req.session.userId]
  );

  res.json({ ok: true, fotoUrl });
});

// ===============================
// AMIGOS
// ===============================
app.get("/amigos", auth, async (req, res) => {
  const id = req.session.userId;

  const [rows] = await db.query(
    `
    SELECT u.id, u.nome, u.foto_url
    FROM amizades a
    JOIN usuarios u ON u.id = a.id_amigo
    WHERE a.id_usuario = ?
    `,
    [id]
  );

  res.json(rows);
});

// ===============================
// SOLICITAÇÕES RECEBIDAS
// ===============================
app.get("/solicitacoes/recebidas", auth, async (req, res) => {
  const id = req.session.userId;

  const [rows] = await db.query(
    `
      SELECT s.id AS id_solicitacao, u.id, u.nome, u.foto_url
      FROM solicitacoes_amizade s
      JOIN usuarios u ON u.id = s.id_remetente
      WHERE s.id_destinatario = ? AND s.status = 'pendente'
    `,
    [id]
  );

  res.json(rows);
});

// ===============================
// SOLICITAÇÕES ENVIADAS
// ===============================
app.get("/solicitacoes/enviadas", auth, async (req, res) => {
  const id = req.session.userId;

  const [rows] = await db.query(
    `
      SELECT s.id AS id_solicitacao, u.id, u.nome, u.foto_url
      FROM solicitacoes_amizade s
      JOIN usuarios u ON u.id = s.id_destinatario
      WHERE s.id_remetente = ? AND s.status = 'pendente'
    `,
    [id]
  );

  res.json(rows);
});

// ===============================
// ENVIAR SOLICITAÇÃO
// ===============================
app.post("/solicitacao/enviar", auth, async (req, res) => {
  const idRemetente = req.session.userId;
  const { idDestinatario } = req.body;

  if (!idDestinatario)
    return res.status(400).json({ error: "ID inválido" });

  const [existe] = await db.query(
    `
      SELECT * FROM solicitacoes_amizade
      WHERE id_remetente = ? AND id_destinatario = ? AND status = 'pendente'
    `,
    [idRemetente, idDestinatario]
  );

  if (existe.length > 0)
    return res.json({ ok: true });

  await db.query(
    "INSERT INTO solicitacoes_amizade (id_remetente, id_destinatario) VALUES (?, ?)",
    [idRemetente, idDestinatario]
  );

  res.json({ ok: true });
});

// ===============================
// ACEITAR SOLICITAÇÃO
// ===============================
app.post("/solicitacao/aceitar", auth, async (req, res) => {
  const idUser = req.session.userId;
  const { idSolicitacao, idAmigo } = req.body;

  await db.query(
    `
      UPDATE solicitacoes_amizade
      SET status = 'aceito'
      WHERE id = ? AND id_destinatario = ?
    `,
    [idSolicitacao, idUser]
  );

  await db.query("INSERT INTO amizades (id_usuario, id_amigo) VALUES (?, ?)", [
    idUser,
    idAmigo
  ]);
  await db.query("INSERT INTO amizades (id_usuario, id_amigo) VALUES (?, ?)", [
    idAmigo,
    idUser
  ]);

  res.json({ ok: true });
});

// ===============================
// RECUSAR SOLICITAÇÃO
// ===============================
app.post("/solicitacao/recusar", auth, async (req, res) => {
  const idUser = req.session.userId;
  const { idSolicitacao } = req.body;

  await db.query(
    `
      UPDATE solicitacoes_amizade
      SET status = 'recusado'
      WHERE id = ? AND id_destinatario = ?
    `,
    [idSolicitacao, idUser]
  );

  res.json({ ok: true });
});

// ===============================
// PROCURAR USUÁRIOS
// ===============================
app.get("/usuarios/procurar", auth, async (req, res) => {
  const busca = `%${req.query.q || ""}%`;
  const idUser = req.session.userId;

  const [rows] = await db.query(
    `
      SELECT id, nome, foto_url
      FROM usuarios
      WHERE nome LIKE ? AND id != ?
    `,
    [busca, idUser]
  );

  res.json(rows);
});

// ===============================
// LOGOUT
// ===============================
app.post("/logout", auth, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// ===============================
// INICIAR SERVIDOR
// ===============================
app.listen(3000, () => console.log("Servidor iniciado na porta 3000"));
