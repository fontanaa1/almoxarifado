// src/utils/validators.js
const Joi = require('joi');

// Validação de Família
const familiaSchema = Joi.object({
    codigo: Joi.string().length(3).pattern(/^[0-9]{3}$/).required(),
    nome: Joi.string().min(2).max(100).required(),
    descricao: Joi.string().max(500).allow('', null)
});

// Validação de Tipo
const tipoSchema = Joi.object({
    familia_id: Joi.string().uuid().required(),
    codigo: Joi.string().length(3).pattern(/^[0-9]{3}$/).required(),
    nome: Joi.string().min(2).max(100).required(),
    descricao: Joi.string().max(500).allow('', null)
});

// Validação de Material
const materialSchema = Joi.object({
    sku: Joi.string().pattern(/^[0-9]{3}\.[0-9]{3}\.[0-9]{4}$/).required(),
    nome: Joi.string().min(2).max(200).required(),
    descricao: Joi.string().max(1000).allow('', null),
    categoria: Joi.string().max(50).allow('', null),
    localizacao: Joi.string().max(100).allow('', null),
    quantidade: Joi.number().integer().min(0).default(0),
    estoque_minimo: Joi.number().integer().min(0).default(5),
    status: Joi.string().valid('ativo', 'morto', 'baixa').default('ativo'),
    responsavel: Joi.string().max(100).allow('', null)
});

// Validação de Movimentação
const movimentacaoSchema = Joi.object({
    sku: Joi.string().pattern(/^[0-9]{3}\.[0-9]{3}\.[0-9]{4}$/).required(),
    quantidade: Joi.number().integer().min(1).required(),
    responsavel: Joi.string().min(2).max(100).required(),
    motivo: Joi.string().max(500).allow('', null),
    localizacao: Joi.string().max(100).allow('', null)
});

const arquivamentoSchema = Joi.object({
    motivo: Joi.string().min(3).max(500).required()
});

module.exports = {
    familiaSchema,
    tipoSchema,
    materialSchema,
    movimentacaoSchema,
    arquivamentoSchema
};
