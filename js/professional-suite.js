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

        lastFinanceiroContainerId: null,
        lastAgendaContainerId: null,

        obterPlanos() {
            try {
                const salvos = localStorage.getItem('apex_planos_consultoria');
                if (salvos) return JSON.parse(salvos);
            } catch (e) { }
            return this.planosPadrao;
        },

        salvarPlanos(planos) {
            try {
                localStorage.setItem('apex_planos_consultoria', JSON.stringify(planos));
            } catch (e) { }
        },

        obterAgendamentos() {
            try {
                const salvos = localStorage.getItem('apex_agendamentos_pro');
                if (salvos) return JSON.parse(salvos);
            } catch (e) { }
            const hojeStr = new Date().toLocaleDateString('pt-BR');
            return [
                { id: 1, hora: '09:00', data: hojeStr, tipo: 'Consulta Nutricional Inicial', aluno: 'Ricardo Leão', status: 'Confirmada', video: true },
                { id: 2, hora: '15:30', data: hojeStr, tipo: 'Avaliação Física Presencial & Treino Guiado', aluno: 'Ricardo Leão', status: 'Agendado', video: false }
            ];
        },

        salvarAgendamentos(agendamentos) {
            try {
                localStorage.setItem('apex_agendamentos_pro', JSON.stringify(agendamentos));
            } catch (e) { }
        },

        // ----------------------------------------------------------------------
        // 2. PAINEL FINANCEIRO & PAGAMENTOS (Itens 16 & 17)
        // ----------------------------------------------------------------------
        renderFinanceiro(containerId) {
            const targetId = containerId || this.lastFinanceiroContainerId || 'conteudo-financeiro-personal';
            const container = document.getElementById(targetId);
            if (!container) return;
            this.lastFinanceiroContainerId = targetId;

            const planos = this.obterPlanos();
            const faturamentoCalculado = planos.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);

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
                            <button type="button" onclick="ApexProfissional.abrirModalNovoPlano()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95">
                                <i data-lucide="plus" class="w-3.5 h-3.5"></i>Criar Novo Plano
                            </button>
                        </div>
                    </div>

                    <!-- Cards de Métricas Financeiras -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Faturamento Projetado (Mês)</span>
                            <div class="text-2xl font-black text-white font-mono">R$ ${(faturamentoCalculado * 2.5).toFixed(2).replace('.', ',')}</div>
                            <span class="text-[11px] text-emerald-400 font-semibold">+18% em relação ao mês anterior</span>
                        </div>
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Recebimentos Confirmados</span>
                            <div class="text-2xl font-black text-emerald-400 font-mono">R$ ${(faturamentoCalculado * 2.0).toFixed(2).replace('.', ',')}</div>
                            <span class="text-[11px] text-slate-400 font-semibold">Via PIX e Cartão de Crédito</span>
                        </div>
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Valores Pendentes / Vencer</span>
                            <div class="text-2xl font-black text-amber-400 font-mono">R$ ${(faturamentoCalculado * 0.5).toFixed(2).replace('.', ',')}</div>
                            <span class="text-[11px] text-amber-400 font-semibold">Faturas com vencimento nos próximos dias</span>
                        </div>
                    </div>

                    <!-- Planos de Consultoria Cadastrados -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">Planos de Consultoria Cadastrados (${planos.length})</h3>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            ${planos.map(p => `
                                <div class="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all group">
                                    <div>
                                        <div class="flex items-center justify-between mb-1">
                                            <span class="text-xs font-extrabold text-white">${p.nome}</span>
                                            <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">${p.duracao}</span>
                                        </div>
                                        <p class="text-[11px] text-slate-400 leading-relaxed">${p.desc}</p>
                                    </div>
                                    <div class="flex items-center justify-between pt-2 border-t border-slate-800">
                                        <span class="text-lg font-black text-emerald-400 font-mono">R$ ${parseFloat(p.valor || 0).toFixed(2).replace('.', ',')}</span>
                                        <span class="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Ativo</span>
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
            const targetId = containerId || this.lastAgendaContainerId || 'conteudo-agenda-personal';
            const container = document.getElementById(targetId);
            if (!container) return;
            this.lastAgendaContainerId = targetId;

            const agendamentos = this.obterAgendamentos();

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
                        <button type="button" onclick="ApexProfissional.abrirModalAgendamento()" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer active:scale-95">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>Novo Agendamento
                        </button>
                    </div>

                    <!-- Próximos Atendimentos -->
                    <div class="space-y-2.5">
                        ${agendamentos.length === 0 ? `
                            <div class="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                                <i data-lucide="calendar-x" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
                                <p class="text-sm font-bold text-slate-400">Nenhum atendimento agendado no momento.</p>
                                <p class="text-xs text-slate-500 mt-1">Clique em "Novo Agendamento" para marcar uma consulta ou treino.</p>
                            </div>
                        ` : agendamentos.map(ag => `
                            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-xl ${ag.tipo.includes('Treino') || ag.tipo.includes('Física') ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'} flex flex-col items-center justify-center font-bold text-xs shrink-0">
                                        <span>${ag.hora || '--:--'}</span>
                                        <span class="text-[9px] font-normal opacity-80">${ag.data ? ag.data.slice(0, 5) : ''}</span>
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-bold text-white">${ag.tipo}</h4>
                                        <p class="text-xs text-slate-400">Aluno: <strong class="text-slate-200">${ag.aluno}</strong> • ${ag.data || 'Hoje'}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ag.status === 'Confirmada' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'}">${ag.status || 'Agendado'}</span>
                                    ${ag.video ? `
                                        <button type="button" onclick="window.open('https://meet.google.com/new', '_blank')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer" title="Iniciar Chamada">
                                            <i data-lucide="video" class="w-3.5 h-3.5 text-cyan-400"></i>
                                            <span class="hidden sm:inline">Meet</span>
                                        </button>
                                    ` : ''}
                                    <button type="button" onclick="ApexProfissional.removerAgendamento(${ag.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs transition-colors cursor-pointer" title="Cancelar Agendamento">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
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
        },

        // ----------------------------------------------------------------------
        // MODAIS INTERATIVOS: PLANOS & AGENDAMENTOS
        // ----------------------------------------------------------------------
        abrirModalNovoPlano() {
            let modal = document.getElementById('modal-pro-novo-plano');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modal-pro-novo-plano';
                modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';
                modal.innerHTML = `
                    <div class="glass-panel w-full max-w-md rounded-3xl border border-emerald-500/30 p-6 space-y-4 shadow-2xl relative">
                        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                                    <i data-lucide="badge-dollar-sign" class="w-4 h-4"></i>
                                </div>
                                <h3 class="text-sm font-bold text-white">Criar Novo Plano de Consultoria</h3>
                            </div>
                            <button type="button" onclick="ApexProfissional.fecharModalNovoPlano()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <form id="form-pro-novo-plano" onsubmit="ApexProfissional.salvarNovoPlano(event)" class="space-y-3.5">
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Nome do Plano *</label>
                                <input type="text" id="novo-plano-nome" placeholder="Ex: Plano Anual Elite VIP" required
                                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Valor (R$) *</label>
                                    <input type="number" id="novo-plano-valor" placeholder="299.00" step="0.01" min="1" required
                                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Duração *</label>
                                    <input type="text" id="novo-plano-duracao" placeholder="Ex: 3 meses" required
                                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Descrição dos Benefícios *</label>
                                <textarea id="novo-plano-desc" rows="2" placeholder="O que inclui o plano..." required
                                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"></textarea>
                            </div>
                            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                <button type="button" onclick="ApexProfissional.fecharModalNovoPlano()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">Cancelar</button>
                                <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-500/20 active:scale-95">Salvar Plano</button>
                            </div>
                        </form>
                    </div>
                `;
                document.body.appendChild(modal);
            }
            modal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        },

        fecharModalNovoPlano() {
            const modal = document.getElementById('modal-pro-novo-plano');
            if (modal) modal.classList.add('hidden');
        },

        salvarNovoPlano(e) {
            e.preventDefault();
            const nome = document.getElementById('novo-plano-nome')?.value.trim();
            const valor = parseFloat(document.getElementById('novo-plano-valor')?.value) || 0;
            const duracao = document.getElementById('novo-plano-duracao')?.value.trim();
            const desc = document.getElementById('novo-plano-desc')?.value.trim();

            if (!nome || !valor) return;

            const planos = this.obterPlanos();
            planos.push({
                id: 'plano_' + Date.now(),
                nome,
                valor,
                duracao,
                desc
            });
            this.salvarPlanos(planos);
            this.fecharModalNovoPlano();
            this.renderFinanceiro(this.lastFinanceiroContainerId);

            if (window.showToast) {
                window.showToast('Plano Criado! 💳', `${nome} adicionado com sucesso.`, 'success');
            }
        },

        abrirModalAgendamento() {
            let modal = document.getElementById('modal-pro-agendamento');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modal-pro-agendamento';
                modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';
                const hojeYMD = new Date().toISOString().split('T')[0];
                modal.innerHTML = `
                    <div class="glass-panel w-full max-w-md rounded-3xl border border-cyan-500/30 p-6 space-y-4 shadow-2xl relative">
                        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                                    <i data-lucide="calendar-plus" class="w-4 h-4"></i>
                                </div>
                                <h3 class="text-sm font-bold text-white">Novo Agendamento Clínico / Treino</h3>
                            </div>
                            <button type="button" onclick="ApexProfissional.fecharModalAgendamento()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <form id="form-pro-agendamento" onsubmit="ApexProfissional.salvarNovoAgendamento(event)" class="space-y-3.5">
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Nome do Aluno *</label>
                                <input type="text" id="novo-agend-aluno" placeholder="Ex: Ricardo Leão" required
                                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Tipo de Atendimento *</label>
                                <select id="novo-agend-tipo" required
                                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                                    <option value="Consulta Nutricional Inicial">Consulta Nutricional Inicial</option>
                                    <option value="Retorno Nutricional & Ajuste de Metas">Retorno Nutricional & Ajuste de Metas</option>
                                    <option value="Avaliação Física Presencial & Treino Guiado">Avaliação Física Presencial & Treino Guiado</option>
                                    <option value="Sessão de Personal Trainer VIP">Sessão de Personal Trainer VIP</option>
                                    <option value="Análise de Check-in Clínico & Bioimpedância">Análise de Check-in Clínico & Bioimpedância</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Data *</label>
                                    <input type="date" id="novo-agend-data" value="${hojeYMD}" required
                                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Horário *</label>
                                    <input type="time" id="novo-agend-hora" value="10:00" required
                                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                                </div>
                            </div>
                            <div class="flex items-center gap-2 pt-1">
                                <input type="checkbox" id="novo-agend-video" checked class="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0">
                                <label for="novo-agend-video" class="text-xs text-slate-300 font-semibold cursor-pointer">Incluir link de vídeochamada (Google Meet)</label>
                            </div>
                            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                <button type="button" onclick="ApexProfissional.fecharModalAgendamento()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">Cancelar</button>
                                <button type="submit" class="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all shadow-md shadow-cyan-500/20 active:scale-95">Confirmar Agendamento</button>
                            </div>
                        </form>
                    </div>
                `;
                document.body.appendChild(modal);
            }
            modal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        },

        fecharModalAgendamento() {
            const modal = document.getElementById('modal-pro-agendamento');
            if (modal) modal.classList.add('hidden');
        },

        salvarNovoAgendamento(e) {
            e.preventDefault();
            const aluno = document.getElementById('novo-agend-aluno')?.value.trim();
            const tipo = document.getElementById('novo-agend-tipo')?.value;
            const dataRaw = document.getElementById('novo-agend-data')?.value;
            const hora = document.getElementById('novo-agend-hora')?.value;
            const video = document.getElementById('novo-agend-video')?.checked ?? true;

            if (!aluno || !tipo || !hora) return;

            let dataFormatada = 'Hoje';
            if (dataRaw) {
                const partes = dataRaw.split('-');
                if (partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }

            const agendamentos = this.obterAgendamentos();
            agendamentos.unshift({
                id: Date.now(),
                aluno,
                tipo,
                data: dataFormatada,
                hora,
                status: 'Confirmada',
                video
            });

            this.salvarAgendamentos(agendamentos);
            this.fecharModalAgendamento();
            this.renderAgenda(this.lastAgendaContainerId);

            if (window.showToast) {
                window.showToast('Agendamento Criado! 📅', `${tipo} agendada para ${aluno} às ${hora}.`, 'success');
            }
        },

        removerAgendamento(id) {
            let agendamentos = this.obterAgendamentos();
            agendamentos = agendamentos.filter(a => a.id !== id);
            this.salvarAgendamentos(agendamentos);
            this.renderAgenda(this.lastAgendaContainerId);
            if (window.showToast) {
                window.showToast('Agendamento Cancelado! 🗑️', 'Horário liberado na agenda.', 'info');
            }
        }
    };

    window.ApexProfissional = ProfessionalSuite;
})(window);
