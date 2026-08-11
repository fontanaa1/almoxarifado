// server.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ============================================
// ROTA RAIZ (Evita o erro "Cannot GET /")
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API de Gerenciamento de Estoque ativa e rodando!',
        status: 'online',
        endpoints: {
            familias: '/api/familias',
            tipos: '/api/tipos',
            materiais: '/api/materiais',
            movimentacoes: '/api/movimentacoes',
            estatisticas: '/api/estatisticas',
            health: '/health'
        }
    });
});

// ============================================
// ENDPOINTS - FAMÍLIAS
// ============================================

// Listar todas as famílias
app.get('/api/familias', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('familias')
            .select('*')
            .order('codigo');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar família
app.post('/api/familias', async (req, res) => {
    try {
        const { codigo, nome, descricao } = req.body;

        if (!codigo || !nome) {
            return res.status(400).json({ error: 'Código e nome são obrigatórios' });
        }

        const { data, error } = await supabase
            .from('familias')
            .insert([{ codigo, nome, descricao }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINTS - TIPOS
// ============================================

// Listar tipos por família
app.get('/api/tipos', async (req, res) => {
    try {
        const { familia_id, familia_codigo } = req.query;
        let query = supabase.from('tipos').select('*');

        if (familia_id) {
            query = query.eq('familia_id', familia_id);
        }

        if (familia_codigo) {
            // Busca a família pelo código
            const { data: familia, error: famError } = await supabase
                .from('familias')
                .select('id')
                .eq('codigo', familia_codigo)
                .single();

            if (famError) {
                if (famError.code === 'PGRST116') {
                    return res.json([]);
                }
                throw famError;
            }

            query = query.eq('familia_id', familia.id);
        }

        const { data, error } = await query.order('codigo');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar tipo
app.post('/api/tipos', async (req, res) => {
    try {
        const { familia_id, codigo, nome, descricao } = req.body;

        if (!familia_id || !codigo || !nome) {
            return res.status(400).json({ error: 'Familia_id, código e nome são obrigatórios' });
        }

        const { data, error } = await supabase
            .from('tipos')
            .insert([{ familia_id, codigo, nome, descricao }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINTS - MATERIAIS
// ============================================

// Listar materiais com filtros
app.get('/api/materiais', async (req, res) => {
    try {
        const { status, search, familia, tipo, limit = 100, page = 1 } = req.query;

        let query = supabase
            .from('materiais')
            .select('*', { count: 'exact' });

        if (status && status !== 'todos') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`nome.ilike.%${search}%,sku.ilike.%${search}%,categoria.ilike.%${search}%`);
        }

        if (familia && familia !== 'todos') {
            query = query.ilike('sku', `${familia}.%`);
        }

        if (tipo && tipo !== 'todos') {
            query = query.ilike('sku', `%.${tipo}.%`);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { data, error, count } = await query
            .order('nome')
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;
        
        res.json({
            data: data || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gerar próximo SKU
app.get('/api/materiais/proximo-sku', async (req, res) => {
    try {
        const { familia_codigo, tipo_codigo } = req.query;

        if (!familia_codigo || !tipo_codigo) {
            return res.status(400).json({ error: 'Código da família e tipo são obrigatórios' });
        }

        // Valida se os códigos existem
        const { data: familia, error: famError } = await supabase
            .from('familias')
            .select('codigo')
            .eq('codigo', familia_codigo)
            .single();

        if (famError || !familia) {
            return res.status(400).json({ error: 'Família não encontrada' });
        }

        const { data: tipo, error: tipoError } = await supabase
            .from('tipos')
            .select('codigo')
            .eq('codigo', tipo_codigo)
            .single();

        if (tipoError || !tipo) {
            return res.status(400).json({ error: 'Tipo não encontrado' });
        }

        // Busca o próximo SKU
        const { data, error } = await supabase
            .rpc('gerar_proximo_sku', {
                p_familia_codigo: familia_codigo,
                p_tipo_codigo: tipo_codigo
            });

        if (error) throw error;
        res.json({ sku: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar material
app.post('/api/materiais', async (req, res) => {
    try {
        const { 
            sku, nome, descricao, categoria, localizacao, 
            quantidade = 0, estoque_minimo = 0, status = 'ativo' 
        } = req.body;

        if (!sku || !nome) {
            return res.status(400).json({ error: 'SKU e nome são obrigatórios' });
        }

        // Gera QR Code
        const qrCode = await QRCode.toDataURL(sku);

        const { data, error } = await supabase
            .from('materiais')
            .insert([{ 
                sku, nome, descricao, categoria, localizacao, 
                quantidade, estoque_minimo, status, qr_code: qrCode 
            }])
            .select()
            .single();

        if (error) throw error;

        // Registra a movimentação de entrada
        if (quantidade > 0) {
            await supabase
                .from('movimentacoes')
                .insert([{
                    material_id: data.id,
                    tipo: 'entrada',
                    quantidade: quantidade,
                    responsavel: req.body.responsavel || 'Sistema',
                    observacao: 'Cadastro inicial'
                }]);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar material por SKU
app.get('/api/materiais/:sku', async (req, res) => {
    try {
        const { sku } = req.params;

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
        res.status(500).json({ error: error.message });
    }
});

// Atualizar material
app.put('/api/materiais/:sku', async (req, res) => {
    try {
        const { sku } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('materiais')
            .update(updates)
            .eq('sku', sku)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir material
app.delete('/api/materiais/:sku', async (req, res) => {
    try {
        const { sku } = req.params;

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
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINTS - MOVIMENTAÇÕES
// ============================================

// Registrar entrada
app.post('/api/movimentacoes/entrada', async (req, res) => {
    try {
        const { sku, quantidade, responsavel, localizacao } = req.body;

        if (!sku || !quantidade || quantidade <= 0) {
            return res.status(400).json({ error: 'SKU e quantidade válida são obrigatórios' });
        }

        // Busca o material
        const { data: material, error: findError } = await supabase
            .from('materiais')
            .select('*')
            .eq('sku', sku)
            .single();

        if (findError || !material) {
            return res.status(404).json({ error: 'Material não encontrado' });
        }

        // Atualiza quantidade e localização
        const novaQuantidade = material.quantidade + parseInt(quantidade);
        const updates = { quantidade: novaQuantidade };

        if (localizacao) {
            updates.localizacao = localizacao;
        }

        if (material.status === 'morto') {
            updates.status = 'ativo';
            updates.motivo_arquivamento = null;
            updates.data_arquivamento = null;
        }

        const { data: updated, error: updateError } = await supabase
            .from('materiais')
            .update(updates)
            .eq('sku', sku)
            .select()
            .single();

        if (updateError) throw updateError;

        // Registra a movimentação
        const { error: movError } = await supabase
            .from('movimentacoes')
            .insert([{
                material_id: material.id,
                tipo: 'entrada',
                quantidade: quantidade,
                responsavel: responsavel || 'Operador',
                observacao: `Entrada no estoque${localizacao ? ` - Localização: ${localizacao}` : ''}`
            }]);

        if (movError) throw movError;

        res.json({ 
            message: 'Entrada registrada com sucesso', 
            material: updated,
            movimentacao: {
                tipo: 'entrada',
                quantidade,
                responsavel: responsavel || 'Operador'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registrar saída (retirada)
app.post('/api/movimentacoes/saida', async (req, res) => {
    try {
        const { sku, quantidade, responsavel, motivo } = req.body;

        if (!sku || !quantidade || quantidade <= 0) {
            return res.status(400).json({ error: 'SKU e quantidade válida são obrigatórios' });
        }

        // Busca o material
        const { data: material, error: findError } = await supabase
            .from('materiais')
            .select('*')
            .eq('sku', sku)
            .single();

        if (findError || !material) {
            return res.status(404).json({ error: 'Material não encontrado' });
        }

        // Valida saldo
        if (material.quantidade < parseInt(quantidade)) {
            return res.status(400).json({ 
                error: `Saldo insuficiente. Disponível: ${material.quantidade}` 
            });
        }

        // Atualiza quantidade
        const novaQuantidade = material.quantidade - parseInt(quantidade);
        const updates = { quantidade: novaQuantidade };

        if (novaQuantidade === 0) {
            updates.status = 'baixa';
        }

        const { data: updated, error: updateError } = await supabase
            .from('materiais')
            .update(updates)
            .eq('sku', sku)
            .select()
            .single();

        if (updateError) throw updateError;

        // Registra a movimentação
        const { error: movError } = await supabase
            .from('movimentacoes')
            .insert([{
                material_id: material.id,
                tipo: 'saida',
                quantidade: quantidade,
                responsavel: responsavel || 'Operador',
                motivo: motivo || 'Retirada de estoque',
                observacao: `Saída do estoque - ${motivo || 'Uso interno'}`
            }]);

        if (movError) throw movError;

        res.json({ 
            message: 'Saída registrada com sucesso', 
            material: updated,
            movimentacao: {
                tipo: 'saida',
                quantidade,
                responsavel: responsavel || 'Operador',
                motivo: motivo || 'Retirada de estoque'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Arquivar material
app.post('/api/materiais/:sku/arquivar', async (req, res) => {
    try {
        const { sku } = req.params;
        const { motivo } = req.body;

        const { data, error } = await supabase
            .from('materiais')
            .update({ 
                status: 'morto', 
                motivo_arquivamento: motivo || 'Arquivado',
                data_arquivamento: new Date().toISOString().split('T')[0]
            })
            .eq('sku', sku)
            .select()
            .single();

        if (error) throw error;

        // Registra a movimentação
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
        res.status(500).json({ error: error.message });
    }
});

// Restaurar material do arquivo morto
app.post('/api/materiais/:sku/restaurar', async (req, res) => {
    try {
        const { sku } = req.params;

        const { data, error } = await supabase
            .from('materiais')
            .update({ 
                status: 'ativo', 
                motivo_arquivamento: null,
                data_arquivamento: null
            })
            .eq('sku', sku)
            .select()
            .single();

        if (error) throw error;

        // Registra a movimentação
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
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINTS - HISTÓRICO
// ============================================

// Buscar histórico de movimentações
app.get('/api/movimentacoes', async (req, res) => {
    try {
        const { material_id, tipo, startDate, endDate, limit = 100, page = 1 } = req.query;

        let query = supabase
            .from('movimentacoes')
            .select('*', { count: 'exact' });

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

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;
        
        res.json({
            data: data || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Estatísticas do estoque
app.get('/api/estatisticas', async (req, res) => {
    try {
        // Total de materiais
        const { count: total } = await supabase
            .from('materiais')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'ativo');

        // Itens com estoque baixo
        const { data: activeMaterials } = await supabase
            .from('materiais')
            .select('*')
            .eq('status', 'ativo');

        const lowStock = activeMaterials ? activeMaterials.filter(item => item.quantidade < item.estoque_minimo) : [];

        // Total de categorias
        const { data: categories } = await supabase
            .from('materiais')
            .select('categoria')
            .eq('status', 'ativo')
            .not('categoria', 'is', null);

        const uniqueCategories = new Set(categories?.map(c => c.categoria) || []);

        // Total arquivados
        const { count: archived } = await supabase
            .from('materiais')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'morto');

        // Movimentações do dia
        const today = new Date().toISOString().split('T')[0];
        const { count: movToday } = await supabase
            .from('movimentacoes')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);

        res.json({
            total: total || 0,
            low_stock: lowStock?.length || 0,
            low_stock_items: lowStock || [],
            categories: uniqueCategories.size || 0,
            archived: archived || 0,
            movimentacoes_hoje: movToday || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROTA DE SAÚDE
// ============================================
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// EXPORTAÇÃO E INICIALIZAÇÃO
// ============================================

// Execução local (quando o arquivo for chamado diretamente)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`📦 API: http://localhost:${PORT}/api/familias`);
    });
}

// Exporta para a Vercel (obrigatório para Serverless Functions)
module.exports = app;