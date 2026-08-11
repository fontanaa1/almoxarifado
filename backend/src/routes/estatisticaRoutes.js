// src/routes/estatisticaRoutes.js
const express = require('express');
const router = express.Router();
const estatisticaController = require('../controllers/estatisticaController');

router.get('/', estatisticaController.getStats);
router.get('/categorias', estatisticaController.getStatsByCategory);
router.get('/status', estatisticaController.getStatsByStatus);
router.get('/movimentacoes', estatisticaController.getMovimentacoesPeriodo);

module.exports = router;
