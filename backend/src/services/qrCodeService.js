// src/services/qrCodeService.js
const QRCode = require('qrcode');

class QRCodeService {
    /**
     * Gera um QR Code em formato base64
     */
    async generateQRCode(data) {
        try {
            const qrCode = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.92,
                margin: 2,
                width: 300
            });
            return qrCode;
        } catch (error) {
            throw new Error(`Erro ao gerar QR Code: ${error.message}`);
        }
    }

    /**
     * Gera QR Code em formato Buffer (para download)
     */
    async generateQRCodeBuffer(data) {
        try {
            const buffer = await QRCode.toBuffer(data, {
                errorCorrectionLevel: 'H',
                type: 'png',
                width: 300
            });
            return buffer;
        } catch (error) {
            throw new Error(`Erro ao gerar QR Code: ${error.message}`);
        }
    }

    /**
     * Valida se um QR Code é válido
     */
    validateQRCode(qrCode) {
        // Verifica se é uma string base64 válida
        if (!qrCode || typeof qrCode !== 'string') {
            return false;
        }
        // Verifica se começa com data:image/png;base64
        return qrCode.startsWith('data:image/png;base64');
    }
}

module.exports = new QRCodeService();
