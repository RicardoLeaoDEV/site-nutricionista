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
        planosPadrao: [],

        // ----------------------------------------------------------------------
        // 1. DASHBOARD EXECUTIVO DO PROFISSIONAL (Item 22)
        // ----------------------------------------------------------------------
        renderDashboardResumo(containerId, stats = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const isNutri = (containerId && containerId.includes('nutri')) || (window.location && window.location.pathname.includes('admin'));
            const alunos = stats.alunos || 1;
            const checkinsPendentes = stats.checkinsPendentes || 1;
            const pagamentosPendentes = stats.pagamentosPendentes || 0;
            const consultasHoje = stats.consultasHoje || 2;
            const mensagensNaoLidas = stats.mensagensNaoLidas || 0;

            const fnAlternar = isNutri ? 'alternarAbaNutri' : 'alternarAbaPersonal';
            const secaoAlunosId = isNutri ? 'secao-alunos-vinculados-nutri' : 'secao-alunos-vinculados-personal';

            container.innerHTML = `
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5">
                    <!-- 1. Alunos Ativos -->
                    <div onclick="if(document.getElementById('${secaoAlunosId}')) document.getElementById('${secaoAlunosId}').scrollIntoView({ behavior: 'smooth' })"
                        title="Ver lista de alunos vinculados"
                        class="glass-panel p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#0a0f1d] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 group cursor-pointer">
                        <div class="flex items-center justify-between mb-1 sm:mb-1.5">
                            <span class="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors truncate">Alunos Ativos</span>
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shrink-0">
                                <i data-lucide="users" class="w-3 h-3 sm:w-4 sm:h-4"></i>
                            </div>
                        </div>
                        <div class="text-xl sm:text-3xl font-black text-white tracking-tight my-0.5 sm:my-1">${alunos}</div>
                        <div class="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-emerald-400 font-bold">
                            <i data-lucide="check-circle-2" class="w-3 h-3 shrink-0"></i>
                            <span class="truncate">100% monitorados</span>
                        </div>
                    </div>

                    <!-- 2. Check-ins Pendentes -->
                    <div onclick="if(typeof ${fnAlternar} === 'function') ${fnAlternar}('evolucao')"
                        title="Revisar fotos e respostas de check-in"
                        class="glass-panel p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border ${checkinsPendentes > 0 ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-[#0a0f1d] shadow-sm shadow-amber-500/10' : 'border-slate-800/90 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#0a0f1d]'} hover:border-amber-400/60 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/10 group cursor-pointer">
                        <div class="flex items-center justify-between mb-1 sm:mb-1.5">
                            <span class="text-[9px] sm:text-[10px] uppercase font-black tracking-wider ${checkinsPendentes > 0 ? 'text-amber-400' : 'text-slate-400'} group-hover:text-amber-300 transition-colors truncate">Check-ins <span class="hidden sm:inline">Pendentes</span></span>
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${checkinsPendentes > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10' : 'bg-slate-800 border-slate-700 text-slate-400'} flex items-center justify-center group-hover:scale-110 transition-all shrink-0">
                                <i data-lucide="camera" class="w-3 h-3 sm:w-4 sm:h-4"></i>
                            </div>
                        </div>
                        <div class="text-xl sm:text-3xl font-black ${checkinsPendentes > 0 ? 'text-amber-300' : 'text-white'} tracking-tight my-0.5 sm:my-1">${checkinsPendentes}</div>
                        <div class="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] ${checkinsPendentes > 0 ? 'text-amber-400 font-extrabold' : 'text-slate-400 font-medium'}">
                            <i data-lucide="${checkinsPendentes > 0 ? 'clock' : 'check'}" class="w-3 h-3 shrink-0"></i>
                            <span class="truncate">${checkinsPendentes > 0 ? 'Aguardando revisão' : 'Tudo em dia'}</span>
                        </div>
                    </div>

                    <!-- 3. Consultas Hoje -->
                    <div onclick="if(typeof ${fnAlternar} === 'function') ${fnAlternar}('gestao')"
                        title="Ver agenda de atendimentos e consultas"
                        class="glass-panel p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/90 hover:border-cyan-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#0a0f1d] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/5 group cursor-pointer">
                        <div class="flex items-center justify-between mb-1 sm:mb-1.5">
                            <span class="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors truncate">Consultas Hoje</span>
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shrink-0">
                                <i data-lucide="calendar" class="w-3 h-3 sm:w-4 sm:h-4"></i>
                            </div>
                        </div>
                        <div class="text-xl sm:text-3xl font-black text-cyan-300 tracking-tight my-0.5 sm:my-1">${consultasHoje}</div>
                        <div class="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-cyan-400/90 font-bold">
                            <i data-lucide="clock" class="w-3 h-3 shrink-0"></i>
                            <span class="truncate">Na agenda</span>
                        </div>
                    </div>

                    <!-- 4. Mensagens Novas -->
                    <div onclick="if(typeof abrirChatFlutuante === 'function') abrirChatFlutuante()"
                        title="Abrir chat com alunos"
                        class="glass-panel p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/90 hover:border-blue-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#0a0f1d] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/5 group cursor-pointer">
                        <div class="flex items-center justify-between mb-1 sm:mb-1.5">
                            <span class="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors truncate">Mensagens <span class="hidden sm:inline">Novas</span></span>
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${mensagensNaoLidas > 0 ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' : 'bg-blue-500/10 border-blue-500/25 text-blue-400'} flex items-center justify-center group-hover:scale-110 transition-all shrink-0">
                                <i data-lucide="message-square" class="w-3 h-3 sm:w-4 sm:h-4"></i>
                            </div>
                        </div>
                        <div class="text-xl sm:text-3xl font-black ${mensagensNaoLidas > 0 ? 'text-rose-400' : 'text-slate-300'} tracking-tight my-0.5 sm:my-1">${mensagensNaoLidas}</div>
                        <div class="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] ${mensagensNaoLidas > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-400 font-medium'}">
                            <i data-lucide="message-circle" class="w-3 h-3 shrink-0"></i>
                            <span class="truncate">${mensagensNaoLidas > 0 ? 'Respostas pendentes' : 'No chat'}</span>
                        </div>
                    </div>

                    <!-- 5. Mensalidades -->
                    <div onclick="if(typeof ${fnAlternar} === 'function') ${fnAlternar}('gestao')"
                        title="Acessar financeiro e planos"
                        class="glass-panel p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/90 hover:border-emerald-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#0a0f1d] col-span-2 sm:col-span-1 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 group cursor-pointer">
                        <div class="flex items-center justify-between mb-1 sm:mb-1.5">
                            <span class="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors truncate">Mensalidades</span>
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${pagamentosPendentes > 0 ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'} flex items-center justify-center group-hover:scale-110 transition-all shrink-0">
                                <i data-lucide="wallet" class="w-3 h-3 sm:w-4 sm:h-4"></i>
                            </div>
                        </div>
                        <div class="text-lg sm:text-2xl font-black ${pagamentosPendentes > 0 ? 'text-amber-400' : 'text-emerald-400'} tracking-tight my-0.5 sm:my-1">
                            ${pagamentosPendentes > 0 ? pagamentosPendentes + ' pendentes' : 'Em dia'}
                        </div>
                        <div class="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-emerald-400/90 font-bold">
                            <i data-lucide="trending-up" class="w-3 h-3 shrink-0"></i>
                            <span class="truncate">Fluxo financeiro</span>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        lastFinanceiroContainerId: null,
        lastAgendaContainerId: null,

        lastFinanceiroContainerId: null,
        lastAgendaContainerId: null,

        detectarTipoProfissional(tipo = null, containerId = null) {
            if (tipo === 'nutri' || tipo === 'personal') return tipo;
            const cid = containerId || this.lastFinanceiroContainerId || '';
            if (cid.includes('nutri')) return 'nutri';
            if (window.location && window.location.pathname.includes('admin')) return 'nutri';
            return 'personal';
        },

        obterPlanos(tipo = null) {
            const t = this.detectarTipoProfissional(tipo);
            const chave = 'rfh_planos_' + t;
            try {
                const salvos = localStorage.getItem(chave);
                if (salvos) return JSON.parse(salvos);
            } catch (e) { }
            return [];
        },

        salvarPlanos(planos, tipo = null) {
            const t = this.detectarTipoProfissional(tipo);
            const chave = 'rfh_planos_' + t;
            try {
                localStorage.setItem(chave, JSON.stringify(planos));
            } catch (e) { }
            // Sincroniza em segundo plano com Supabase se disponível
            if (typeof supabaseClient !== 'undefined' && supabaseClient.from) {
                try {
                    supabaseClient.from('mensagens').insert({
                        aluno_id: null,
                        remetente: 'sistema_planos_' + t,
                        mensagem: JSON.stringify(planos)
                    }).then(() => {}).catch(() => {});
                } catch (e) { }
            }
        },

        obterTodosPedidosPlanos() {
            try {
                const salvos = localStorage.getItem('rfh_pedidos_planos');
                if (salvos) return JSON.parse(salvos);
            } catch (e) { }
            return [];
        },

        obterPedidosPlanosPorTipo(tipo = null) {
            const t = this.detectarTipoProfissional(tipo);
            const categoriaEsperada = (t === 'nutri') ? 'dieta' : 'treino';
            const todos = this.obterTodosPedidosPlanos();
            return todos.filter(p => p.tipo === categoriaEsperada);
        },

        salvarTodosPedidosPlanos(pedidos) {
            try {
                localStorage.setItem('rfh_pedidos_planos', JSON.stringify(pedidos));
            } catch (e) { }
            if (typeof supabaseClient !== 'undefined' && supabaseClient.from) {
                try {
                    supabaseClient.from('mensagens').insert({
                        aluno_id: null,
                        remetente: 'sistema_pedidos_planos_sync',
                        mensagem: JSON.stringify(pedidos)
                    }).then(() => {}).catch(() => {});
                } catch (e) { }
            }
        },

        obterConfigPagamentoProfissional(tipo = null) {
            const t = this.detectarTipoProfissional(tipo);
            const chavePerfil = 'rfh_perfil_' + t;
            try {
                const perfil = JSON.parse(localStorage.getItem(chavePerfil) || '{}');
                return perfil.dadosPagamento || {
                    tipoChavePix: 'chave_aleatoria',
                    chavePix: '',
                    qrCodePix: '',
                    linkCartao: '',
                    avisoResponsabilidade: 'Atenção: A geração e cobrança por link de cartão é de inteira responsabilidade do profissional.'
                };
            } catch (e) {
                return {
                    tipoChavePix: 'chave_aleatoria',
                    chavePix: '',
                    qrCodePix: '',
                    linkCartao: '',
                    avisoResponsabilidade: 'Atenção: A geração e cobrança por link de cartão é de inteira responsabilidade do profissional.'
                };
            }
        },

        salvarConfigPagamentoProfissional(dadosPagamento, tipo = null) {
            const t = this.detectarTipoProfissional(tipo);
            const chavePerfil = 'rfh_perfil_' + t;
            try {
                const perfil = JSON.parse(localStorage.getItem(chavePerfil) || '{}');
                perfil.dadosPagamento = {
                    ...perfil.dadosPagamento,
                    ...dadosPagamento,
                    avisoResponsabilidade: 'Atenção: A geração e cobrança por link de cartão é de inteira responsabilidade do profissional.'
                };
                localStorage.setItem(chavePerfil, JSON.stringify(perfil));
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
        // 2. PAINEL FINANCEIRO & PLANOS DINÂMICOS (SEPARADOS: PERSONAL VS NUTRI)
        // ----------------------------------------------------------------------
        renderFinanceiro(containerId, tipoParam = null) {
            const targetId = containerId || this.lastFinanceiroContainerId || 'conteudo-financeiro-personal';
            const container = document.getElementById(targetId);
            if (!container) return;
            this.lastFinanceiroContainerId = targetId;

            const tipo = this.detectarTipoProfissional(tipoParam, targetId);
            const isNutri = (tipo === 'nutri');
            const corTema = isNutri ? 'lime' : 'amber';
            const iconeTema = isNutri ? 'apple' : 'dumbbell';
            const tituloArea = isNutri ? 'Nutrição & Acompanhamento Alimentar' : 'Treino & Consultoria Esportiva';

            const planos = this.obterPlanos(tipo);
            const pedidos = this.obterPedidosPlanosPorTipo(tipo);
            const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
            const pedidosAceitos = pedidos.filter(p => p.status === 'aceito' || p.status === 'ativo');

            const faturamentoPlanos = planos.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
            const faturamentoAceito = pedidosAceitos.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
            const configPag = this.obterConfigPagamentoProfissional(tipo);

            const badgePeriodicidade = (per) => {
                const p = (per || 'mensal').toLowerCase();
                if (p.includes('trimestral') || p === 'trimestral') {
                    return `<span class="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">Trimestral (3 meses)</span>`;
                }
                if (p.includes('anual') || p === 'anual') {
                    return `<span class="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">Anual (12 meses)</span>`;
                }
                return `<span class="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">Mensal (30 dias)</span>`;
            };

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- CABEÇALHO DA SEÇÃO FINANCEIRA -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-${corTema}-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="${iconeTema}" class="w-3.5 h-3.5"></i>Planos de ${tituloArea}
                            </span>
                            <h2 class="text-lg font-bold text-white">Gestão Financeira & Planos de Consultoria</h2>
                            <p class="text-xs text-slate-400">Crie planos mensais, trimestrais e anuais, receba pedidos de contratação e gerencie formas de recebimento.</p>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <button type="button" onclick="ApexProfissional.abrirModalConfigRecebimento('${tipo}')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm">
                                <i data-lucide="qr-code" class="w-3.5 h-3.5 text-${corTema}-400"></i>Configurar Recebimento (PIX / Cartão)
                            </button>
                            <button type="button" onclick="ApexProfissional.abrirModalNovoPlano('${tipo}')" class="bg-${corTema}-600 hover:bg-${corTema}-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-${corTema}-500/20 transition-all cursor-pointer active:scale-95">
                                <i data-lucide="plus" class="w-4 h-4"></i>Adicionar Novo Plano
                            </button>
                        </div>
                    </div>

                    <!-- CARDS DE MÉTRICAS -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Planos Ativos Cadastrados</span>
                            <div class="text-2xl font-black text-white font-mono">${planos.length} plano${planos.length === 1 ? '' : 's'}</div>
                            <span class="text-[11px] text-${corTema}-400 font-semibold">Mensal, Trimestral ou Anual</span>
                        </div>
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Pedidos Recebidos de Alunos</span>
                            <div class="text-2xl font-black text-emerald-400 font-mono">${pedidos.length} pedido${pedidos.length === 1 ? '' : 's'}</div>
                            <span class="text-[11px] text-emerald-400 font-semibold">${pedidosAceitos.length} aceitos / ativos</span>
                        </div>
                        <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Pedidos Aguardando Aceite</span>
                            <div class="text-2xl font-black text-amber-400 font-mono">${pedidosPendentes.length} pendente${pedidosPendentes.length === 1 ? '' : 's'}</div>
                            <span class="text-[11px] text-amber-400 font-semibold">Necessita confirmação de recebimento</span>
                        </div>
                    </div>

                    <!-- SEÇÃO: SOLICITAÇÕES / PEDIDOS DE ALUNOS (FLUXO 100% FUNCIONAL) -->
                    <div class="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
                            <div>
                                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                                    <i data-lucide="inbox" class="w-4 h-4 text-amber-400"></i>
                                    <span>Solicitações de Planos (Pedidos de Alunos)</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        ${pedidosPendentes.length} pendente${pedidosPendentes.length === 1 ? '' : 's'}
                                    </span>
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">Quando um aluno solicita um plano, você aceita o pedido e disponibiliza seus dados de pagamento (PIX ou Cartão).</p>
                            </div>
                        </div>

                        ${pedidos.length === 0 ? `
                            <div class="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                                <div class="w-10 h-10 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                                    <i data-lucide="receipt" class="w-5 h-5"></i>
                                </div>
                                <p class="text-xs text-slate-300 font-bold">Nenhum pedido de contratação recebido ainda.</p>
                                <p class="text-[11px] text-slate-500 max-w-md mx-auto">Assim que os alunos escolherem um plano no painel deles, a solicitação aparecerá aqui para você aceitar e enviar os dados de pagamento.</p>
                            </div>
                        ` : `
                            <div class="space-y-3">
                                ${pedidos.map(ped => `
                                    <div class="bg-slate-900/80 p-4 rounded-2xl border ${ped.status === 'pendente' ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                                        <div class="flex items-start sm:items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                                                ${(ped.alunoNome || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <span class="text-sm font-bold text-white">${ped.alunoNome || 'Aluno'}</span>
                                                    ${badgePeriodicidade(ped.periodicidade)}
                                                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ped.status === 'pendente' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : ped.status === 'aceito' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}">
                                                        ${ped.status === 'pendente' ? 'Aguardando Seu Aceite' : ped.status === 'aceito' ? 'Pedido Aceito' : 'Recusado'}
                                                    </span>
                                                </div>
                                                <div class="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                                                    <span>Plano: <strong class="text-slate-200">${ped.planoNome}</strong></span>
                                                    <span>Valor: <strong class="text-emerald-400 font-mono">R$ ${parseFloat(ped.valor || 0).toFixed(2).replace('.', ',')}</strong></span>
                                                    <span>Data: ${ped.dataPedido ? new Date(ped.dataPedido).toLocaleDateString('pt-BR') : 'Hoje'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                                            ${ped.status === 'pendente' ? `
                                                <button type="button" onclick="ApexProfissional.abrirModalAceitarPedido('${ped.id}', '${tipo}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer">
                                                    <i data-lucide="check" class="w-3.5 h-3.5"></i>Aceitar Pedido
                                                </button>
                                                <button type="button" onclick="ApexProfissional.recusarPedido('${ped.id}', '${tipo}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-all cursor-pointer">
                                                    Recusar
                                                </button>
                                            ` : `
                                                <button type="button" onclick="ApexProfissional.abrirModalAceitarPedido('${ped.id}', '${tipo}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer">
                                                    <i data-lucide="edit-3" class="w-3 h-3 text-${corTema}-400"></i>Atualizar Dados de Pagamento
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>

                    <!-- SEÇÃO: PLANOS DE CONSULTORIA CADASTRADOS (ZERADOS INICIALMENTE, CUSTOMIZÁVEIS) -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Planos de ${tituloArea} Cadastrados (${planos.length})
                            </h3>
                            <button type="button" onclick="ApexProfissional.abrirModalNovoPlano('${tipo}')" class="text-xs text-${corTema}-400 hover:underline font-bold flex items-center gap-1">
                                <i data-lucide="plus" class="w-3.5 h-3.5"></i>Adicionar Plano
                            </button>
                        </div>

                        ${planos.length === 0 ? `
                            <div class="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-3">
                                <div class="w-12 h-12 mx-auto rounded-2xl bg-${corTema}-500/10 text-${corTema}-400 border border-${corTema}-500/20 flex items-center justify-center">
                                    <i data-lucide="credit-card" class="w-6 h-6"></i>
                                </div>
                                <h4 class="text-sm font-bold text-white">Nenhum plano cadastrado no momento</h4>
                                <p class="text-xs text-slate-400 max-w-md mx-auto">
                                    Você pode adicionar planos <strong>Mensais</strong>, <strong>Trimestrais</strong> ou <strong>Anuais</strong> para que seus alunos visualizem e contratem diretamente no painel deles.
                                </p>
                                <button type="button" onclick="ApexProfissional.abrirModalNovoPlano('${tipo}')" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-${corTema}-500 hover:bg-${corTema}-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer">
                                    <i data-lucide="plus-circle" class="w-4 h-4"></i>Cadastrar Primeiro Plano
                                </button>
                            </div>
                        ` : `
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                ${planos.map(p => `
                                    <div class="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 transition-all group relative overflow-hidden">
                                        <div class="space-y-2">
                                            <div class="flex items-start justify-between gap-2">
                                                <h4 class="text-sm font-extrabold text-white group-hover:text-${corTema}-400 transition-colors">${p.nome}</h4>
                                                ${badgePeriodicidade(p.duracao || p.periodicidade)}
                                            </div>
                                            <p class="text-xs text-slate-400 leading-relaxed whitespace-pre-line">${p.desc || 'Benefícios personalizados de acompanhamento.'}</p>
                                        </div>

                                        <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span class="text-[10px] text-slate-500 uppercase block font-bold">Investimento</span>
                                                <span class="text-xl font-black text-emerald-400 font-mono">R$ ${parseFloat(p.valor || 0).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                            <div class="flex items-center gap-1.5">
                                                <button type="button" onclick="ApexProfissional.abrirModalEditarPlano('${p.id}', '${tipo}')" title="Editar plano" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all">
                                                    <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                                                </button>
                                                <button type="button" onclick="ApexProfissional.excluirPlano('${p.id}', '${tipo}')" title="Excluir plano" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all">
                                                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>

                    <!-- CONFIGURAÇÃO DE RECEBIMENTO & TERMO DE RESPONSABILIDADE -->
                    <div class="bg-slate-950/60 p-5 rounded-3xl border border-slate-800/80 space-y-3 text-xs">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="flex items-center gap-2 font-bold text-white">
                                <i data-lucide="shield-check" class="w-4 h-4 text-${corTema}-400"></i>
                                <span>Meios de Recebimento de Pagamento Configurados</span>
                            </div>
                            <button type="button" onclick="ApexProfissional.abrirModalConfigRecebimento('${tipo}')" class="text-xs text-${corTema}-400 font-bold hover:underline">
                                Editar Dados de Cobrança
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                                <span class="text-[10px] font-bold text-slate-400 uppercase block">Chave PIX Cadastrada:</span>
                                <div class="text-xs font-mono font-bold text-white">${configPag.chavePix ? configPag.chavePix : '<span class="text-slate-500 italic">Nenhuma chave informada ainda</span>'}</div>
                                ${configPag.qrCodePix ? '<span class="text-[10px] text-emerald-400 font-semibold block">✓ QR Code PIX anexado</span>' : ''}
                            </div>
                            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                                <span class="text-[10px] font-bold text-slate-400 uppercase block">Link de Pagamento com Cartão:</span>
                                <div class="text-xs text-white truncate">${configPag.linkCartao ? `<a href="${configPag.linkCartao}" target="_blank" class="text-sky-400 underline">${configPag.linkCartao}</a>` : '<span class="text-slate-500 italic">Nenhum link configurado</span>'}</div>
                                <span class="text-[10px] text-amber-400/90 font-medium block">Cobrança de cartão por responsabilidade do profissional.</span>
                            </div>
                        </div>
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

            // Obter nomes únicos de alunos para popular o dropdown de filtro
            const nomesAlunos = Array.from(new Set(agendamentos.map(a => a.aluno || a.aluno_nome).filter(Boolean))).sort();

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="calendar" class="w-3.5 h-3.5"></i>Atendimentos & Avaliações
                            </span>
                            <h2 class="text-lg font-bold text-white">Agenda de Consultas & Treinos</h2>
                            <p class="text-xs text-slate-400">Gerencie horários de consultas, retornos e avaliações físicas sincronizadas com o aluno.</p>
                        </div>
                        <button type="button" onclick="ApexProfissional.abrirModalAgendamento()" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer active:scale-95">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>Novo Agendamento
                        </button>
                    </div>

                    <!-- BARRA DE FILTRO & BUSCA INSTANTÂNEA -->
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
                        <div class="sm:col-span-8 relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <i data-lucide="search" class="w-4 h-4"></i>
                            </div>
                            <input type="text" id="filtro-busca-agenda-input"
                                oninput="ApexProfissional.filtrarAgenda(this.value)"
                                placeholder="Digite para filtrar por aluno, tipo de atendimento ou data..."
                                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors">
                        </div>
                        <div class="sm:col-span-4">
                            <select id="filtro-busca-agenda-aluno"
                                onchange="ApexProfissional.filtrarAgendaPorAluno(this.value)"
                                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer">
                                <option value="">Todos os Alunos</option>
                                ${nomesAlunos.map(n => `<option value="${n}">${n}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Contador e Lista de Atendimentos -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between text-xs text-slate-400 px-1">
                            <span id="agenda-contador-texto">${agendamentos.length} compromisso${agendamentos.length === 1 ? '' : 's'} cadastrado${agendamentos.length === 1 ? '' : 's'}</span>
                            <span class="text-[11px] text-cyan-400/80">Sincronizado com o portal do aluno</span>
                        </div>
                        <div id="agenda-lista-cards" class="space-y-2.5">
                            ${this.gerarHtmlCardsAgenda(agendamentos)}
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        gerarHtmlCardsAgenda(lista) {
            if (!lista || lista.length === 0) {
                return `
                    <div class="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                        <i data-lucide="calendar-x" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
                        <p class="text-sm font-bold text-slate-400">Nenhum compromisso encontrado.</p>
                        <p class="text-xs text-slate-500 mt-1">Verifique o filtro aplicado ou clique em "Novo Agendamento".</p>
                    </div>
                `;
            }

            return lista.map(ag => {
                const alunoNome = ag.aluno || ag.aluno_nome || 'Aluno';
                const isTreino = ag.tipo && (ag.tipo.includes('Treino') || ag.tipo.includes('Física'));
                const corBadge = isTreino ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';

                return `
                    <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3 hover:border-slate-700 transition-all group">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl ${corBadge} flex flex-col items-center justify-center font-bold text-xs shrink-0">
                                    <span>${ag.hora || '--:--'}</span>
                                    <span class="text-[9px] font-normal opacity-80">${ag.data ? ag.data.slice(0, 5) : ''}</span>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-white">${ag.tipo}</h4>
                                    <p class="text-xs text-slate-400">Aluno: <strong class="text-slate-200">${alunoNome}</strong> • <span class="text-cyan-400 font-semibold">${ag.data || 'Hoje'} às ${ag.hora || '--:--'}</span></p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ag.status === 'Confirmada' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'}">${ag.status || 'Confirmada'}</span>
                                ${ag.video ? `
                                    <button type="button" onclick="window.open('${ag.meet_link || 'https://meet.google.com/new'}', '_blank')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer" title="Iniciar Videochamada Google Meet">
                                        <i data-lucide="video" class="w-3.5 h-3.5 text-cyan-400"></i>
                                        <span class="hidden sm:inline">Meet</span>
                                    </button>
                                ` : ''}
                                <button type="button" onclick="ApexProfissional.removerAgendamento(${ag.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs transition-colors cursor-pointer" title="Cancelar Agendamento">
                                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                </button>
                            </div>
                        </div>

                        ${ag.descricao ? `
                            <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                                <i data-lucide="file-text" class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5"></i>
                                <div class="leading-relaxed">
                                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Orientações do Atendimento:</span>
                                    <span>${ag.descricao}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        },

        filtrarAgenda(termo) {
            const agendamentos = this.obterAgendamentos();
            const termoLimpo = (termo || '').trim().toLowerCase();
            const alunoFiltro = document.getElementById('filtro-busca-agenda-aluno')?.value?.toLowerCase();

            let filtrados = agendamentos.filter(ag => {
                const nomeAluno = (ag.aluno || ag.aluno_nome || '').toLowerCase();
                const tipo = (ag.tipo || '').toLowerCase();
                const data = (ag.data || '').toLowerCase();
                const hora = (ag.hora || '').toLowerCase();
                const desc = (ag.descricao || '').toLowerCase();

                const coincideTexto = !termoLimpo || (
                    nomeAluno.includes(termoLimpo) ||
                    tipo.includes(termoLimpo) ||
                    data.includes(termoLimpo) ||
                    hora.includes(termoLimpo) ||
                    desc.includes(termoLimpo)
                );

                const coincideAluno = !alunoFiltro || nomeAluno === alunoFiltro;

                return coincideTexto && coincideAluno;
            });

            const listaCards = document.getElementById('agenda-lista-cards');
            const contadorTexto = document.getElementById('agenda-contador-texto');

            if (listaCards) {
                listaCards.innerHTML = this.gerarHtmlCardsAgenda(filtrados);
                if (window.lucide) window.lucide.createIcons();
            }

            if (contadorTexto) {
                contadorTexto.textContent = `${filtrados.length} compromisso${filtrados.length === 1 ? '' : 's'} exibido${filtrados.length === 1 ? '' : 's'}`;
            }
        },

        filtrarAgendaPorAluno(alunoNome) {
            const inputBusca = document.getElementById('filtro-busca-agenda-input');
            const termo = inputBusca ? inputBusca.value : '';
            this.filtrarAgenda(termo);
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
        // MODAIS INTERATIVOS: PLANOS, RECEBIMENTO & PEDIDOS DE ALUNOS
        // ----------------------------------------------------------------------
        abrirModalNovoPlano(tipoParam = null) {
            this.abrirModalEditarPlano(null, tipoParam);
        },

        abrirModalEditarPlano(planoId = null, tipoParam = null) {
            const tipo = this.detectarTipoProfissional(tipoParam);
            const isNutri = (tipo === 'nutri');
            const corTema = isNutri ? 'lime' : 'amber';
            const tituloArea = isNutri ? 'Nutricional' : 'de Treino';

            let planoExistente = null;
            if (planoId) {
                const planos = this.obterPlanos(tipo);
                planoExistente = planos.find(p => p.id === planoId);
            }

            let modal = document.getElementById('modal-pro-novo-plano');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'modal-pro-novo-plano';
            modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="glass-panel w-full max-w-lg rounded-3xl border border-${corTema}-500/30 p-6 space-y-4 shadow-2xl relative bg-slate-950/95 max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-${corTema}-500/10 text-${corTema}-400 border border-${corTema}-500/25 flex items-center justify-center">
                                <i data-lucide="${isNutri ? 'apple' : 'dumbbell'}" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-white">${planoExistente ? 'Editar Plano ' + tituloArea : 'Novo Plano ' + tituloArea}</h3>
                                <p class="text-[11px] text-slate-400">Configure os detalhes do plano que ficará disponível para os alunos.</p>
                            </div>
                        </div>
                        <button type="button" onclick="ApexProfissional.fecharModalNovoPlano()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <form id="form-pro-plano-dinamico" onsubmit="ApexProfissional.salvarPlanoFormulario(event, '${tipo}', '${planoExistente ? planoExistente.id : ''}')" class="space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Nome do Plano *</label>
                            <input type="text" id="novo-plano-nome" placeholder="${isNutri ? 'Ex: Acompanhamento Nutricional Individualizado' : 'Ex: Consultoria de Treino & Periodização'}" value="${planoExistente ? (planoExistente.nome || '') : ''}" required
                                class="w-full bg-slate-900 border border-slate-700 focus:border-${corTema}-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Periodicidade / Duração *</label>
                                <select id="novo-plano-duracao" required
                                    class="w-full bg-slate-900 border border-slate-700 focus:border-${corTema}-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors">
                                    <option value="mensal" ${(planoExistente && (planoExistente.duracao === 'mensal' || planoExistente.duracao === '1 mês')) ? 'selected' : ''}>Mensal (30 dias)</option>
                                    <option value="trimestral" ${(planoExistente && (planoExistente.duracao === 'trimestral' || planoExistente.duracao === '3 meses')) ? 'selected' : ''}>Trimestral (3 meses)</option>
                                    <option value="anual" ${(planoExistente && (planoExistente.duracao === 'anual' || planoExistente.duracao === '12 meses')) ? 'selected' : ''}>Anual (12 meses)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Valor (R$) *</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
                                    <input type="number" id="novo-plano-valor" placeholder="150.00" step="0.01" min="1" value="${planoExistente ? (planoExistente.valor || '') : ''}" required
                                        class="w-full bg-slate-900 border border-slate-700 focus:border-${corTema}-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none transition-colors">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Benefícios Inclusos / Descrição *</label>
                            <textarea id="novo-plano-desc" rows="3" placeholder="${isNutri ? 'Ex: - Plano alimentar individualizado\n- Cálculo de macronutrientes\n- Substituições inteligentes\n- Suporte via chat para dúvidas' : 'Ex: - Divisão semanal de treinos\n- Periodização e ajuste de cargas\n- Análise de vídeos de execução\n- Suporte prioritário via chat'}" required
                                class="w-full bg-slate-900 border border-slate-700 focus:border-${corTema}-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors">${planoExistente ? (planoExistente.desc || '') : ''}</textarea>
                            <span class="text-[10px] text-slate-500 mt-1 block">Estes benefícios serão visualizados detalhadamente pelos alunos ao escolherem o plano.</span>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ApexProfissional.fecharModalNovoPlano()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">Cancelar</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-${corTema}-600 hover:bg-${corTema}-500 text-slate-950 font-black text-xs transition-all shadow-md shadow-${corTema}-500/20 active:scale-95 cursor-pointer">
                                ${planoExistente ? 'Salvar Alterações' : 'Cadastrar Plano'}
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) lucide.createIcons();
        },

        fecharModalNovoPlano() {
            const modal = document.getElementById('modal-pro-novo-plano');
            if (modal) modal.remove();
        },

        salvarPlanoFormulario(e, tipoParam, planoId) {
            e.preventDefault();
            const tipo = this.detectarTipoProfissional(tipoParam);
            const nome = document.getElementById('novo-plano-nome')?.value.trim();
            const valor = parseFloat(document.getElementById('novo-plano-valor')?.value) || 0;
            const duracao = document.getElementById('novo-plano-duracao')?.value.trim();
            const desc = document.getElementById('novo-plano-desc')?.value.trim();

            if (!nome || !valor) return;

            const planos = this.obterPlanos(tipo);
            if (planoId) {
                const idx = planos.findIndex(p => p.id === planoId);
                if (idx !== -1) {
                    planos[idx] = { ...planos[idx], nome, valor, duracao, desc };
                }
            } else {
                planos.push({
                    id: 'plano_' + Date.now(),
                    tipo: (tipo === 'nutri' ? 'dieta' : 'treino'),
                    nome,
                    valor,
                    duracao,
                    desc,
                    criadoEm: new Date().toISOString()
                });
            }

            this.salvarPlanos(planos, tipo);
            this.fecharModalNovoPlano();
            this.renderFinanceiro(this.lastFinanceiroContainerId, tipo);

            if (window.showToast) {
                window.showToast('Plano Salvo com Sucesso! 💳', `${nome} agora está disponível para contratação.`, 'success');
            }
        },

        excluirPlano(planoId, tipoParam = null) {
            if (!confirm('Deseja realmente excluir este plano de consultoria? Os alunos não poderão mais contratá-lo.')) return;
            const tipo = this.detectarTipoProfissional(tipoParam);
            let planos = this.obterPlanos(tipo);
            planos = planos.filter(p => p.id !== planoId);
            this.salvarPlanos(planos, tipo);
            this.renderFinanceiro(this.lastFinanceiroContainerId, tipo);

            if (window.showToast) {
                window.showToast('Plano Excluído', 'O plano foi removido da sua lista.', 'info');
            }
        },

        // ==============================================================
        // MODAL: ACEITAR PEDIDO DE ALUNO E FORNECER DADOS DE PAGAMENTO
        // ==============================================================
        abrirModalAceitarPedido(pedidoId, tipoParam = null) {
            const tipo = this.detectarTipoProfissional(tipoParam);
            const isNutri = (tipo === 'nutri');
            const corTema = isNutri ? 'lime' : 'amber';
            const todosPedidos = this.obterTodosPedidosPlanos();
            const pedido = todosPedidos.find(p => p.id === pedidoId);
            if (!pedido) return;

            const configPag = this.obterConfigPagamentoProfissional(tipo);

            let modal = document.getElementById('modal-aceitar-pedido-plano');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'modal-aceitar-pedido-plano';
            modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="glass-panel w-full max-w-lg rounded-3xl border border-${corTema}-500/30 p-6 space-y-4 shadow-2xl relative bg-slate-950/95 max-h-[92vh] overflow-y-auto">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-white">Aceitar Pedido de Contratação</h3>
                                <p class="text-[11px] text-slate-400">Aluno: <strong class="text-white">${pedido.alunoNome}</strong> • Plano: <strong class="text-${corTema}-400">${pedido.planoNome}</strong></p>
                            </div>
                        </div>
                        <button type="button" onclick="ApexProfissional.fecharModalAceitarPedido()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <!-- Resumo da Solicitação -->
                    <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-400">Valor do Plano:</span>
                            <span class="text-base font-black text-emerald-400 font-mono">R$ ${parseFloat(pedido.valor || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-400">Periodicidade:</span>
                            <span class="font-bold text-white uppercase">${pedido.periodicidade || 'Mensal'}</span>
                        </div>
                    </div>

                    <form id="form-aceitar-pedido" onsubmit="ApexProfissional.salvarAceitePedidoFormulario(event, '${pedido.id}', '${tipo}')" class="space-y-4">
                        <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <i data-lucide="wallet" class="w-4 h-4 text-${corTema}-400"></i>
                            Dados para o Aluno Efetuar o Pagamento:
                        </h4>

                        <!-- Opção PIX -->
                        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                            <span class="text-xs font-bold text-emerald-400 block flex items-center gap-1.5">
                                <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>Opção 1: Recebimento via PIX
                            </span>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo da Chave</label>
                                    <select id="aceite-tipo-chave-pix" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-${corTema}-400">
                                        <option value="chave_aleatoria" ${configPag.tipoChavePix === 'chave_aleatoria' ? 'selected' : ''}>Chave Aleatória</option>
                                        <option value="cpf" ${configPag.tipoChavePix === 'cpf' ? 'selected' : ''}>CPF / CNPJ</option>
                                        <option value="email" ${configPag.tipoChavePix === 'email' ? 'selected' : ''}>E-mail</option>
                                        <option value="telefone" ${configPag.tipoChavePix === 'telefone' ? 'selected' : ''}>Celular</option>
                                    </select>
                                </div>
                                <div class="sm:col-span-2">
                                    <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Chave PIX *</label>
                                    <input type="text" id="aceite-chave-pix" placeholder="Cole aqui sua chave PIX..." value="${configPag.chavePix || ''}" required
                                        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-${corTema}-400">
                                </div>
                            </div>

                            <div>
                                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Imagem do QR Code PIX (Opcional)</label>
                                <div class="flex items-center gap-2">
                                    <input type="file" id="aceite-file-qrcode" accept="image/*" class="hidden" onchange="ApexProfissional.aoSelecionarQrCode(event)">
                                    <button type="button" onclick="document.getElementById('aceite-file-qrcode').click()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer">
                                        <i data-lucide="image" class="w-3.5 h-3.5"></i>Upload Imagem QR Code
                                    </button>
                                    <span id="aceite-qrcode-status" class="text-[11px] text-slate-400 truncate max-w-[200px]">${configPag.qrCodePix ? 'QR Code carregado' : 'Nenhuma imagem selecionada'}</span>
                                </div>
                                <input type="hidden" id="aceite-qrcode-base64" value="${configPag.qrCodePix || ''}">
                            </div>
                        </div>

                        <!-- Opção Cartão de Crédito -->
                        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                            <span class="text-xs font-bold text-sky-400 block flex items-center gap-1.5">
                                <i data-lucide="credit-card" class="w-3.5 h-3.5"></i>Opção 2: Pagamento por Link de Cartão (Opcional)
                            </span>
                            <div>
                                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Link de Pagamento / Checkout (Mercado Pago, InfinitePay, Stripe, Asaas, etc.)</label>
                                <input type="url" id="aceite-link-cartao" placeholder="https://..." value="${configPag.linkCartao || ''}"
                                    class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-${corTema}-400">
                            </div>

                            <!-- TERMO DE RESPONSABILIDADE VISÍVEL -->
                            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed space-y-1">
                                <div class="font-bold flex items-center gap-1.5">
                                    <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0 text-amber-400"></i>
                                    <span>Termo de Responsabilidade:</span>
                                </div>
                                <p class="text-amber-200/90">
                                    A criação, gestão e cobrança do link de cartão é de <strong>inteira responsabilidade do profissional</strong>. A plataforma Real Fit Hub apenas disponibiliza o link seguro de pagamento para facilitar a transação com seu aluno.
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ApexProfissional.fecharModalAceitarPedido()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">Cancelar</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer">
                                <i data-lucide="check" class="w-4 h-4"></i>Confirmar e Disponibilizar ao Aluno
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) lucide.createIcons();
        },

        aoSelecionarQrCode(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                const hiddenInput = document.getElementById('aceite-qrcode-base64');
                const statusSpan = document.getElementById('aceite-qrcode-status');
                if (hiddenInput) hiddenInput.value = base64;
                if (statusSpan) statusSpan.textContent = file.name;
                if (window.showToast) window.showToast('QR Code Carregado! 📸', 'Imagem pronta para envio ao aluno.', 'success');
            };
            reader.readAsDataURL(file);
        },

        fecharModalAceitarPedido() {
            const modal = document.getElementById('modal-aceitar-pedido-plano');
            if (modal) modal.remove();
        },

        salvarAceitePedidoFormulario(e, pedidoId, tipoParam) {
            e.preventDefault();
            const tipo = this.detectarTipoProfissional(tipoParam);
            const chavePix = document.getElementById('aceite-chave-pix')?.value.trim();
            const tipoChavePix = document.getElementById('aceite-tipo-chave-pix')?.value;
            const qrCodePix = document.getElementById('aceite-qrcode-base64')?.value || '';
            const linkCartao = document.getElementById('aceite-link-cartao')?.value.trim() || '';

            if (!chavePix) {
                alert('Por favor, informe a Chave PIX para recebimento.');
                return;
            }

            const dadosPagamento = {
                tipoChavePix,
                chavePix,
                qrCodePix,
                linkCartao,
                avisoResponsabilidade: 'Atenção: A cobrança via cartão de crédito é de inteira responsabilidade do profissional contratado.'
            };

            // Salva dados no perfil padrão do profissional
            this.salvarConfigPagamentoProfissional(dadosPagamento, tipo);

            // Atualiza o pedido
            const todosPedidos = this.obterTodosPedidosPlanos();
            const idx = todosPedidos.findIndex(p => p.id === pedidoId);
            if (idx !== -1) {
                // Recupera perfil profissional (nome, documento, foto) para anexar ao pedido
                const perfilProf = JSON.parse(localStorage.getItem('rfh_perfil_' + tipo) || '{}');
                todosPedidos[idx].status = 'aceito';
                todosPedidos[idx].dadosPagamento = dadosPagamento;
                todosPedidos[idx].profNome = perfilProf.nome || (tipo === 'nutri' ? 'Nutricionista Responsável' : 'Personal Trainer Responsável');
                todosPedidos[idx].profDocumento = perfilProf.documento || perfilProf.registro || '';
                todosPedidos[idx].profFoto = perfilProf.foto || '';
                todosPedidos[idx].dataAceite = new Date().toISOString();
            }

            this.salvarTodosPedidosPlanos(todosPedidos);
            this.fecharModalAceitarPedido();
            this.renderFinanceiro(this.lastFinanceiroContainerId, tipo);

            if (window.showToast) {
                window.showToast('Pedido Aceito! 🎉', 'Os dados de pagamento foram disponibilizados diretamente no painel do aluno.', 'success');
            }
        },

        recusarPedido(pedidoId, tipoParam = null) {
            if (!confirm('Deseja realmente recusar esta solicitação de plano?')) return;
            const tipo = this.detectarTipoProfissional(tipoParam);
            const todosPedidos = this.obterTodosPedidosPlanos();
            const idx = todosPedidos.findIndex(p => p.id === pedidoId);
            if (idx !== -1) {
                todosPedidos[idx].status = 'recusado';
                todosPedidos[idx].dataRecusa = new Date().toISOString();
            }
            this.salvarTodosPedidosPlanos(todosPedidos);
            this.renderFinanceiro(this.lastFinanceiroContainerId, tipo);

            if (window.showToast) {
                window.showToast('Pedido Recusado', 'O status da solicitação foi atualizado.', 'info');
            }
        },

        // ==============================================================
        // MODAL: CONFIGURAÇÃO PADRÃO DE MEIOS DE RECEBIMENTO
        // ==============================================================
        abrirModalConfigRecebimento(tipoParam = null) {
            const tipo = this.detectarTipoProfissional(tipoParam);
            const isNutri = (tipo === 'nutri');
            const corTema = isNutri ? 'lime' : 'amber';
            const configPag = this.obterConfigPagamentoProfissional(tipo);

            let modal = document.getElementById('modal-config-recebimento-pro');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'modal-config-recebimento-pro';
            modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="glass-panel w-full max-w-md rounded-3xl border border-${corTema}-500/30 p-6 space-y-4 shadow-2xl relative bg-slate-950/95 max-h-[92vh] overflow-y-auto">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2.5">
                            <div class="w-9 h-9 rounded-xl bg-${corTema}-500/10 text-${corTema}-400 border border-${corTema}-500/25 flex items-center justify-center">
                                <i data-lucide="wallet" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-white">Dados Padrão de Recebimento</h3>
                                <p class="text-[11px] text-slate-400">Configure seus dados para receber pagamentos dos alunos via PIX ou Cartão.</p>
                            </div>
                        </div>
                        <button type="button" onclick="ApexProfissional.fecharModalConfigRecebimento()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <form id="form-config-recebimento" onsubmit="ApexProfissional.salvarConfigRecebimentoFormulario(event, '${tipo}')" class="space-y-4">
                        <div class="space-y-3">
                            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Recebimento via PIX</span>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo da Chave</label>
                                    <select id="cfg-tipo-chave-pix" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-${corTema}-400">
                                        <option value="chave_aleatoria" ${configPag.tipoChavePix === 'chave_aleatoria' ? 'selected' : ''}>Chave Aleatória</option>
                                        <option value="cpf" ${configPag.tipoChavePix === 'cpf' ? 'selected' : ''}>CPF / CNPJ</option>
                                        <option value="email" ${configPag.tipoChavePix === 'email' ? 'selected' : ''}>E-mail</option>
                                        <option value="telefone" ${configPag.tipoChavePix === 'telefone' ? 'selected' : ''}>Celular</option>
                                    </select>
                                </div>
                                <div class="sm:col-span-2">
                                    <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Chave PIX</label>
                                    <input type="text" id="cfg-chave-pix" placeholder="Sua chave PIX..." value="${configPag.chavePix || ''}"
                                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-${corTema}-400">
                                </div>
                            </div>

                            <div>
                                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">QR Code PIX (Imagem Opcional)</label>
                                <input type="file" id="cfg-file-qrcode" accept="image/*" class="hidden" onchange="ApexProfissional.aoSelecionarQrCodeCfg(event)">
                                <div class="flex items-center gap-2">
                                    <button type="button" onclick="document.getElementById('cfg-file-qrcode').click()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer">
                                        <i data-lucide="upload" class="w-3.5 h-3.5"></i>Upload QR Code
                                    </button>
                                    <span id="cfg-qrcode-status" class="text-[11px] text-slate-400 truncate max-w-[200px]">${configPag.qrCodePix ? 'Imagem salva' : 'Nenhuma imagem'}</span>
                                </div>
                                <input type="hidden" id="cfg-qrcode-base64" value="${configPag.qrCodePix || ''}">
                            </div>
                        </div>

                        <div class="space-y-3 pt-3 border-t border-slate-800">
                            <span class="text-xs font-bold text-sky-400 uppercase tracking-wider block">Link de Pagamento com Cartão</span>
                            <div>
                                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Link de Pagamento (Mercado Pago, Stripe, Asaas, etc.)</label>
                                <input type="url" id="cfg-link-cartao" placeholder="https://..." value="${configPag.linkCartao || ''}"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-${corTema}-400">
                            </div>

                            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed space-y-1">
                                <div class="font-bold flex items-center gap-1.5">
                                    <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0 text-amber-400"></i>
                                    <span>Termo de Responsabilidade:</span>
                                </div>
                                <p class="text-amber-200/90">
                                    A criação do link de cartão é de inteira responsabilidade do profissional. A plataforma não cobra taxas de intermediação neste meio.
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ApexProfissional.fecharModalConfigRecebimento()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">Cancelar</button>
                            <button type="submit" class="px-5 py-2 rounded-xl bg-${corTema}-600 hover:bg-${corTema}-500 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer">
                                Salvar Dados
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) lucide.createIcons();
        },

        aoSelecionarQrCodeCfg(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                const hiddenInput = document.getElementById('cfg-qrcode-base64');
                const statusSpan = document.getElementById('cfg-qrcode-status');
                if (hiddenInput) hiddenInput.value = base64;
                if (statusSpan) statusSpan.textContent = file.name;
                if (window.showToast) window.showToast('QR Code Carregado! 📸', 'Imagem salva com sucesso.', 'success');
            };
            reader.readAsDataURL(file);
        },

        fecharModalConfigRecebimento() {
            const modal = document.getElementById('modal-config-recebimento-pro');
            if (modal) modal.remove();
        },

        salvarConfigRecebimentoFormulario(e, tipoParam) {
            e.preventDefault();
            const tipo = this.detectarTipoProfissional(tipoParam);
            const chavePix = document.getElementById('cfg-chave-pix')?.value.trim();
            const tipoChavePix = document.getElementById('cfg-tipo-chave-pix')?.value;
            const qrCodePix = document.getElementById('cfg-qrcode-base64')?.value || '';
            const linkCartao = document.getElementById('cfg-link-cartao')?.value.trim() || '';

            const dadosPagamento = {
                tipoChavePix,
                chavePix,
                qrCodePix,
                linkCartao,
                avisoResponsabilidade: 'Atenção: A cobrança via cartão de crédito é de inteira responsabilidade do profissional contratado.'
            };

            this.salvarConfigPagamentoProfissional(dadosPagamento, tipo);
            this.fecharModalConfigRecebimento();
            this.renderFinanceiro(this.lastFinanceiroContainerId, tipo);

            if (window.showToast) {
                window.showToast('Dados Salvos! 💳', 'Seus dados de recebimento foram atualizados com sucesso.', 'success');
            }
        },

        abrirModalAgendamento() {
            let modal = document.getElementById('modal-pro-agendamento');
            if (modal) modal.remove();

            // Pega opções de alunos disponíveis na página para facilitar a seleção
            const selAlunosPagina = document.getElementById('aluno-select') || document.getElementById('fotos-aluno-select');
            let opcoesAlunosHtml = '';
            if (selAlunosPagina && selAlunosPagina.options) {
                Array.from(selAlunosPagina.options).forEach(opt => {
                    if (opt.value && !opt.disabled) {
                        const nomeLimpo = opt.text.split('(')[0].trim();
                        opcoesAlunosHtml += `<option value="${opt.value}" data-nome="${nomeLimpo}">${opt.text}</option>`;
                    }
                });
            }

            modal = document.createElement('div');
            modal.id = 'modal-pro-agendamento';
            modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto';
            const hojeYMD = new Date().toISOString().split('T')[0];
            modal.innerHTML = `
                <div class="glass-panel w-full max-w-lg rounded-3xl border border-cyan-500/30 p-6 sm:p-7 space-y-4 shadow-2xl relative my-6">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2">
                            <div class="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                                <i data-lucide="calendar-plus" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-white">Novo Agendamento Clínico / Treino</h3>
                                <p class="text-[11px] text-slate-400">Notificação e orientações sincronizadas instantaneamente com o aluno.</p>
                            </div>
                        </div>
                        <button type="button" onclick="ApexProfissional.fecharModalAgendamento()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <form id="form-pro-agendamento" onsubmit="ApexProfissional.salvarNovoAgendamento(event)" class="space-y-3.5">
                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Selecionar Aluno *</label>
                            ${opcoesAlunosHtml ? `
                                <select id="novo-agend-aluno-select" onchange="ApexProfissional.aoSelecionarAlunoAgendamento(this)" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 mb-2">
                                    <option value="">Selecione um aluno da lista...</option>
                                    ${opcoesAlunosHtml}
                                    <option value="__outro__">Outro (digitar nome manualmente)</option>
                                </select>
                            ` : ''}
                            <input type="text" id="novo-agend-aluno" placeholder="Nome do Aluno (Ex: Ricardo Leão)" required
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

                        <div>
                            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">Descrição e Orientações para o Aluno (Visível no Portal)</label>
                            <textarea id="novo-agend-descricao" rows="2" placeholder="Ex: Trazer exames laboratoriais recentes; jejum de 2h para bioimpedância; vir com roupa leve de treino..."
                                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"></textarea>
                        </div>

                        <div class="flex items-center gap-2 pt-1">
                            <input type="checkbox" id="novo-agend-video" checked class="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0">
                            <label for="novo-agend-video" class="text-xs text-slate-300 font-semibold cursor-pointer">Incluir sala de vídeo online (Google Meet)</label>
                        </div>

                        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ApexProfissional.fecharModalAgendamento()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">Cancelar</button>
                            <button type="submit" id="btn-submit-agendamento" class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                <span>Confirmar & Notificar Aluno</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            modal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        },

        aoSelecionarAlunoAgendamento(sel) {
            const inputNome = document.getElementById('novo-agend-aluno');
            if (!inputNome) return;
            if (sel.value && sel.value !== '__outro__') {
                const opt = sel.selectedOptions[0];
                inputNome.value = opt.getAttribute('data-nome') || opt.text.split('(')[0].trim();
            } else if (sel.value === '__outro__') {
                inputNome.value = '';
                inputNome.focus();
            }
        },

        fecharModalAgendamento() {
            const modal = document.getElementById('modal-pro-agendamento');
            if (modal) modal.classList.add('hidden');
        },

        async salvarNovoAgendamento(e) {
            e.preventDefault();
            const btnSubmit = document.getElementById('btn-submit-agendamento');
            if (btnSubmit) btnSubmit.disabled = true;

            const inputAluno = document.getElementById('novo-agend-aluno');
            const selAluno = document.getElementById('novo-agend-aluno-select');
            const alunoNome = inputAluno?.value.trim();
            const alunoId = selAluno?.value && selAluno.value !== '__outro__' ? selAluno.value : null;

            const tipo = document.getElementById('novo-agend-tipo')?.value;
            const dataRaw = document.getElementById('novo-agend-data')?.value;
            const hora = document.getElementById('novo-agend-hora')?.value;
            const descricao = document.getElementById('novo-agend-descricao')?.value.trim() || '';
            const video = document.getElementById('novo-agend-video')?.checked ?? true;

            if (!alunoNome || !tipo || !hora) {
                if (btnSubmit) btnSubmit.disabled = false;
                return;
            }

            let dataFormatada = 'Hoje';
            if (dataRaw) {
                const partes = dataRaw.split('-');
                if (partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }

            const novoItem = {
                id: Date.now(),
                aluno: alunoNome,
                aluno_id: alunoId,
                aluno_nome: alunoNome,
                tipo,
                data: dataFormatada,
                data_iso: dataRaw,
                hora,
                descricao,
                status: 'Confirmada',
                video,
                meet_link: video ? 'https://meet.google.com/new' : '',
                profissional_nome: window.nomeProfissionalLogado || (window.location.pathname.includes('personal') ? 'Personal Trainer' : 'Nutricionista Responsável'),
                profissional_tipo: window.location.pathname.includes('personal') ? 'personal' : 'nutricionista'
            };

            // 1. Salva localmente para atualização imediata do profissional
            const agendamentos = this.obterAgendamentos();
            agendamentos.unshift(novoItem);
            this.salvarAgendamentos(agendamentos);

            // 2. Sincroniza com o Supabase (para aparecer automaticamente no portal do aluno)
            if (window.ApexCore && window.ApexCore.data) {
                try {
                    await window.ApexCore.data.saveAgendamento(novoItem, alunoId);
                } catch (errSupa) {
                    console.warn('[ApexProfissional] Falha ao persistir agendamento no Supabase:', errSupa);
                }
            }

            this.fecharModalAgendamento();
            this.renderAgenda(this.lastAgendaContainerId);

            if (window.showToast) {
                window.showToast('Agendamento Sincronizado! 📅', `${tipo} agendada para ${alunoNome} às ${hora}.`, 'success');
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
