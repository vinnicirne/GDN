import supabase from './supabaseClient.js';

export default async function handler(req, res) {
    // --- SEUS DADOS DE SUPER ADMIN ---
    const EMAIL_ADMIN = 'agenciaiconedigital@gmail.com'; 
    const PASSWORD_ADMIN = '@@Vinni1105@@'; 
    const USER_NAME = 'Super Admin Vinni';

    try {
        console.log(`🚀 [Vercel] Iniciando configuração para: ${EMAIL_ADMIN}...`);

        // 1. Criar ou confirmar utilizador no Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: EMAIL_ADMIN,
            password: PASSWORD_ADMIN,
            options: { data: { name: USER_NAME } }
        });

        let userId;

        if (authError) {
            console.warn(`⚠️ Auth: Utilizador já deve existir ou houve erro: ${authError.message}`);
            // Tenta encontrar o ID pelo email se já existir
            const { data: userData } = await supabase
                .from('usuarios')
                .select('id')
                .eq('email', EMAIL_ADMIN)
                .single();
            
            if (userData) {
                userId = userData.id;
            } else {
                return res.status(500).json({ 
                    error: "Erro: O utilizador existe no Auth mas não na tabela 'usuarios'. Tente fazer login no site primeiro." 
                });
            }
        } else {
            userId = authData.user?.id;
        }

        if (!userId) return res.status(500).json({ error: "ID de utilizador não encontrado." });

        // 2. Dar poderes de Super Admin (Upsert)
        const { error: dbError } = await supabase
            .from('usuarios')
            .upsert({ 
                id: userId,
                email: EMAIL_ADMIN,
                name: USER_NAME,
                role: 'super_admin',       // <--- O poder de Admin
                creditos_saldo: 999999,    // <--- Créditos ilimitados
                plan: 'Enterprise',
                status: 'active',
                created_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (dbError) {
            return res.status(500).json({ error: `Erro no Banco: ${dbError.message}` });
        }

        return res.status(200).json({ 
            success: true, 
            message: `Sucesso! O utilizador ${EMAIL_ADMIN} agora é Super Admin.` 
        });

    } catch (error) {
        return res.status(500).json({ error: `Erro Interno: ${error.message}` });
    }
}