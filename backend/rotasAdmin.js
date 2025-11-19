
import supabase from './supabaseClient.js'; 

// /////////////////////////////////////////////////////////////
// A. MIDDLEWARE DE SEGURANÇA: requireAdmin
// /////////////////////////////////////////////////////////////

// Verifica se o usuário autenticado tem a role de 'super_admin'.
export const requireAdmin = async (req, res, next) => {
    // 1. Assuma que o ID do usuário é obtido do token de autenticação/sessão
    // Em um ambiente real (Express), isso viria de req.user
    const userId = req.user ? req.user.id : null; 

    if (!userId) {
         return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    // 2. Consulta o BD para buscar o 'role' (Papel)
    const { data, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return res.status(401).json({ erro: 'Usuário não autenticado ou não encontrado.' });
    }

    // 3. Checagem de Autorização
    if (data.role === 'super_admin') {
        // Se for admin, anexa a role ao request e prossegue
        req.user.role = data.role;
        next(); 
    } else {
        // Se não for admin, BLOQUEIA o acesso (erro 403 Forbidden)
        return res.status(403).json({ erro: 'Acesso Negado. Esta rota é restrita a administradores.' });
    }
};


// /////////////////////////////////////////////////////////////
// B. FUNÇÃO DE DADOS: getHistoricoPrompts
// /////////////////////////////////////////////////////////////

// Função que busca o histórico, aplicando filtro apenas para usuários 'standard'.
export const getHistoricoPrompts = async (req, res) => {
    // O ID e a ROLE são obtidos da sessão (e verificados pelo requireAdmin se a rota for admin)
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'standard'; 

    let query = supabase.from('historico_prompts').select('*');
    
    // ** LÓGICA DE FILTRO DE SEGURANÇA **
    if (userRole === 'standard') {
        // Usuário padrão: só pode ver o que ele mesmo criou
        if (userId) {
            query = query.eq('user_id', userId); 
            console.log(`Usuário Standard [${userId}]: Consulta filtrada por ID.`);
        } else {
            return res.status(401).json({ erro: 'ID de usuário necessário para filtro.' });
        }
    } else {
        // Superadmin: A consulta não é filtrada (vê todos)
        console.log("Superadmin: Consulta sem filtro (acesso total).");
    }

    // Ordenação e execução da consulta
    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ erro: 'Erro ao buscar histórico no banco de dados.' });
    }

    res.json(data);
};

// /////////////////////////////////////////////////////////////
// C. EXEMPLOS DE ROTAS (Comentário)
// /////////////////////////////////////////////////////////////

/*
// Rota de Administrador (Totalmente Protegida)
// Esta rota só pode ser acessada por Superadmins, graças ao middleware:
// router.get('/admin/historico-completo', requireAdmin, getHistoricoPrompts);

// Rota de Usuário Comum (Filtro por ID)
// Esta rota é acessada por todos, mas a função getHistoricoPrompts fará a filtragem interna:
// router.get('/meu-historico', getHistoricoPrompts); 
*/
