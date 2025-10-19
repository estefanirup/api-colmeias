const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Colmeia = require('../models/Colmeia');

// Rota CREATE (POST): Para adicionar uma nova colmeia.
router.post('/', async (req, res) => {
    try {
        const novaColmeia = new Colmeia(req.body);
        const colmeiaSalva = await novaColmeia.save();
        res.status(201).json(colmeiaSalva); // 201 Created
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Erro de validação.", errors: error.errors }); // 400 Bad Request
        }
        // Tratamento para erro de chave duplicada (identificador)
        if (error.code === 11000) {
            return res.status(400).json({ message: "O identificador informado já existe." });
        }
        res.status(500).json({ message: "Ocorreu um erro interno no servidor.", error }); // 500 Internal Server Error
    }
});

// Rota READ (GET): Para obter todas as colmeias.
router.get('/', async (req, res) => {
    try {
        const colmeias = await Colmeia.find({});
        res.status(200).json(colmeias); // 200 OK
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor.", error });
    }
});

// Rota READ (GET by ID): Para obter uma colmeia específica pelo seu ID.
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se o ID fornecido tem um formato válido do MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "O ID fornecido é inválido." });
        }

        const colmeia = await Colmeia.findById(id);

        if (!colmeia) {
            return res.status(404).json({ message: "Colmeia não encontrada." }); // 404 Not Found
        }

        res.status(200).json(colmeia);
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor.", error });
    }
});

// Rota UPDATE (PUT by ID): Para atualizar os dados de uma colmeia.
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "O ID fornecido é inválido." });
        }
        
        // Adiciona a data de atualização ao corpo da requisição
        const dadosParaAtualizar = { ...req.body, updatedAt: new Date() };

        // { new: true } garante que o objeto retornado seja a versão já atualizada
        // { runValidators: true } faz com que as validações do Schema sejam aplicadas no update
        const colmeiaAtualizada = await Colmeia.findByIdAndUpdate(id, dadosParaAtualizar, { new: true, runValidators: true });

        if (!colmeiaAtualizada) {
            return res.status(404).json({ message: "Colmeia não encontrada para atualização." });
        }

        res.status(200).json(colmeiaAtualizada);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Erro de validação.", errors: error.errors });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: "O identificador informado já existe." });
        }
        res.status(500).json({ message: "Ocorreu um erro interno no servidor.", error });
    }
});

// Rota DELETE (DELETE by ID): Para remover o registro de uma colmeia.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "O ID fornecido é inválido." });
        }
        
        const colmeiaDeletada = await Colmeia.findByIdAndDelete(id);

        if (!colmeiaDeletada) {
            return res.status(404).json({ message: "Colmeia não encontrada para exclusão." });
        }

        res.status(200).json({ message: "Registro da colmeia deletado com sucesso." });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor.", error });
    }
});


module.exports = router;