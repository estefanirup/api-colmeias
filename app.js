var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// --- INÍCIO: CONFIGURAÇÃO DO MONGODB ---
const mongoose = require("mongoose");
require("dotenv").config(); 
console.log("📦 MONGO_URL do .env:", process.env.MONGO_URL);

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
    throw new Error("A variável de ambiente MONGO_URL não está definida!");
}

const { startConsumer } = require('./messaging/consumer');

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
        startConsumer();
    })
    .catch(error => {
        console.error("Erro na conexão com o MongoDB!");
        console.error(error);
        process.exit(1);
    });

// --- FIM: CONFIGURAÇÃO DO MONGODB ---

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var colmeiasRouter = require('./routes/colmeias');

var app = express();

// ==========================================
// CORS GLOBAL
// ==========================================
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-api-key"
    );

    // Responde automaticamente requisições OPTIONS (preflight)
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// ==========================================
// CORS DO EXPRESS
// ==========================================
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-api-key"
    ]
}));

// ==========================================
// CONFIGURAÇÕES PADRÃO DO EXPRESS
// ==========================================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// ROTAS
// ==========================================
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/colmeias', colmeiasRouter);

module.exports = app;