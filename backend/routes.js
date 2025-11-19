import supabase from './supabaseClient.js';

/**
 * Exemplo de Rotas do Backend (Node.js)
 * Estas funções simulam controllers que seriam chamados por rotas de uma API (Express/Fastify/Next.js API).
 */

// Rota: GET /admin/users
// Descrição: Retorna lista completa de usuários do sistema (Função de Superadmin)
// Ignora regras de RLS para ver todos os dados.
export const listAllUsers = async () => {
    console.log("🔎 Admin: Buscando todos os usuários no Supabase...");
    
    const { data, error } = await supabase
        .from('users')
        .select('id, email, name, plan, credits, status, created_at, last_login');

    if (error) {
        console.error("❌ Erro ao buscar usuários:", error.message);
        throw new Error("Falha crítica ao listar usuários.");
    }

    console.log(`✅ Sucesso: ${data.length} usuários encontrados.`);
    return data;
};

// Rota: POST /admin/credits/add
// Descrição: Adiciona créditos a um usuário específico (Ação Financeira Auditada)
export const addCredits = async (userId, amount, adminId) => {
    console.log(`💰 Admin: Adicionando ${amount} créditos ao usuário ${userId}...`);

    // Utiliza uma transação ou lógica sequencial
    try {
        // 1. Buscar saldo atual (Leitura privilegiada)
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single();

        if (fetchError) throw new Error("Usuário não encontrado ou erro de conexão.");

        const currentCredits = user.credits || 0;
        const newBalance = currentCredits + amount;

        // 2. Atualizar saldo (Escrita privilegiada)
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ credits: newBalance })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Registrar no Log de Auditoria (Essencial para segurança)
        const { error: auditError } = await supabase.from('audit_logs').insert({
            admin_id: adminId,
            target_user_id: userId,
            action: 'ADD_CREDITS_MANUAL',
            details: `Alteração de saldo: ${currentCredits} -> ${newBalance} (Delta: +${amount})`,
            timestamp: new Date().toISOString()
        });

        if (auditError) console.warn("⚠️ Aviso: Falha ao criar log de auditoria.", auditError);

        return updatedUser;

    } catch (error) {
        console.error("❌ Erro na operação de créditos:", error.message);
        throw error;
    }
};