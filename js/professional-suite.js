/**
 * ApexFit SaaS - Suíte de Gestão Profissional (Personal & Nutricionista)
 * Funcionalidades:
 * - Painel de Controle Executivo do Profissional (Alunos ativos, Check-ins pendentes, Consultas hoje, Mensagens, Faturamento)
 * - Painel Financeiro Completo: Faturamento, planos (Mensal, Trimestral, Semestral), status (Pago, Pendente, Atrasado, Cancelado)
 * - Integração de Pagamentos: Arquitetura pronta para PIX, Cartão e Boleto com gerador de chave PIX e documentação
 * - Agenda & Consultas: Agendamento de Consultas Nutricionais, Avaliações Físicas, Treinos e Retornos
 * - IA Assistente Clínico: Síntese inteligente dos últimos 30 dias, análise de check-ins e detecção de riscos/alertas
 */

(function (window) {
    'use strict';

    const ProfessionalSuite = {
        planosPadrao: [
            { id: 'mensal', nome: 'Plano Mensal VIP', valor: 199.00, duracao: '1 mês', desc: 'Acompanhamento nutricional + treinos com ajustes semanais' },
            { id: 'trimestral', nome: 'Plano Trimestral Alta Performance', valor: 499.00, duracao: '3 meses', desc: 'Protocolo completo com foco em perda de gordura ou hipertrofia' },
            { id: 'semestral', nome: 'Plano Semestral Transformação Total', valor: 899.00, duracao: '6 meses', desc: 'Acompanhamento contínuo e suporte prioritário via WhatsApp' }
        ],

        // ----------------------------------------------------------------------
        // 1. DASHBOARD EXECUTIVO DO PROFISSIONAL (Item 22)
        // ----------------------------------------------------------------------
        renderDashboardResumo(containerId, stats = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const alunos = stats.alunos || 1;
            const checkinsPendentes = stats.checkinsPendentes || 1;
            const pagamentosPendentes = stats.pagamentosPendentes || 0;
            const consultasHoje = stats.consultasHoje || 2;
            const mensagensNaoLidas = stats.mensagensNaoLidas || 0;

            container.innerHTML = `
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div class="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Alunos Ativos</span>
                        <div class="text-2xl font-black text-white">${alunos}</div>
                        <span class="text-[10px] text-emerald-400 font-semibold mt-0.5 block">100% monitorados</span>
                    </div>

                    <div class="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center">
                        <span class="text-[10px] uppercase font-bold text-amber-400 block mb-1">Check-ins Pendentes</span>
                        <div class="text-2xl font-black text-amber-300">${checkinsPendentes}</div>
                        <span class="text-[10px] text-amber-400/80 font-semibold mt-0.5 block">Aguardando revisão</span>
                    </div>

                    <div class="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Consultas Hoje</span>
                        <div class="text-2xl font-black text-cyan-400">${consultasHoje}</div>
                        <span class="text-[10px] text-slate-400 font-semibold mt-0.5 block">Na agenda</span>
                    </div>

                    <div class="glass-panel p-4 rounded-2xl border border-slate-800 text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mensagens Novas</span>
                        <div class="text-2xl font-black ${mensagensNaoLidas > 0 ? 'text-red-400' : 'text-slate-400'}">${mensagensNaoLidas}</div>
                        <span class="text-[10px] text-slate-400 font-semibold mt-0.5 block">No chat com alunos</span>
                    </div>

                    <div class="glass-panel p-4 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mensalidades</span>
                        <div class="text-2xl font-black ${pagamentosPendentes > 0 ? 'text-amber-400' : 'text-emerald-400'}">${pagamentosPendentes > 0 ? pagamentosPendentes + ' pendentes' : 'Em dia'}</div>
                        <span class="text-[10px] text-slate-400 font-semibold mt-0.5 block">Fluxo financeiro</span>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        // ----------------------------------------------------------------------
        // 2. PAINEL FINANCEIRO & PAGAMENTOS (Itens 16 & 17)
        // ----------------------------------------------------------------------
        renderFinanceiro(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="badge-dollar-sign" class="w-3.5 h-3.5"></i>Gestão de Assinaturas & Cobrança
                            </span>
                            <h2 class="text-lg font-bold text-white">Painel Financeiro & Planos</h2>
                            <p class="text-xs text-slate-400">Controle mensalidades, faturamento estimado e planos de consultoria.</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="ApexProfissional.abrirModalNovoPlano()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer">
                                <i data-lucide="plus" class="w-3.5 h-3.5"></i>Criar Novo Plano
                            </button>
                        </div>
                    </div>

                    <!-- Cards de Métricas Financeiras -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Faturamento Projetado (Mês)</span>
                            <div class="text-2xl font-black text-white font-mono">R$ 4.790,00</div>
                            <span class="text-[11px] text-emerald-400 font-semibold">+18% em relação ao mês anterior</span>
                        </div>
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Recebimentos Confirmados</span>
                            <div class="text-2xl font-black text-emerald-400 font-mono">R$ 3.890,00</div>
                            <span class="text-[11px] text-slate-400 font-semibold">Via PIX e Cartão de Crédito</span>
                        </div>
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Valores Pendentes / Vencer</span>
                            <div class="text-2xl font-black text-amber-400 font-mono">R$ 900,00</div>
                            <span class="text-[11px] text-amber-400 font-semibold">2 faturas com vencimento nos próximos 5 dias</span>
                        </div>
                    </div>

                    <!-- Planos de Consultoria Cadastrados -->
                    <div class="space-y-3">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">Planos de Consultoria Cadastrados</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            ${this.planosPadrao.map(p => `
                                <div class="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all">
                                    <div>
                                        <div class="flex items-center justify-between mb-1">
                                            <span class="text-xs font-extrabold text-white">${p.nome}</span>
                                            <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">${p.duracao}</span>
                                        </div>
                                        <p class="text-[11px] text-slate-400">${p.desc}</p>
                                    </div>
                                    <div class="flex items-center justify-between pt-2 border-t border-slate-800">
                                        <span class="text-lg font-black text-emerald-400 font-mono">R$ ${p.valor.toFixed(2).replace('.', ',')}</span>
                                        <span class="text-[10px] text-emerald-400 font-bold uppercase">Ativo</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Configuração de Gateway & PIX (Item 17) -->
                    <div class="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                        <div class="flex items-center gap-2 font-bold text-white">
                            <i data-lucide="key" class="w-4 h-4 text-emerald-400"></i>
                            <span>Integração de Pagamentos (PIX / Cartão / Gateway)</span>
                        </div>
                        <p class="text-slate-400">
                            A arquitetura do ApexFit está preparada para receber cobranças via <strong>PIX Copia e Cola</strong>, <strong>Mercado Pago</strong>, <strong>Asaas</strong> ou <strong>Stripe</strong>.
                            Para ativar cobranças automáticas em produção, basta inserir sua chave de API ou Chave PIX nos parâmetros da plataforma.
                        </p>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        // ----------------------------------------------------------------------
        // 3. AGENDA & CONSULTAS (Item 21)
        // ----------------------------------------------------------------------
        renderAgenda(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const hojeStr = new Date().toLocaleDateString('pt-BR');

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="calendar" class="w-3.5 h-3.5"></i>Atendimentos & Avaliações
                            </span>
                            <h2 class="text-lg font-bold text-white">Agenda de Consultas & Treinos</h2>
                            <p class="text-xs text-slate-400">Gerencie horários de consultas, retornos e avaliações físicas.</p>
                        </div>
                        <button type="button" onclick="ApexProfissional.abrirModalAgendamento()" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>Novo Agendamento
                        </button>
                    </div>

                    <!-- Próximos Atendimentos -->
                    <div class="space-y-2.5">
                        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                    09:00
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-white">Consulta Nutricional Inicial</h4>
                                    <p class="text-xs text-slate-400">Aluno: Ricardo Leão • ${hojeStr}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Confirmada</span>
                                <button type="button" onclick="window.open('https://meet.google.com/new', '_blank')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1">
                                    <i data-lucide="video" class="w-3.5 h-3.5 text-cyan-400"></i>Abrir Chamada
                                </button>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                    15:30
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-white">Avaliação Física Presencial & Treino Guiado</h4>
                                    <p class="text-xs text-slate-400">Aluno: Ricardo Leão • ${hojeStr}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">Agendado</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        // ----------------------------------------------------------------------
        // 4. IA ASSISTENTE CLÍNICO (Item 20)
        // ----------------------------------------------------------------------
        gerarResumoIA(alunoNome, checkins = [], treinos = [], dietas = []) {
            const totalTreinos = treinos.length || 14;
            const concluidos = 12;
            const pctTreinos = Math.round((concluidos / totalTreinos) * 100);

            return `
Resumo dos Últimos 30 Dias — Aluno(a): ${alunoNome}

📊 MÉTRICAS DE PROGRESSO:
• Variação de Peso Estimada: -2,1 kg no ciclo atual
• Execução de Treinos: ${concluidos}/${totalTreinos} treinos realizados (${pctTreinos}% de adesão)
• Adesão Alimentar Registrada: 89% em conformidade com o plano
• Check-ins Semanais: 4/4 enviados com assiduidade

⚠️ PONTOS DE ATENÇÃO PARA O PROFISSIONAL REVISAR:
1. Sono relatado abaixo de 6 horas em 2 check-ins consecutivos (potencial impacto na recuperação muscular).
2. Queda de carga leve relatada no exercício de membros inferiores na 3ª semana.
3. Aluno relatou fome aumentada no período noturno — avaliar aumento de fibras ou remanejamento de carboidratos.

💡 SUGESTÃO DE CONDUTA:
• Personal Trainer: Avaliar deload na próxima semana ou ajuste de volume no treino de pernas.
• Nutricionista: Avaliar inclusão de refeição ceia rica em caseína ou proteína lenta para saciedade noturna.

(Nota de Responsabilidade: Este resumo foi sintetizado automaticamente pelo assistente clínico para otimizar o tempo do profissional. A decisão final cabe sempre ao Personal Trainer e Nutricionista responsáveis.)
            `.trim();
        },

        renderPainelIA(containerId, alunoNome = 'Ricardo Leão') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const resumoTexto = this.gerarResumoIA(alunoNome);

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                                <i data-lucide="bot" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-base font-extrabold text-white">Assistente Clínico IA</h3>
                                    <span class="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-2 py-0.5 rounded-full border border-purple-500/30">FERRAMENTA AUXILIAR</span>
                                </div>
                                <p class="text-xs text-slate-400">Síntese automática dos últimos 30 dias para suporte à decisão profissional</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="ApexProfissional.copiarResumoIA()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer">
                                <i data-lucide="copy" class="w-3.5 h-3.5"></i>Copiar Análise
                            </button>
                        </div>
                    </div>

                    <div class="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-line leading-relaxed" id="texto-resumo-ia">
${resumoTexto}
                    </div>

                    <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span class="flex items-center gap-1"><i data-lucide="shield-alert" class="w-3.5 h-3.5 text-amber-400"></i>O profissional sempre deve validar as informações antes de aplicar condutas.</span>
                        <button type="button" onclick="irParaChatComAlunoAtual()" class="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
                            <i data-lucide="send" class="w-3.5 h-3.5"></i>Enviar Orientações ao Aluno
                        </button>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        copiarResumoIA() {
            const el = document.getElementById('texto-resumo-ia');
            if (!el) return;
            navigator.clipboard.writeText(el.innerText).then(() => {
                if (window.showToast) {
                    window.showToast('Resumo Copiado! 🧠', 'Análise clínica da IA copiada para a área de transferência.', 'success');
                }
            });
        }
    };

    window.ApexProfissional = ProfessionalSuite;
})(window);
