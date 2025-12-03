import express from "express";
import mysql from "mysql2/promise";
import session from "express-session";
import multer from "multer";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🔹 CORS
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  credentials: true
}));

// 🔹 Sessão
app.use(session({
  secret: "chaveSecreta123",
  resave: false,
  saveUninitialized: false
}));

// 🔹 Upload
const upload = multer({ dest: path.join(__dirname, "uploads") });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 JSON e URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Conexão com banco
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "3101",
  database: "ashezdb"
});

// 🔹 Middleware de autenticação
function auth(req,res,next){
  if(!req.session.userId) return res.status(401).json({error:"Não autenticado"});
  next();
}

// ================== ROTAS ==================

// 🔹 Registro
app.post("/register", upload.single("foto"), async(req,res)=>{
  const { nome, email, senha } = req.body;
  let foto_url = "https://i.imgur.com/QpZyV2K.png";
  if(req.file) foto_url = `/uploads/${req.file.filename}`;
  await db.execute("INSERT INTO usuarios (nome,email,senha,foto_url) VALUES (?,?,?,?)", [nome,email,senha,foto_url]);
  res.json({msg:"Cadastro ok"});
});

// 🔹 Login
app.post("/login", async(req,res)=>{
  const { email, senha } = req.body;
  const [rows] = await db.execute("SELECT * FROM usuarios WHERE email=? AND senha=?", [email,senha]);
  if(rows.length===0) return res.status(401).json({error:"Usuário ou senha incorreta"});
  req.session.userId = rows[0].id;
  res.json({msg:"Login ok", user:rows[0]});
});

// 🔹 Logout
app.post("/logout", auth, (req,res)=>{
  req.session.destroy();
  res.json({msg:"Logout ok"});
});

// 🔹 Retornar usuário logado
app.get("/meu-usuario", auth, async(req,res)=>{
  const id = req.session.userId;
  const [rows] = await db.execute("SELECT id,nome,foto_url FROM usuarios WHERE id=?", [id]);
  res.json(rows[0]);
});

// 🔹 Atualizar foto
app.post("/atualizar-foto", auth, upload.single("foto"), async(req,res)=>{
  const id = req.session.userId;
  if(!req.file) return res.status(400).json({error:"Nenhuma foto enviada"});
  const foto_url = `/uploads/${req.file.filename}`;
  await db.execute("UPDATE usuarios SET foto_url=? WHERE id=?", [foto_url, id]);
  res.json({msg:"Foto atualizada"});
});

// 🔹 Buscar usuários
app.get("/buscar-usuarios", auth, async(req,res)=>{
  const nome = req.query.nome || "";
  const idUsuario = req.session.userId;
  const [rows] = await db.execute("SELECT id,nome,foto_url FROM usuarios WHERE nome LIKE ? AND id != ? LIMIT 20", [`%${nome}%`, idUsuario]);
  res.json(rows);
});

// 🔹 Adicionar amigo (cria solicitação)
app.post("/add-amigo", auth, async(req,res)=>{
  const { idAmigo } = req.body;
  const idUsuario = req.session.userId;

  // Checa se já existe solicitação pendente ou amizade
  const [check] = await db.execute(
    "SELECT * FROM solicitacoes_amizade WHERE id_remetente=? AND id_destinatario=? AND status='pendente'",
    [idUsuario, idAmigo]
  );
  if(check.length>0) return res.status(400).json({error:"Solicitação já enviada"});

  await db.execute(
    "INSERT INTO solicitacoes_amizade (id_remetente,id_destinatario) VALUES (?,?)",
    [idUsuario, idAmigo]
  );
  res.json({msg:"Solicitação enviada"});
});

// 🔹 Carregar amigos
app.get("/amizades", auth, async(req,res)=>{
  const id = req.session.userId;
  const [rows] = await db.execute(
    `SELECT u.id,u.nome,u.foto_url FROM amizades a
     JOIN usuarios u ON (u.id = a.usuario1 OR u.id = a.usuario2)
     WHERE (a.usuario1=? OR a.usuario2=?) AND u.id != ?`,
     [id,id,id]
  );
  res.json(rows);
});

// 🔹 Listar solicitações recebidas
app.get("/solicitacoes", auth, async(req,res)=>{
  try{
    const id = req.session.userId;
    const [rows] = await db.execute(
      `SELECT s.id AS solicitacaoId, u.id AS remetenteId, u.nome, u.foto_url
       FROM solicitacoes_amizade s
       JOIN usuarios u ON s.id_remetente = u.id
       WHERE s.id_destinatario = ? AND s.status = 'pendente'`,
       [id]
    );
    res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao carregar solicitações"});
  }
});

// 🔹 Aceitar solicitação
app.post("/solicitacoes/aceitar", auth, async(req,res)=>{
  try{
    const { solicitacaoId } = req.body;
    await db.execute("UPDATE solicitacoes_amizade SET status='aceito' WHERE id=?", [solicitacaoId]);
    const [rows] = await db.execute("SELECT id_remetente, id_destinatario FROM solicitacoes_amizade WHERE id=?", [solicitacaoId]);
    const { id_remetente, id_destinatario } = rows[0];
    await db.execute("INSERT INTO amizades (usuario1, usuario2) VALUES (?,?)", [id_remetente, id_destinatario]);
    res.json({msg:"Solicitação aceita"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao aceitar solicitação"});
  }
});

// 🔹 Recusar solicitação
app.post("/solicitacoes/recusar", auth, async(req,res)=>{
  try{
    const { solicitacaoId } = req.body;
    await db.execute("UPDATE solicitacoes_amizade SET status='recusado' WHERE id=?", [solicitacaoId]);
    res.json({msg:"Solicitação recusada"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao recusar solicitação"});
  }
});

// 🔹 Teste
app.get("/teste",(req,res)=>{
  res.send("Servidor funcionando!");
});

// 🔹 Iniciar servidor
app.listen(3000,()=>console.log("Servidor rodando em http://localhost:3000"));
