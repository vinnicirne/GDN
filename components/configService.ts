import { supabase } from './supabase';
import type { SystemConfig, MercadoPagoConfig, GeminiConfig } from '../types';

export const configService = {
  // Buscar configurações do sistema
  async getSystemConfig(): Promise<SystemConfig | null> {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('chave', 'system_config')
        .single();

      if (error || !data) {
        // Retorna configuração padrão se não existir
        return this.getDefaultConfig();
      }

      return data.valor as SystemConfig;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return this.getDefaultConfig();
    }
  },

  // Salvar configurações do sistema
  async saveSystemConfig(config: SystemConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({
          chave: 'system_config',
          valor: config,
          categoria: 'system',
          descricao: 'Configurações principais do sistema',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chave'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw new Error('Falha ao salvar configurações');
    }
  },

  // Configuração padrão
  getDefaultConfig(): SystemConfig {
    return {
      mercadoPago: {
        accessToken: '',
        publicKey: '',
        webhookUrl: '',
        enabled: false
      },
      gemini: {
        apiKey: '',
        model: 'gemini-2.0-flash',
        maxTokens: 1000,
        temperature: 0.7,
        enabled: false
      },
      app: {
        appName: 'Gerador de Notícias AI',
        logoUrl: '',
        supportEmail: 'suporte@newsai.com',
        whatsappNumber: '5511999999999',
        contactMessage: 'Olá, preciso de ajuda com a plataforma.'
      }
    };
  },

  // Testar conexão com Mercado Pago
  async testMercadoPago(config: MercadoPagoConfig): Promise<boolean> {
    try {
      // Simulação de teste - na implementação real, faria uma chamada à API do MP
      if (!config.accessToken || !config.publicKey) {
        throw new Error('Credenciais do Mercado Pago não configuradas');
      }
      
      // Aqui você implementaria a chamada real à API do Mercado Pago
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay
      
      return true;
    } catch (error) {
      console.error('Erro ao testar Mercado Pago:', error);
      throw error;
    }
  },

  // Testar conexão com Gemini
  async testGemini(config: GeminiConfig): Promise<boolean> {
    try {
      if (!config.apiKey) {
        throw new Error('API Key do Gemini não configurada');
      }

      // Teste simples com a API Gemini
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${config.apiKey}`);
      
      if (!testResponse.ok) {
        throw new Error('Falha na conexão com Gemini API');
      }

      return true;
    } catch (error) {
      console.error('Erro ao testar Gemini:', error);
      throw error;
    }
  }
};