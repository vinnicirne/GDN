// Arquivo: backend/setupAdmin.js (Temporário)



import supabase from './supabaseClient.js'; // Cliente Supabase com SERVICE_KEY



// Função que cria o usuário de forma segura

const setupSuperAdmin = async () => {

    // ⚠️ SUBSTITUA O EMAIL E A SENHA QUE VOCÊ VAI USAR PARA ACESSAR ⚠️

    const EMAIL_ADMIN = 'seu_email@dominio.com'; 

    const PASSWORD_ADMIN = 'SuaSenhaSuperSecretaAqui123'; 



    console.log(`Tentando configurar o Superadmin: ${EMAIL_ADMIN}`);



    // 1. Cria o usuário com o hash correto no sistema de autenticação do Supabase

    const { data: authData, error: authError } = await supabase.auth.signUp({

        email: agenciaiconedigital@gmail.com,

        password: @@Vinni1105@@,

    });



    if (authError) {

        console.error('ERRO AO CRIAR USUÁRIO:', authError);

        return { success: false, message: authError.message };

    }



    const newUserId = authData.user.id;



    // 2. Atualiza a role e o saldo na sua tabela 'usuarios'

    const { error: dbError } = await supabase

        .from('usuarios')

        .update({ role: 'super_admin', creditos_saldo: 999999 })

        .eq('id', newUserId);



    if (dbError) {

        console.error('ERRO AO ATUALIZAR ROLE:', dbError);

        return { success: false, message: dbError.message };

    }



    return { success: true, message: `Sucesso! O Superadmin ${EMAIL_ADMIN} está configurado.` };

};



// Esta função será executada ao acessar o endpoint /api/setup-admin

export default async (req, res) => {

    const result = await setupSuperAdmin();

    res.status(200).json(result);

};

