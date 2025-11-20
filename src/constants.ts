import { PlanConfig, AppConfig } from './types';

// --- 1. CONFIGURAÇÕES GERAIS DO APP ---
export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Gerador de Notícias AI',
  logoUrl: '', // Coloque a URL do seu logo aqui se tiver (ex: '/logo.png')
  supportEmail: 'suporte@newsai.com',
  whatsappNumber: '5511999999999', // Apenas números
  contactMessage: 'Olá, preciso de ajuda com a plataforma de notícias.'
};

// --- 2. LISTAS DE OPÇÕES (TEMAS E TONS) ---
export const NEWS_THEMES = [
  'Tecnologia & Inovação',
  'Economia & Finanças',
  'Esportes',
  'Política Nacional',
  'Política Internacional',
  'Entretenimento & Fama',
  'Saúde & Bem-estar',
  'Ciência & Espaço',
  'Meio Ambiente & Clima',
  'Crimes & Segurança',
  'Educação',
  'Automobilismo',
  'Marketing Digital',
  'Criptomoedas & Blockchain'
];

export const NEWS_TONES = [
  'Neutro / Jornalístico (Padrão)',
  'Sensacionalista / Clickbait',
  'Técnico / Analítico',
  'Humorístico / Sarcástico',
  'Urgente / Breaking News',
  'Educativo / Didático',
  'Opiniativo / Editorial',
  'Corporativo / Formal',
  'Inspirador / Motivacional'
];

// --- 3. PLANOS E PREÇOS ---
export const INITIAL_PLANS: PlanConfig[] = [
  { 
    id: 'p_free', 
    name: 'Gratuito', 
    price: 0, 
    credits: 3, 
    recurrence: 'Mensal', 
    features: [
      '3 Notícias por dia',
      'Grounding (Fontes Reais)',
      'Tons de Voz Padrão',
      'Acesso ao Histórico Recente',
      'Suporte via FAQ'
    ], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_basic', 
    name: 'Creator', 
    price: 99.00, 
    credits: 50, 
    recurrence: 'Mensal', 
    features: [
      '50 Notícias por mês',
      'Todos os Tons de Voz',
      'Prioridade na Fila',
      'SEO Otimizado (RankMath)',
      'Custo por notícia: R$ 1,98'
    ], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_pro', 
    name: 'Agência Pro', 
    price: 349.00, 
    credits: 200, 
    recurrence: 'Mensal', 
    features: [
      '200 Notícias por mês',
      'Dashboard Administrativo',
      'Suporte via WhatsApp',
      'API Access (Beta)',
      'Custo por notícia: R$ 1,74'
    ], 
    active: true,
    recommended: true
  },
  { 
    id: 'p_enterprise', 
    name: 'Enterprise', 
    price: -1, // -1 indica "Sob Consulta" na lógica do modal
    credits: 9999, 
    recurrence: 'Anual', 
    features: [
      'Volume Ilimitado',
      'Servidor Dedicado',
      'Modelo de IA Personalizado',
      'Treinamento de Equipe',
      'SLA Garantido'
    ], 
    active: true,
    recommended: false
  }
];