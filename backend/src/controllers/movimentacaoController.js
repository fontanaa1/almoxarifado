// src/controllers/movimentacaoController.js
const supabase = require('../config/supabase');
const { movimentacaoSchema, arquivamentoSchema } = require('../utils/validators');
const { isValidSku, getStatusFromQuantity } = require('../utils/helpers');

class MovimentacaoController {
    /**
     * Listar movimentações com filtros
     */
    async listar(req, res, next) {
        try {
            const { 
                material_id, 
                tipo, 
                startDate, 
                endDate, 
                limit = 100,
                page = 1
            } = req.query;

            let query = supabase
                .from('movimentacoes')
                .select('*');

            if (material_id) {
                query = query.eq('material_id', material_id);
            }

            if (tipo) {
                query = query.eq('tipo', tipo);
            }

            if (startDate) {
                query = query.gte('created_at', startDate);
            }

            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            // Paginação
            const offset = (page - 1) * limit;
            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            // Busca informações dos materiais
            const materialIds = data.map(m => m.material_id).filter(id => id);
            let materiaisMap = {};
            if (materialIds.length > 0) {
                const { data: materiais, error: matError } = await supabase
                    .from('materiais')
                    .select('id, sku, nome, categoria')
                    .in('id', materialIds);

                if (!matError) {
                    materiaisMap = materiais.reduce((acc, m) => {
                        acc[m.id] = m;
                        return acc;
                    }, {});
                }
            }

            // Enriquece os dados com informações do material
            const enrichedData = data.map(mov => ({
                ...mov,
                material: materiaisMap[mov.material_id] || null
            }));

            res.json({
                data: enrichedData,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count || data.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Registrar entrada
     */
    async entrada(req, res, next) {
        try {
            const { error: validationError, value } = movimentacaoSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Busca o material
            const { data: material, error: findError } = await supabase
                .from('materiais')
                .select('*')
                .eq('sku', value.sku)
                .single();

            if (findError || !material) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            // Atualiza quantidade
            const novaQuantidade = material.quantidade + value.quantidade;
            const updates = { 
                quantidade: novaQuantidade,
                status: getStatusFromQuantity(novaQuantidade, material.status)
            };

            if (value.localizacao) {
                updates.localizacao = value.localizacao;
            }

            // Se estava arquivado, reativa
            if (material.status === 'morto') {
                updates.status = 'ativo';
                updates.motivo_arquivamento = null;
                updates.data_arquivamento = null;
            }

            const { data: updated, error: updateError } = await supabase
                .from('materiais')
                .update(updates)
                .eq('sku', value.sku)
                .select()
                .single();

            if (updateError) throw updateError;

            // Registra movimentação
            const { error: movError } = await supabase
                .from('movimentacoes')
                .insert([{
                    material_id: material.id,
                    tipo: 'entrada',
                    quantidade: value.quantidade,
                    responsavel: value.responsavel,
                    motivo: value.motivo || 'Entrada de estoque',
                    observacao: `Entrada no estoque${value.localizacao ? ` - Localização: ${value.localizacao}` : ''}`
                }]);

            if (movError) throw movError;

            res.json({ 
                message: 'Entrada registrada com sucesso', 
                material: updated,
                movimentacao: {
                    tipo: 'entrada',
                    quantidade: value.quantidade,
                    responsavel: value.responsavel
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Registrar saída
     */
    async saida(req, res, next) {
        try {
            const { error: validationError, value } = movimentacaoSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Busca o material
            const { data: material, error: findError } = await supabase
                .from('materiais')
                .select('*')
                .eq('sku', value.sku)
                .single();

            if (findError || !material) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            // Valida saldo
            if (material.quantidade < value.quantidade) {
                return res.status(400).json({ 
                    error: `Saldo insuficiente. Disponível: ${material.quantidade}` 
                });
            }

            // Atualiza quantidade
            const novaQuantidade = material.quantidade - value.quantidade;
            const updates = { 
                quantidade: novaQuantidade,
                status: getStatusFromQuantity(novaQuantidade, material.status)
            };

            const { data: updated, error: updateError } = await supabase
                .from('materiais')
                .update(updates)
                .eq('sku', value.sku)
                .select()
                .single();

            if (updateError) throw updateError;

            // Registra movimentação
            const { error: movError } = await supabase
                .from('movimentacoes')
                .insert([{
                    material_id: material.id,
                    tipo: 'saida',
                    quantidade: value.quantidade,
                    responsavel: value.responsavel,
                    motivo: value.motivo || 'Retirada de estoque',
                    observacao: `Saída do estoque - ${value.motivo || 'Uso interno'}`
                }]);

            if (movError) throw movError;

            res.json({ 
                message: 'Saída registrada com sucesso', 
                material: updated,
                movimentacao: {
                    tipo: 'saida',
                    quantidade: value.quantidade,
                    responsavel: value.responsavel,
                    motivo: value.motivo || 'Retirada de estoque'
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar movimentações por material
     */
    async buscarPorMaterial(req, res, next) {
        try {
            const { material_id } = req.params;
            const { limit = 50 } = req.query;

            const { data, error } = await supabase
                .from('movimentacoes')
                .select('*')
                .eq('material_id', material_id)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit));

            if (error) throw error;

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar movimentações por SKU
     */
    async buscarPorSku(req, res, next) {
        try {
            const { sku } = req.params;
            const { limit = 50 } = req.query;

            if (!isValidSku(sku)) {
                return res.status(400).json({ error: 'Formato de SKU inválido' });
            }

            // Busca o material
            const { data: material, error: findError } = await supabase
                .from('materiais')
                .select('id')
                .eq('sku', sku)
                .single();

            if (findError || !material) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            const { data, error } = await supabase
                .from('movimentacoes')
                .select('*')
                .eq('material_id', material.id)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit));

            if (error) throw error;

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MovimentacaoController();
