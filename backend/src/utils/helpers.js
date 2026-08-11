// src/utils/helpers.js

function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function formatDateTime(date) {
    if (!date) return null;
    return new Date(date).toISOString();
}

function getStatusFromQuantity(quantidade, status) {
    if (status === 'morto') return 'morto';
    if (quantidade <= 0) return 'baixa';
    return 'ativo';
}

function generateSku(familiaCodigo, tipoCodigo, numero) {
    const numStr = String(numero).padStart(4, '0');
    return `${familiaCodigo}.${tipoCodigo}.${numStr}`;
}

function parseSku(sku) {
    const parts = sku.split('.');
    if (parts.length !== 3) return null;
    return {
        familia: parts[0],
        tipo: parts[1],
        numero: parseInt(parts[2])
    };
}

function isValidSku(sku) {
    return /^[0-9]{3}\.[0-9]{3}\.[0-9]{4}$/.test(sku);
}

module.exports = {
    formatDate,
    formatDateTime,
    getStatusFromQuantity,
    generateSku,
    parseSku,
    isValidSku
};
