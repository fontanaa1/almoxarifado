// src/routes/movimentacaoRoutes.js
const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoController');

router.get('/', movimentacaoController.listar);
router.get('/material/:material_id', movimentacaoController.buscarPorMaterial);
router.get('/sku/:sku', movimentacaoController.buscarPorSku);
router.post('/entrada', movimentacaoController.entrada);
router.post('/saida', movimentacaoController.saida);

module.exports = router;
