// src/routes/materialRoutes.js
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.listar);
router.get('/proximo-sku', materialController.gerarProximoSKU);
router.get('/:sku', materialController.buscarPorSku);
router.get('/id/:id', materialController.buscarPorId);
router.post('/', materialController.criar);
router.put('/:sku', materialController.atualizar);
router.delete('/:sku', materialController.excluir);
router.post('/:sku/arquivar', materialController.arquivar);
router.post('/:sku/restaurar', materialController.restaurar);

module.exports = router;
