// src/routes/tipoRoutes.js
const express = require('express');
const router = express.Router();
const tipoController = require('../controllers/tipoController');

router.get('/', tipoController.listar);
router.get('/:id', tipoController.buscarPorId);
router.post('/', tipoController.criar);
router.put('/:id', tipoController.atualizar);
router.delete('/:id', tipoController.excluir);

module.exports = router;
