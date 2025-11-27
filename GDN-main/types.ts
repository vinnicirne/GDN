
export interface GeneratedNews {
  id?: string;
  title: string;
  body: string;
  imagePrompt: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
  seo: {
    focusKeyword: string;
    seoTitle: string;
    slug: string;
    metaDescription: string;
    tags: string[];
  };
  created_at?: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  recurrence: 'Mensal' | 'Anual' | 'Pagamento Único';
  active: boolean;
  recommended?: boolean;
}

export interface AppConfig {
  appName: string;
  logoUrl: string;
  supportEmail: string;
  whatsappNumber: string;
  contactMessage: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  plan: string;
  credits: number;
  avatar?: string;
  status?: string;
  created_at?: string;
}
