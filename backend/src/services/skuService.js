// src/services/skuService.js
const supabase = require('../config/supabase');
const { generateSku, isValidSku } = require('../utils/helpers');

class SKUService {
    /**
     * Gera o próximo SKU disponível para uma família e tipo
     */
    async gerarProximoSKU(familiaCodigo, tipoCodigo) {
        // Valida se a família existe
        const { data: familia, error: famError } = await supabase
            .from('familias')
            .select('codigo')
            .eq('codigo', familiaCodigo)
            .single();

        if (famError || !familia) {
            throw new Error('Família não encontrada');
        }

        // Valida se o tipo existe
        const { data: tipo, error: tipoError } = await supabase
            .from('tipos')
            .select('codigo')
            .eq('codigo', tipoCodigo)
            .single();

        if (tipoError || !tipo) {
            throw new Error('Tipo não encontrado');
        }

        // Busca o maior número sequencial
        const { data, error } = await supabase
            .from('materiais')
            .select('sku')
            .ilike('sku', `${familiaCodigo}.${tipoCodigo}.%`)
            .order('sku', { ascending: false })
            .limit(1);

        if (error) {
            throw new Error('Erro ao gerar SKU');
        }

        let proximoNumero = 1;
        if (data && data.length > 0) {
            const lastSku = data[0].sku;
            const parts = lastSku.split('.');
            if (parts.length === 3) {
                proximoNumero = parseInt(parts[2]) + 1;
            }
        }

        return generateSku(familiaCodigo, tipoCodigo, proximoNumero);
    }

    /**
     * Valida se um SKU é válido e único
     */
    async validarSKU(sku) {
        if (!isValidSku(sku)) {
            throw new Error('Formato de SKU inválido');
        }

        const { data, error } = await supabase
            .from('materiais')
            .select('id')
            .eq('sku', sku)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error('Erro ao validar SKU');
        }

        if (data) {
            throw new Error('SKU já está em uso');
        }

        return true;
    }
}

module.exports = new SKUService();
