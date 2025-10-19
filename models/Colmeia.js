const mongoose = require("mongoose");

// Definindo a estrutura (Schema) para o nosso modelo de Colmeia
const ColmeiaSchema = new mongoose.Schema({
    identificador: {
        type: String,
        required: [true, "O campo identificador é obrigatório."],
        unique: true // Garante que cada colmeia tenha um identificador único
    },
    localizacao: {
        type: String,
        required: [true, "O campo localização é obrigatório."]
    },
    dataInstalacao: {
        type: Date,
        default: Date.now
    },
    temperaturaInterna: {
        type: Number,
        required: false, // Dados do sensor podem não estar sempre disponíveis
        default: null
    },
    umidadeInterna: {
        type: Number,
        required: false,
        default: null
    },
    peso: {
        type: Number,
        required: false,
        default: null,
        min: [0, "O peso não pode ser negativo."]
    },
    // Timestamps automáticos para criação e atualização do registro
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Criando e exportando o modelo
// O mongoose.model() recebe 3 parâmetros:
// 1. O nome do modelo ("Colmeia")
// 2. O Schema que define a estrutura (ColmeiaSchema)
// 3. O nome da coleção no MongoDB ("colmeias")
module.exports = mongoose.model("Colmeia", ColmeiaSchema, 'colmeias');