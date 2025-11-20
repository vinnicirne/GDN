// Arquivo: backend/setupAdmin.js
// COMO RODAR: 
// 1. Certifique-se de ter as variáveis de ambiente carregadas (dotenv) ou defina antes de rodar.
// 2. No terminal: node backend/setupAdmin.js

import supabase from './supabaseClient.js'; // Certifique-se que este client usa a SERVICE_ROLE_KEY

const setupSuperAdmin = async () => {
    // --- DADOS DO SUPER ADMIN ---
    const EMAIL_ADMIN = 'agenciaiconedigital@gmail.com'; 
    const PASSWORD_ADMIN = '@@Vinni1105@@'; 
    const USER_NAME = 'Super Admin Vinni';

    console.log(`🚀 Iniciando configuração para: ${EMAIL_ADMIN}...`);

    // 1. Tenta criar o usuário no sistema de Autenticação (Auth)
    // Nota: Se o usuário já existir no Auth, isso retorna erro, mas podemos prosseguir para atualizar a role.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: EMAIL_ADMIN,
        password: PASSWORD_ADMIN,
        options: {
            data: { name: USER_NAME } // Metadados opcionais
        }
    });

    let userId;

    if (authError) {
        console.warn(`⚠️ Aviso no Auth (pode ser que já exista): ${authError.message}`);
        // Se já existe, precisamos buscar o ID dele para garantir
        const { data: userData } = await supabase.from('usuarios').select('id').eq('email', EMAIL_ADMIN).single();
        
        if (userData) {
             userId = userData.id;
             console.log(`✅ Usuário encontrado no banco com ID: ${userId}`);
        } else {
             console.error("❌ Erro fatal: Usuário existe no Auth mas não no Banco. Não consigo prosseguir.");
             return;
        }
    } else {
        userId = authData.user.id;
        console.log(`✅ Usuário criado no Auth com ID: ${userId}`);
    }

    if (!userId) {
        console.error("❌ Não foi possível obter o ID do usuário.");
        return;
    }

    // 2. Cria ou Atualiza a tabela 'usuarios' com permissões de SUPER ADMIN
    // Usamos 'upsert' para garantir: se não existir, cria; se existir, atualiza.
    const { error: dbError } = await supabase
        .from('usuarios')
        .upsert({ 
            id: userId,
            email: EMAIL_ADMIN,
            name: USER_NAME,
            role: 'super_admin',       // <--- O PULO DO GATO
            creditos_saldo: 999999,    // <--- CRÉDITOS INFINITOS
            plan: 'Enterprise',
            status: 'active',
            created_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (dbError) {
        console.error('❌ ERRO AO SALVAR NO BANCO:', dbError.message);
    } else {
        console.log(`🎉 SUCESSO! O usuário ${EMAIL_ADMIN} agora é um SUPER ADMIN.`);
    }
};

// Executa a função automaticamente ao rodar o script com node
setupSuperAdmin();