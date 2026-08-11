// src/controllers/materialController.js
const supabase = require('../config/supabase');
const { materialSchema } = require('../utils/validators');
const skuService = require('../services/skuService');
const qrCodeService = require('../services/qrCodeService');
const { getStatusFromQuantity, isValidSku } = require('../utils/helpers');

class MaterialController {
    /**
     * Listar materiais com filtros
     */
    async listar(req, res, next) {
        try {
            const { 
                status, 
                search, 
                familia, 
                tipo, 
                limit = 100, 
                page = 1,
                orderBy = 'nome',
                orderDirection = 'asc'
            } = req.query;

            let query = supabase
                .from('materiais')
                .select('*');

            // Filtro por status
            if (status && status !== 'todos') {
                query = query.eq('status', status);
            }

            // Busca textual
            if (search) {
                query = query.or(
                    `nome.ilike.%${search}%,` +
                    `sku.ilike.%${search}%,` +
                    `categoria.ilike.%${search}%,` +
                    `descricao.ilike.%${search}%`
                );
            }

            // Filtro por família
            if (familia && familia !== 'todos') {
                query = query.ilike('sku', `${familia}.%`);
            }

            // Filtro por tipo
            if (tipo && tipo !== 'todos') {
                query = query.ilike('sku', `%.${tipo}.%`);
            }

            // Paginação
            const offset = (page - 1) * limit;
            query = query
                .order(orderBy, { ascending: orderDirection === 'asc' })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            res.json({
                data,
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
     * Buscar material por SKU
     */
    async buscarPorSku(req, res, next) {
        try {
            const { sku } = req.params;

            if (!isValidSku(sku)) {
                return res.status(400).json({ error: 'Formato de SKU inválido' });
            }

            const { data, error } = await supabase
                .from('materiais')
                .select('*')
                .eq('sku', sku)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Material não encontrado' });
                }
                throw error;
            }

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar material por ID
     */
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('materiais')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Material não encontrado' });
                }
                throw error;
            }

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gerar próximo SKU
     */
    async gerarProximoSKU(req, res, next) {
        try {
            const { familia_codigo, tipo_codigo } = req.query;

            if (!familia_codigo || !tipo_codigo) {
                return res.status(400).json({ 
                    error: 'Código da família e tipo são obrigatórios' 
                });
            }

            const sku = await skuService.gerarProximoSKU(familia_codigo, tipo_codigo);
            res.json({ sku });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Criar novo material
     */
    async criar(req, res, next) {
        try {
            const { error: validationError, value } = materialSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Valida SKU
            await skuService.validarSKU(value.sku);

            // Define status baseado na quantidade
            value.status = getStatusFromQuantity(value.quantidade, value.status);

            // Gera QR Code
            const qrCode = await qrCodeService.generateQRCode(value.sku);
            value.qr_code = qrCode;

            const { data, error } = await supabase
                .from('materiais')
                .insert([value])
                .select()
                .single();

            if (error) throw error;

            // Registra movimentação de entrada
            if (value.quantidade > 0) {
                await supabase
                    .from('movimentacoes')
                    .insert([{
                        material_id: data.id,
                        tipo: 'entrada',
                        quantidade: value.quantidade,
                        responsavel: req.body.responsavel || 'Sistema',
                        observacao: 'Cadastro inicial do material'
                    }]);
            }

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Atualizar material
     */
    async atualizar(req, res, next) {
        try {
            const { sku } = req.params;

            if (!isValidSku(sku)) {
                return res.status(400).json({ error: 'Formato de SKU inválido' });
            }

            // Verifica se o material existe
            const { data: existente, error: findError } = await supabase
                .from('materiais')
                .select('*')
                .eq('sku', sku)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            const updates = req.body;
            
            // Remove campos que não podem ser atualizados
            delete updates.sku;
            delete updates.id;
            delete updates.created_at;
            delete updates.qr_code;

            // Atualiza status se necessário
            if (updates.quantidade !== undefined && updates.status !== 'morto') {
                updates.status = getStatusFromQuantity(updates.quantidade, existente.status);
            }

            const { data, error } = await supabase
                .from('materiais')
                .update(updates)
                .eq('sku', sku)
                .select()
                .single();

            if (error) throw error;

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Excluir material
     */
    async excluir(req, res, next) {
        try {
            const { sku } = req.params;

            if (!isValidSku(sku)) {
                return res.status(400).json({ error: 'Formato de SKU inválido' });
            }

            // Verifica se o material existe
            const { data: existente, error: findError } = await supabase
                .from('materiais')
                .select('id')
                .eq('sku', sku)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            // Exclui movimentações relacionadas
            await supabase
                .from('movimentacoes')
                .delete()
                .eq('material_id', existente.id);

            // Exclui o material
            const { error } = await supabase
                .from('materiais')
                .delete()
                .eq('sku', sku);

            if (error) throw error;

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Arquivar material
     */
    async arquivar(req, res, next) {
        try {
            const { sku } = req.params;
            const { motivo } = req.body;

            if (!isValidSku(sku)) {
                return res.status(400).json({ error: 'Formato de SKU inválido' });
            }

            // Verifica se o material existe
            const { data: existente, error: findError } = await supabase
                .from('materiais')
                .select('*')
                .eq('sku', sku)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            if (existente.status === 'morto') {
                return res.status(400).json({ error: 'Material já está arquivado' });
            }

            const updates = {
                status: 'morto',
                motivo_arquivamento: motivo || 'Arquivado',
                data_arquivamento: new Date().toISOString().split('T')[0]
            };

            const { data, error } = await supabase
                .from('materiais')
                .update(updates)
                .eq('sku', sku)
                .select()
                .single();

            if (error) throw error;

            // Registra movimentação
            await supabase
                .from('movimentacoes')
                .insert([{
                    material_id: data.id,
                    tipo: 'arquivamento',
                    quantidade: 0,
                    responsavel: req.body.responsavel || 'Sistema',
                    motivo: motivo || 'Arquivado',
                    observacao: `Material movido para arquivo morto - ${motivo || 'Sem motivo informado'}`
                }]);

            res.json({ message: 'Material arquivado com sucesso', material: data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restaurar material do arquivo morto
     */
    async restaurar(req, res, next) {
        try {
            const { sku } = req.params;

            if (!isValidSku(sku)) {
                return res.status(400).json({ error: 'Formato de SKU inválido' });
            }

            // Verifica se o material existe
            const { data: existente, error: findError } = await supabase
                .from('materiais')
                .select('*')
                .eq('sku', sku)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Material não encontrado' });
            }

            if (existente.status !== 'morto') {
                return res.status(400).json({ error: 'Material não está arquivado' });
            }

            const updates = {
                status: getStatusFromQuantity(existente.quantidade, 'ativo'),
                motivo_arquivamento: null,
                data_arquivamento: null
            };

            const { data, error } = await supabase
                .from('materiais')
                .update(updates)
                .eq('sku', sku)
                .select()
                .single();

            if (error) throw error;

            // Registra movimentação
            await supabase
                .from('movimentacoes')
                .insert([{
                    material_id: data.id,
                    tipo: 'restauracao',
                    quantidade: 0,
                    responsavel: req.body.responsavel || 'Sistema',
                    observacao: 'Material restaurado do arquivo morto'
                }]);

            res.json({ message: 'Material restaurado com sucesso', material: data });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MaterialController();
