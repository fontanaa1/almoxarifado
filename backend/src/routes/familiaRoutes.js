// src/routes/familiaRoutes.js
const express = require('express');
const router = express.Router();
const familiaController = require('../controllers/familiaController');

router.get('/', familiaController.listar);
router.get('/:id', familiaController.buscarPorId);
router.get('/codigo/:codigo', familiaController.buscarPorCodigo);
router.post('/', familiaController.criar);
router.put('/:id', familiaController.atualizar);
router.delete('/:id', familiaController.excluir);

module.exports = router;
