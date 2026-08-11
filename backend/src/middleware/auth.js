// src/middleware/auth.js
const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token de autenticação não fornecido' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Erro na autenticação' });
    }
};

module.exports = authMiddleware;
