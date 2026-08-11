// src/controllers/familiaController.js
const supabase = require('../config/supabase');
const { familiaSchema } = require('../utils/validators');

class FamiliaController {
    /**
     * Listar todas as famílias
     */
    async listar(req, res, next) {
        try {
            const { data, error } = await supabase
                .from('familias')
                .select('*')
                .order('codigo');

            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar uma família por ID
     */
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('familias')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Família não encontrada' });
                }
                throw error;
            }

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar uma família por código
     */
    async buscarPorCodigo(req, res, next) {
        try {
            const { codigo } = req.params;

            const { data, error } = await supabase
                .from('familias')
                .select('*')
                .eq('codigo', codigo)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ error: 'Família não encontrada' });
                }
                throw error;
            }

            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Criar uma nova família
     */
    async criar(req, res, next) {
        try {
            // Validação
            const { error: validationError, value } = familiaSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Verifica se o código já existe
            const { data: existente, error: checkError } = await supabase
                .from('familias')
                .select('id')
                .eq('codigo', value.codigo)
                .single();

            if (existente) {
                return res.status(400).json({ error: 'Código de família já está em uso' });
            }

            const { data, error } = await supabase
                .from('familias')
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
     * Atualizar uma família
     */
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;

            const { error: validationError, value } = familiaSchema.validate(req.body);
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            // Verifica se a família existe
            const { data: existente, error: findError } = await supabase
                .from('familias')
                .select('id')
                .eq('id', id)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Família não encontrada' });
            }

            // Verifica se o novo código já está em uso por outra família
            if (value.codigo) {
                const { data: duplicado, error: dupError } = await supabase
                    .from('familias')
                    .select('id')
                    .eq('codigo', value.codigo)
                    .neq('id', id)
                    .single();

                if (duplicado) {
                    return res.status(400).json({ error: 'Código de família já está em uso' });
                }
            }

            const { data, error } = await supabase
                .from('familias')
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
     * Excluir uma família
     */
    async excluir(req, res, next) {
        try {
            const { id } = req.params;

            // Verifica se a família existe
            const { data: existente, error: findError } = await supabase
                .from('familias')
                .select('id')
                .eq('id', id)
                .single();

            if (findError || !existente) {
                return res.status(404).json({ error: 'Família não encontrada' });
            }

            // Verifica se existem tipos vinculados
            const { count: tiposCount, error: tiposError } = await supabase
                .from('tipos')
                .select('id', { count: 'exact' })
                .eq('familia_id', id);

            if (tiposError) throw tiposError;

            if (tiposCount > 0) {
                return res.status(400).json({ 
                    error: 'Não é possível excluir a família pois existem tipos vinculados' 
                });
            }

            const { error } = await supabase
                .from('familias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FamiliaController();
