// src/controllers/tipoController.js
const supabase = require('../config/supabase');
const { tipoSchema } = require('../utils/validators');

class TipoController {
    /**
     * Listar todos os tipos (com filtro por família)
     */
    async listar(req, res, next) {
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
            next(error);
        }
    }

    /**
     * Buscar um tipo por ID
     */
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('tipos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Tipo não encontrado' });
                }
                throw error;
            }

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Criar um novo tipo
     */
    async criar(req, res, next) {
        try {
            const { error: validationError, value } = tipoSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Verifica se a família existe
            const { data: familia, error: famError } = await supabase
                .from('familias')
                .select('id')
                .eq('id', value.familia_id)
                .single();

            if (famError || !familia) {
                return res.status(404).json({ error: 'Família não encontrada' });
            }

            // Verifica se o código já existe para esta família
            const { data: existente, error: checkError } = await supabase
                .from('tipos')
                .select('id')
                .eq('familia_id', value.familia_id)
                .eq('codigo', value.codigo)
                .single();

            if (existente) {
                return res.status(400).json({ error: 'Código de tipo já está em uso para esta família' });
            }

            const { data, error } = await supabase
                .from('tipos')
                .insert([value])
                .select()
                .single();

            if (error) throw error;

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Atualizar um tipo
     */
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;

            const { error: validationError, value } = tipoSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Verifica se o tipo existe
            const { data: existente, error: findError } = await supabase
                .from('tipos')
                .select('id, familia_id')
                .eq('id', id)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Tipo não encontrado' });
            }

            // Verifica se a família existe
            if (value.familia_id) {
                const { data: familia, error: famError } = await supabase
                    .from('familias')
                    .select('id')
                    .eq('id', value.familia_id)
                    .single();

                if (famError || !familia) {
                    return res.status(404).json({ error: 'Família não encontrada' });
                }
            }

            // Verifica se o código já está em uso por outro tipo
            if (value.codigo) {
                const { data: duplicado, error: dupError } = await supabase
                    .from('tipos')
                    .select('id')
                    .eq('familia_id', value.familia_id || existente.familia_id)
                    .eq('codigo', value.codigo)
                    .neq('id', id)
                    .single();

                if (duplicado) {
                    return res.status(400).json({ error: 'Código de tipo já está em uso' });
                }
            }

            const { data, error } = await supabase
                .from('tipos')
                .update(value)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Excluir um tipo
     */
    async excluir(req, res, next) {
        try {
            const { id } = req.params;

            // Verifica se o tipo existe
            const { data: existente, error: findError } = await supabase
                .from('tipos')
                .select('id')
                .eq('id', id)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Tipo não encontrado' });
            }

            // Verifica se existem materiais vinculados
            const { count: materiaisCount, error: matError } = await supabase
                .from('materiais')
                .select('id', { count: 'exact' })
                .ilike('sku', `%.${existente.codigo}.%`);

            if (matError) throw matError;

            if (materiaisCount > 0) {
                return res.status(400).json({ 
                    error: 'Não é possível excluir o tipo pois existem materiais vinculados' 
                });
            }

            const { error } = await supabase
                .from('tipos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TipoController();
