
import React from 'react';

interface DocumentationProps {
  mode: 'user' | 'admin';
  onBack: () => void;
  }

const Documentation: React.FC<DocumentationProps> = ({ mode, onBack }) => {
  const isUser = mode === 'user';

  return (
    <div className={`min-h-screen bg-black text-gray-400 font-sans animate-fade-in selection:bg-green-900 selection:text-white`}>
      {/* Navbar da Doc */}
      <div className={`sticky top-0 z-40 w-full backdrop-blur-md border-b border-green-900/30 bg-black/90`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-xl text-green-500 font-mono`}>
                {isUser ? 'DOCS.USR' : 'DOCS.SYS'}
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-300 font-semibold text-sm tracking-wide uppercase">
                {isUser ? 'Guia Operacional' : 'Manual do Sistema'}
            </span>
          </div>
          <button 
            onClick={onBack}
            className={`flex items-center gap-2 text-sm transition-colors px-4 py-2 rounded border border-green-900/50 hover:border-green-500 text-green-500 hover:text-green-400 hover:bg-green-900/20`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Voltar
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        <section className="mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tight`}>
            {isUser ? 'Protocolos de Operação' : 'Documentação Classificada (Nível 5)'}
          </h1>
          <p className="text-xl leading-relaxed text-gray-500">
            {isUser 
             ? 'Acesse os manuais de engenharia de prompt e otimização de SEO para maximizar a eficiência da IA.'
             : 'Acesso restrito ao comando central. Detalhes de infraestrutura, custos de API e controle de danos.'}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-12">
          
          {/* Sidebar de Navegação Dinâmica */}
          <aside className="hidden md:block sticky top-24 h-fit space-y-4 border-l border-green-900/30 pl-4">
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 text-green-600`}>Diretório</h3>
            <ul className="space-y-2 text-sm font-mono">
              {isUser ? (
                  <>
                    <li><a href="#visao-geral" className="text-gray-400 hover:text-green-400 transition">01. Visão Geral</a></li>
                    <li><a href="#como-usar" className="text-gray-400 hover:text-green-400 transition">02. Inicialização</a></li>
                    <li><a href="#seo-engine" className="text-gray-400 hover:text-green-400 transition">03. Motor SEO</a></li>
                    <li><a href="#tons-voz" className="text-gray-400 hover:text-green-400 transition">04. Modulação Vocal</a></li>
                    <li><a href="#conta" className="text-gray-400 hover:text-green-400 transition">05. Dados da Conta</a></li>
                  </>
              ) : (
                  <>
                    <li><a href="#admin-visao" className="text-gray-400 hover:text-green-400 transition">SYS.01 Visão Admin</a></li>
                    <li><a href="#custos-metricas" className="text-gray-400 hover:text-green-400 transition">SYS.02 Custos</a></li>
                    <li><a href="#metricas-negocio" className="text-gray-400 hover:text-green-400 transition">SYS.03 Business</a></li>
                    <li><a href="#suporte" className="text-gray-400 hover:text-green-400 transition">SYS.04 Debug</a></li>
                  </>
              )}
            </ul>
          </aside>

          {/* Conteúdo Principal */}
          <div className="space-y-16">
            
            {/* ================= DOCUMENTAÇÃO DE USUÁRIO ================= */}
            {isUser && (
                <>
                    <section id="visao-geral">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">01</span>
                        Visão Geral
                    </h2>
                    <p className="mb-4">
                        O sistema foi projetado para auxiliar redatores, jornalistas e criadores de conteúdo a superar o "bloqueio criativo" 
                        e acelerar a produção de notícias. Diferente de um chat genérico, este app possui uma <strong>engenharia de prompt 
                        rígida</strong> focada em métricas de Rank Math e Yoast SEO.
                    </p>
                    </section>

                    <section id="como-usar">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">02</span>
                        Como Usar
                    </h2>
                    <ol className="space-y-6 relative border-l border-green-900/30 ml-3">
                        <li className="pl-8 relative">
                        <span className="absolute -left-[5px] top-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        <h3 className="text-lg font-bold text-white mb-1">1. Escolha o Tema</h3>
                        <p className="text-gray-500">Selecione uma categoria ampla (ex: Esporte, Economia, Tecnologia) para guiar o contexto da IA.</p>
                        </li>
                        <li className="pl-8 relative">
                        <span className="absolute -left-[5px] top-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        <h3 className="text-lg font-bold text-white mb-1">2. Defina o Tom de Voz</h3>
                        <p className="text-gray-500">O tom muda drasticamente o resultado. "Sarcástico" usará gírias e ironia; "Técnico" usará dados e jargões.</p>
                        </li>
                        <li className="pl-8 relative">
                        <span className="absolute -left-[5px] top-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                        <h3 className="text-lg font-bold text-white mb-1">3. Tópico Específico (Opcional)</h3>
                        <p className="text-gray-500">Se deixar em branco, a IA buscará a notícia mais quente do momento no tema escolhido.</p>
                        </li>
                    </ol>
                    </section>

                    <section id="seo-engine">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">03</span>
                        Motor de SEO (Rank Math)
                    </h2>
                    <p className="mb-4">
                        O sistema força a IA a seguir regras estritas de SEO On-Page. Isso garante que o conteúdo gerado já venha 
                        pronto para rankear no Google.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black p-4 rounded border border-green-900/50">
                        <h4 className="text-green-400 font-bold text-xs uppercase mb-2 tracking-wider">Palavra-chave de Foco</h4>
                        <p className="text-sm text-gray-500">A IA define uma palavra-chave antes de escrever e a insere obrigatoriamente no H1, primeiro parágrafo e URL.</p>
                        </div>
                        <div className="bg-black p-4 rounded border border-green-900/50">
                        <h4 className="text-green-400 font-bold text-xs uppercase mb-2 tracking-wider">Meta Description</h4>
                        <p className="text-sm text-gray-500">Gera um resumo de até 160 caracteres contendo a palavra-chave, otimizado para CTR (Click Through Rate).</p>
                        </div>
                    </div>
                    </section>

                    <section id="tons-voz">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">04</span>
                        Tons de Voz Disponíveis
                    </h2>
                    <div className="overflow-x-auto border border-green-900/30 rounded-lg">
                        <table className="w-full text-left border-collapse bg-black">
                        <thead>
                            <tr className="border-b border-green-900/30 text-green-600 text-xs uppercase font-bold tracking-wider">
                            <th className="py-3 px-4">Tom</th>
                            <th className="py-3 px-4">Descrição</th>
                            <th className="py-3 px-4">Uso Ideal</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-400 divide-y divide-green-900/20">
                            <tr>
                            <td className="py-3 px-4 font-bold text-gray-200">Neutro / Jornalístico</td>
                            <td className="py-3 px-4">Linguagem objetiva, terceira pessoa.</td>
                            <td className="py-3 px-4">Portais de notícias, G1, CNN.</td>
                            </tr>
                            <tr>
                            <td className="py-3 px-4 font-bold text-amber-500">Sensacionalista</td>
                            <td className="py-3 px-4">Adjetivos fortes, urgência.</td>
                            <td className="py-3 px-4">Blogs de fofoca, clickbait.</td>
                            </tr>
                            <tr>
                            <td className="py-3 px-4 font-bold text-blue-400">Técnico</td>
                            <td className="py-3 px-4">Análise de dados, profundidade.</td>
                            <td className="py-3 px-4">Finanças, artigos médicos.</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    </section>

                    <section id="conta">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">05</span>
                            Painel do Usuário
                        </h2>
                        <p className="text-gray-400 mb-4">
                            Você pode acessar seu painel pessoal clicando no ícone de perfil no cabeçalho. Lá você encontrará:
                        </p>
                        <ul className="list-disc pl-5 text-gray-500 space-y-2">
                            <li><strong>Créditos:</strong> Visualize quantos créditos diários restam.</li>
                            <li><strong>Histórico:</strong> Acesse todas as notícias já geradas.</li>
                            <li><strong>Assinatura:</strong> Opções de upgrade para o plano PRO.</li>
                        </ul>
                    </section>
                </>
            )}

            {/* ================= DOCUMENTAÇÃO DE ADMIN/PROPRIETÁRIO ================= */}
            {!isUser && (
                <>
                     <div className="bg-red-900/10 border border-red-900/50 p-4 rounded text-red-400 text-sm mb-8 flex gap-3 items-start font-mono">
                        <span className="text-xl">🔒</span>
                        <div>
                            <strong>CONFIDENCIAL:</strong> Dados sensíveis de infraestrutura. Acesso restrito.
                        </div>
                     </div>

                    <section id="admin-visao">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">SYS.01</span>
                            Visão Geral Administrativa
                        </h2>
                        <p className="mb-4 text-gray-400">
                            O Painel de Administração é a central de comando para monitorar a saúde financeira do SaaS. Aqui, o foco não é apenas 
                            técnico, mas econômico: garantir que o custo por token do Gemini não supere o Lifetime Value (LTV) do usuário.
                        </p>
                    </section>

                    <section id="custos-metricas">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">SYS.02</span>
                            Controle de Custos e Uso do Gemini
                        </h2>
                        <p className="mb-6 text-gray-400 border-l-2 border-green-500 pl-4">
                             Esta seção fornece as métricas essenciais para monitorar a saúde financeira e operacional do sistema, 
                             garantindo que o consumo de créditos (seja do usuário, seja da API) esteja alinhado com a receita.
                        </p>

                        <h3 className="text-lg font-bold text-white mb-4 border-b border-green-900/30 pb-2">Métricas de Consumo da API (Foco no Custo)</h3>
                        <p className="text-sm text-gray-500 mb-4">O principal driver de custo é o número de tokens processados pelo modelo gemini-2.5-flash (ou o modelo que você estiver usando).</p>
                        
                        <div className="overflow-x-auto mb-10 rounded-lg border border-green-900/30">
                             <table className="w-full text-left border-collapse bg-black">
                                <thead className="bg-green-900/10 text-xs uppercase text-green-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4 border-b border-green-900/30">Métrica</th>
                                        <th className="p-4 border-b border-green-900/30">Descrição e Foco</th>
                                        <th className="p-4 border-b border-green-900/30 text-red-400">Indicador Crítico</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-green-900/20">
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Total de Tokens Processados</td>
                                        <td className="p-4 text-gray-400">Número total de tokens enviados (prompt input) e recebidos (completion output) em um período (dia, semana, mês).</td>
                                        <td className="p-4 text-gray-300"><strong className="text-red-400">Custo Bruto da API.</strong> Deve ser monitorado de perto e comparado aos limites de preço do Google Cloud.</td>
                                    </tr>
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Tokens Médios por Geração</td>
                                        <td className="p-4 text-gray-400">Média de tokens consumidos por cada notícia gerada com sucesso.</td>
                                        <td className="p-4 text-gray-300"><strong className="text-amber-400">Eficiência do Prompt.</strong> Se este valor subir, significa que seus prompts estão maiores ou os resultados estão mais longos, aumentando o custo por unidade.</td>
                                    </tr>
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Taxa de Sucesso vs. Erro</td>
                                        <td className="p-4 text-gray-400">Percentual de chamadas que retornaram um JSON válido versus chamadas que falharam (erros HTTP, Safety Settings).</td>
                                        <td className="p-4 text-gray-300"><strong className="text-red-400">Custo Desperdiçado.</strong> Chamadas que falham após o envio do prompt ainda consomem tokens. Uma alta taxa de erro indica custo sem receita.</td>
                                    </tr>
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Tempo Médio de Resposta (Latency)</td>
                                        <td className="p-4 text-gray-400">Tempo em milissegundos que a API do Gemini leva para responder à requisição.</td>
                                        <td className="p-4 text-gray-300"><strong className="text-blue-400">Experiência do Usuário (UX).</strong> Latência alta afeta a satisfação e pode levar a novas tentativas (custo duplicado).</td>
                                    </tr>
                                </tbody>
                             </table>
                        </div>

                        <h3 id="metricas-negocio" className="text-lg font-bold text-white mb-4 border-b border-green-900/30 pb-2">Métricas de Engajamento do Negócio (Foco na Receita)</h3>
                        <p className="text-sm text-gray-500 mb-4">Estas métricas cruzam o custo com a atividade do usuário, validando o modelo de precificação.</p>
                        
                        <div className="overflow-x-auto mb-8 rounded-lg border border-green-900/30">
                             <table className="w-full text-left border-collapse bg-black">
                                <thead className="bg-green-900/10 text-xs uppercase text-green-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4 border-b border-green-900/30">Métrica</th>
                                        <th className="p-4 border-b border-green-900/30">Descrição e Foco</th>
                                        <th className="p-4 border-b border-green-900/30 text-green-400">Indicador Crítico</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-green-900/20">
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Notícias Geradas (Total)</td>
                                        <td className="p-4 text-gray-400">Contador de quantos itens únicos foram gerados em um período.</td>
                                        <td className="p-4 text-gray-300"><strong className="text-green-400">Volume de Produção.</strong> Deve ser o valor usado para debitar o crédito do usuário.</td>
                                    </tr>
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Taxa de Conversão de Crédito</td>
                                        <td className="p-4 text-gray-400">Comparação entre os créditos comprados pelos usuários e os créditos consumidos na geração de notícias.</td>
                                        <td className="p-4 text-gray-300"><strong className="text-green-400">Saúde Financeira.</strong> Garante que o spread (margem de lucro) entre o custo da API e o preço de venda do crédito é sustentável.</td>
                                    </tr>
                                    <tr className="hover:bg-green-900/5 transition">
                                        <td className="p-4 font-bold text-white">Tons/Temas Mais Populares</td>
                                        <td className="p-4 text-gray-400">Classificação dos temas e tons de voz que mais geram conteúdo.</td>
                                        <td className="p-4 text-gray-300"><strong className="text-blue-400">Otimização de Prompt.</strong> Concentre seus melhores esforços de engenharia de prompt nos temas mais populares para garantir a melhor qualidade onde há mais uso.</td>
                                    </tr>
                                </tbody>
                             </table>
                        </div>

                        <div className="bg-black p-6 rounded-lg border border-green-900/30">
                            <h4 className="text-green-400 font-bold uppercase text-xs tracking-widest mb-3">5.2 Monitoramento de Custos e Saúde da API (Resumo Executivo)</h4>
                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                O Superadmin Dashboard fornece visibilidade total sobre o consumo da API do Google Gemini, crucial para a gestão financeira do sistema.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><strong className="text-white">Auditoria de Tokens:</strong> O sistema registra a relação de tokens de entrada e tokens de saída para cada requisição bem-sucedida. Isso permite calcular o custo exato por notícia gerada e ajustar a precificação do crédito, se necessário.</li>
                                <li><strong className="text-white">Controle de Latência:</strong> Um gráfico de latência média mostra a performance da integração com a Google Cloud Platform, alertando o administrador sobre picos de lentidão que possam afetar a experiência do usuário.</li>
                                <li><strong className="text-white">Análise de Desperdício:</strong> Monitore a Taxa de Erro da API. Uma taxa acima de 5% pode indicar problemas na formatação do JSON ou prompts muito complexos, resultando em custo de API sem a entrega de conteúdo ao usuário.</li>
                            </ul>
                        </div>
                    </section>

                    <section id="suporte">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-green-900/20 text-green-500 text-sm font-mono px-2 py-1 rounded border border-green-900/30">SYS.03</span>
                            Suporte & Troubleshooting
                        </h2>
                        <div className="space-y-4">
                             <div className="bg-black p-4 rounded-lg border border-green-900/30">
                                <h4 className="text-white font-bold mb-2">Erro: "Safety Filter Triggered"</h4>
                                <p className="text-sm text-gray-400">
                                    <strong>Causa:</strong> O tema solicitado violou as políticas de conteúdo do Google (ódio, assédio, sexual).<br/>
                                    <strong>Ação:</strong> O sistema bloqueia automaticamente. Não tente contornar para evitar banimento da chave de API.
                                </p>
                            </div>
                             <div className="bg-black p-4 rounded-lg border border-green-900/30">
                                <h4 className="text-white font-bold mb-2">Reset de Emergência</h4>
                                <p className="text-sm text-gray-400">
                                    Para limpar o estado local de um usuário corrompido, instrua-o a abrir o console (F12) e digitar: 
                                    <code>localStorage.clear()</code> e recarregar a página.
                                </p>
                            </div>
                        </div>
                    </section>
                </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Documentation;
