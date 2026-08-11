// src/controllers/estatisticaController.js
const supabase = require('../config/supabase');

class EstatisticaController {
    /**
     * Obter estatísticas gerais
     */
    async getStats(req, res, next) {
        try {
            // Total de materiais ativos
            const { count: total, error: totalError } = await supabase
                .from('materiais')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'ativo');

            if (totalError) throw totalError;

            // Itens com estoque baixo
            const { data: lowStockData, error: lowError } = await supabase
                .from('materiais')
                .select('id, nome, sku, quantidade, estoque_minimo')
                .eq('status', 'ativo')
                .lt('quantidade', supabase.raw('estoque_minimo'))
                .order('quantidade', { ascending: true });

            if (lowError) throw lowError;

            // Categorias únicas
            const { data: categoriesData, error: catError } = await supabase
                .from('materiais')
                .select('categoria')
                .eq('status', 'ativo')
                .not('categoria', 'is', null);

            if (catError) throw catError;

            const uniqueCategories = new Set(categoriesData?.map(c => c.categoria) || []);
            
            // Total arquivados
            const { count: archived, error: archError } = await supabase
                .from('materiais')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'morto');

            if (archError) throw archError;

            // Movimentações hoje
            const today = new Date().toISOString().split('T')[0];
            const { count: movToday, error: movError } = await supabase
                .from('movimentacoes')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            if (movError) throw movError;

            // Estoque total
            const { data: stockData, error: stockError } = await supabase
                .from('materiais')
                .select('quantidade')
                .eq('status', 'ativo');

            if (stockError) throw stockError;

            const totalStock = stockData?.reduce((acc, item) => acc + (item.quantidade || 0), 0) || 0;

            res.json({
                total: total || 0,
                low_stock: lowStockData?.length || 0,
                low_stock_items: lowStockData || [],
                categories: uniqueCategories.size || 0,
                archived: archived || 0,
                movimentacoes_hoje: movToday || 0,
                total_estoque: totalStock
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Estatísticas por categoria
     */
    async getStatsByCategory(req, res, next) {
        try {
            const { data, error } = await supabase
                .from('materiais')
                .select('categoria, quantidade, status')
                .eq('status', 'ativo')
                .not('categoria', 'is', null);

            if (error) throw error;

            const stats = data.reduce((acc, item) => {
                if (!acc[item.categoria]) {
                    acc[item.categoria] = {
                        total: 0,
                        quantidade: 0
                    };
                }
                acc[item.categoria].total++;
                acc[item.categoria].quantidade += item.quantidade || 0;
                return acc;
            }, {});

            const result = Object.entries(stats).map(([categoria, valores]) => ({
                categoria,
                ...valores
            }));

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Estatísticas por status
     */
    async getStatsByStatus(req, res, next) {
        try {
            const { data, error } = await supabase
                .from('materiais')
                .select('status, quantidade, id');

            if (error) throw error;

            const stats = data.reduce((acc, item) => {
                if (!acc[item.status]) {
                    acc[item.status] = {
                        total: 0,
                        quantidade: 0
                    };
                }
                acc[item.status].total++;
                acc[item.status].quantidade += item.quantidade || 0;
                return acc;
            }, {});

            const result = Object.entries(stats).map(([status, valores]) => ({
                status,
                ...valores
            }));

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Movimentações por período
     */
    async getMovimentacoesPeriodo(req, res, next) {
        try {
            const { dias = 7 } = req.query;

            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - parseInt(dias));
            dataInicio.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('movimentacoes')
                .select('tipo, quantidade, created_at')
                .gte('created_at', dataInicio.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Agrupa por dia e tipo
            const result = data.reduce((acc, item) => {
                const date = item.created_at.split('T')[0];
                if (!acc[date]) {
                    acc[date] = {
                        date,
                        entrada: 0,
                        saida: 0,
                        arquivamento: 0,
                        restauracao: 0
                    };
                }
                acc[date][item.tipo] = (acc[date][item.tipo] || 0) + item.quantidade;
                return acc;
            }, {});

            res.json(Object.values(result));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EstatisticaController();
