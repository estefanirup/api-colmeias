var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// --- INÍCIO: CONFIGURAÇÃO DO MONGODB ---
const mongoose = require("mongoose");
require("dotenv").config(); // Carrega as variáveis do arquivo .env

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
    throw new Error("A variável de ambiente MONGO_URL não está definida!");
}

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/colmeias', colmeiasRouter);

module.exports = app;