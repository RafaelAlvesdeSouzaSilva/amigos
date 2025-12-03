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

// 🔹 CORS para Live Server
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

// 🔹 Sessão
app.use(session({
  secret: "chaveSecreta123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24*60*60*1000,
    sameSite: "lax"
  }
}));

// 🔹 Uploads
const upload = multer({ dest: path.join(__dirname, "uploads") });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 Parse JSON e URL
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

// Registro
app.post("/register", upload.single("foto"), async(req,res)=>{
  try{
    const { nome,email,senha } = req.body;
    let foto_url = "https://i.imgur.com/QpZyV2K.png";
    if(req.file) foto_url = `/uploads/${req.file.filename}`;
    await db.execute("INSERT INTO usuarios (nome,email,senha,foto_url) VALUES (?,?,?,?)", [nome,email,senha,foto_url]);
    res.json({msg:"Cadastro ok"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao cadastrar usuário"});
  }
});

// Login
app.post("/login", async(req,res)=>{
  try{
    const { email, senha } = req.body;
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE email=? AND senha=?", [email,senha]);
    if(rows.length===0) return res.status(401).json({error:"Usuário ou senha incorreta"});
    req.session.userId = rows[0].id;
    res.json({msg:"Login ok", user:rows[0]});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao logar"});
  }
});

// Logout
app.post("/logout", auth, (req,res)=>{
  req.session.destroy();
  res.json({msg:"Logout ok"});
});

// Retornar usuário logado
app.get("/meu-usuario", auth, async(req,res)=>{
  try{
    const id = req.session.userId;
    const [rows] = await db.execute("SELECT id,nome,foto_url FROM usuarios WHERE id=?", [id]);
    res.json(rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao buscar usuário"});
  }
});

// Atualizar foto
app.post("/atualizar-foto", auth, upload.single("foto"), async(req,res)=>{
  try{
    const id = req.session.userId;
    if(!req.file) return res.status(400).json({error:"Nenhuma foto enviada"});
    const foto_url = `/uploads/${req.file.filename}`;
    await db.execute("UPDATE usuarios SET foto_url=? WHERE id=?", [foto_url, id]);
    res.json({msg:"Foto atualizada"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao atualizar foto"});
  }
});

// Buscar usuários
app.get("/buscar-usuarios", auth, async(req,res)=>{
  try{
    const nome = req.query.nome || "";
    const idUsuario = req.session.userId;
    const [rows] = await db.execute("SELECT id,nome,foto_url FROM usuarios WHERE nome LIKE ? AND id != ? LIMIT 20", [`%${nome}%`, idUsuario]);
    res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao buscar usuários"});
  }
});

// Adicionar amigo
app.post("/add-amigo", auth, async(req,res)=>{
  try{
    const { idAmigo } = req.body;
    const idUsuario = req.session.userId;
    await db.execute("INSERT INTO amizades (usuario1, usuario2) VALUES (?,?)", [idUsuario, idAmigo]);
    res.json({msg:"Solicitação enviada"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao adicionar amigo"});
  }
});

// Carregar amigos (corrigido)
app.get("/amizades", auth, async(req,res)=>{
  try{
    const id = req.session.userId;

    // Amigos onde sou usuario1
    const [amigos1] = await db.execute(
      `SELECT u.id, u.nome, u.foto_url
       FROM amizades a
       JOIN usuarios u ON a.usuario2 = u.id
       WHERE a.usuario1 = ?`, [id]
    );

    // Amigos onde sou usuario2
    const [amigos2] = await db.execute(
      `SELECT u.id, u.nome, u.foto_url
       FROM amizades a
       JOIN usuarios u ON a.usuario1 = u.id
       WHERE a.usuario2 = ?`, [id]
    );

    const amigos = [...amigos1, ...amigos2];

    res.json(amigos);
  }catch(err){
    console.error(err);
    res.status(500).json({error:"Erro ao carregar amigos"});
  }
});

// Teste
app.get("/teste",(req,res)=>res.send("Servidor funcionando!"));

// 🔹 Iniciar servidor
app.listen(3000,()=>console.log("Servidor rodando em http://localhost:3000"));
