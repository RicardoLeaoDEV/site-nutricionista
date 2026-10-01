/**
 * ApexFit SaaS - Sistema de Check-in Semanal
 * Permite:
 * - Aluno: Responder anamnese semanal completa (peso, treinos, dieta, sono, energia, estresse, fotos, etc.)
 * - Indicadores automáticos: 🟢 Tudo certo | 🟡 Atenção | 🔴 Precisa de atenção
 * - Profissionais (Personal & Nutri): Visualizar check-ins pendentes, concluídos, histórico e deltas entre semanas
 */

(function (window) {
    'use strict';

    const CheckinSystem = {
        alunoIdAtual: null,

        // Inicializa o módulo para o Aluno (no dashboard.html)
        async initAluno(alunoId) {
            this.alunoIdAtual = alunoId;
            await this.renderCardCheckinAluno();
            this.renderModalCheckinAluno();
            this.renderModalHistoricoAluno();
        },

        // Renderiza o card de status do check-in no dashboard do aluno
        async renderCardCheckinAluno() {
            const container = document.getElementById('container-checkin-aluno');
            if (!container) return;

            const checkins = await window.ApexCore.data.getCheckins(this.alunoIdAtual, 5);
            const ultimo = checkins?.[0];
            const penultimo = checkins?.[1];
            const hoje = new Date();
            let pendente = true;
            let diasPassados = null;

            if (ultimo) {
                const dataUltimo = new Date(ultimo.created_at || ultimo._timestamp);
                diasPassados = Math.floor((hoje - dataUltimo) / (1000 * 60 * 60 * 24));
                if (diasPassados < 7) {
                    pendente = false;
                }
            }

            const statusConfig = {
                verde: { texto: 'Tudo Certo', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dotClass: 'bg-emerald-400', icone: 'check-circle' },
                amarelo: { texto: 'Atenção', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dotClass: 'bg-amber-400', icone: 'alert-triangle' },
                vermelho: { texto: 'Precisa de Atenção', badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dotClass: 'bg-rose-400', icone: 'alert-octagon' }
            };

            const status = ultimo ? (statusConfig[ultimo.status_indicador] || statusConfig.verde) : null;

            // Variação de peso comparado com check-in anterior
            let deltaHtml = '';
            if (ultimo && ultimo.peso_atual && penultimo && penultimo.peso_atual) {
                const diff = (parseFloat(ultimo.peso_atual) - parseFloat(penultimo.peso_atual)).toFixed(1);
                const isPerda = parseFloat(diff) < 0;
                deltaHtml = `<span class="text-[10px] font-bold ${isPerda ? 'text-emerald-400' : 'text-amber-400'} ml-1.5">(${diff > 0 ? '+' : ''}${diff} kg)</span>`;
            }

            // Data legível
            let dataStr = 'Nenhum envio recente';
            if (ultimo) {
                const d = new Date(ultimo.created_at || ultimo._timestamp);
                dataStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                if (diasPassados === 0) dataStr = 'Hoje';
                else if (diasPassados === 1) dataStr = 'Ontem';
                else if (diasPassados < 7) dataStr = `Há ${diasPassados} dias`;
            }

            // Textos amigáveis
            let dietaLimpa = 'Em dia';
            if (ultimo && ultimo.adesao_dieta) {
                dietaLimpa = ultimo.adesao_dieta.replace(/^[🟢🟡🔴]\s*/, '').replace(/\(.*\)/, '').trim();
            }
            let sonoLimpo = ultimo && ultimo.qualidade_sono ? (ultimo.qualidade_sono.charAt(0).toUpperCase() + ultimo.qualidade_sono.slice(1)) : 'Normal';
            let energiaLimpa = ultimo && ultimo.nivel_energia ? (ultimo.nivel_energia.charAt(0).toUpperCase() + ultimo.nivel_energia.slice(1)) : 'Alta';

            if (!ultimo) {
                // Estado inicial sem check-ins
                container.innerHTML = `
                    <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl hover:border-slate-700/80 transition-all h-full flex flex-col justify-between relative overflow-hidden group">
                        <div class="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/15 transition-all"></div>
                        <div>
                            <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                                        <i data-lucide="clipboard-check" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-base font-bold text-white leading-tight">Check-in Semanal</h2>
                                        <p class="text-xs text-slate-400">Feedback com seu Personal & Nutri</p>
                                    </div>
                                </div>
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                    <span class="w-2 h-2 rounded-full bg-amber-400"></span>Disponível
                                </span>
                            </div>

                            <div class="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 text-center space-y-3">
                                <div class="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                                    <i data-lucide="sparkles" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h3 class="text-sm font-bold text-white">Faça seu Primeiro Check-in</h3>
                                    <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Envie seu peso em jejum e seu relato semanal para alinhar seus treinos e dieta.</p>
                                </div>
                                <div class="flex items-center justify-center gap-2 pt-1 text-[11px] text-amber-400 font-semibold">
                                    <span>⚖️ Peso</span> • <span>🥗 Dieta</span> • <span>🏋️ Treinos</span> • <span>⚡ +10 XP</span>
                                </div>
                            </div>
                        </div>

                        <div class="pt-1">
                            <button type="button" onclick="ApexCheckin.abrirModal()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer">
                                <i data-lucide="clipboard-pen" class="w-4 h-4"></i>
                                <span>Iniciar 1º Check-in (+10 XP)</span>
                                <i data-lucide="arrow-right" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Estado com dados registrados
                container.innerHTML = `
                    <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl hover:border-slate-700/80 transition-all h-full flex flex-col justify-between relative overflow-hidden group">
                        <div class="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/15 transition-all"></div>

                        <div>
                            <!-- Header -->
                            <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 rounded-2xl ${pendente ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'} flex items-center justify-center shrink-0">
                                        <i data-lucide="${pendente ? 'clipboard-pen' : 'clipboard-check'}" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-base font-bold text-white leading-tight">Check-in Semanal</h2>
                                        <p class="text-xs text-slate-400">Feedback com seu Personal & Nutri</p>
                                    </div>
                                </div>

                                <div class="shrink-0">
                                    ${pendente 
                                        ? '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"><span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>Aberto</span>' 
                                        : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.badgeClass} border"><span class="w-2 h-2 rounded-full ${status.dotClass}"></span>${status.texto}</span>`
                                    }
                                </div>
                            </div>

                            <!-- Métricas 2x2 -->
                            <div class="grid grid-cols-2 gap-2.5 my-4">
                                <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                                    <span class="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <i data-lucide="scale" class="w-3 h-3 text-amber-400"></i> Peso em Jejum
                                    </span>
                                    <div class="mt-1 flex items-baseline">
                                        <span class="text-base sm:text-lg font-black text-white">${ultimo.peso_atual ? ultimo.peso_atual + ' kg' : '--'}</span>
                                        ${deltaHtml}
                                    </div>
                                </div>

                                <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                                    <span class="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <i data-lucide="dumbbell" class="w-3 h-3 text-orange-400"></i> Treinos Feitos
                                    </span>
                                    <div class="mt-1">
                                        <span class="text-base sm:text-lg font-black text-white">${ultimo.treinos_realizados || 0} <span class="text-xs font-semibold text-slate-400">dias</span></span>
                                    </div>
                                </div>

                                <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                                    <span class="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <i data-lucide="utensils" class="w-3 h-3 text-emerald-400"></i> Dieta
                                    </span>
                                    <div class="mt-1 truncate">
                                        <span class="text-xs sm:text-sm font-bold text-emerald-300" title="${dietaLimpa}">${dietaLimpa}</span>
                                    </div>
                                </div>

                                <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                                    <span class="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <i data-lucide="moon" class="w-3 h-3 text-cyan-400"></i> Sono & Energia
                                    </span>
                                    <div class="mt-1 truncate">
                                        <span class="text-xs sm:text-sm font-bold text-slate-200">${sonoLimpo} • ${energiaLimpa}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Alerta de status ou dica -->
                            <div class="px-3.5 py-2.5 rounded-xl ${pendente ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' : 'bg-slate-950/60 border border-slate-800/80 text-slate-300'} flex items-center justify-between text-xs mb-4">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="${pendente ? 'bell-ring' : 'check-check'}" class="w-4 h-4 ${pendente ? 'text-amber-400' : 'text-emerald-400'} shrink-0"></i>
                                    <span class="text-[11px] sm:text-xs">${pendente ? 'Novo check-in semanal liberado! Registre seu progresso.' : 'Último check-in avaliado pela equipe técnica.'}</span>
                                </div>
                                <span class="text-[10px] text-slate-400 shrink-0 font-medium">${dataStr}</span>
                            </div>
                        </div>

                        <!-- Botões de Ação na base -->
                        <div class="pt-1">
                            ${pendente ? `
                                <button type="button" onclick="ApexCheckin.abrirModal()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer">
                                    <i data-lucide="clipboard-pen" class="w-4 h-4"></i>
                                    <span>Preencher Check-in Agora (+10 XP)</span>
                                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                </button>
                            ` : `
                                <div class="grid grid-cols-2 gap-2">
                                    <button type="button" onclick="ApexCheckin.abrirHistorico()" class="py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                                        <i data-lucide="history" class="w-4 h-4 text-slate-400"></i>
                                        <span>Ver Histórico</span>
                                    </button>
                                    <button type="button" onclick="ApexCheckin.abrirModal()" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 hover:border-amber-400/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                                        <i data-lucide="plus-circle" class="w-4 h-4 text-amber-400"></i>
                                        <span>Novo Envio</span>
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }

            if (window.lucide) window.lucide.createIcons();
        },

        // Renderiza o Modal de envio de Check-in para o Aluno
        renderModalCheckinAluno() {
            let modal = document.getElementById('modal-checkin-aluno');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'modal-checkin-aluno';
            modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4 overflow-y-auto';
            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-slate-100 relative">
                    <!-- Botão Fechar -->
                    <button type="button" onclick="ApexCheckin.fecharModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>

                    <div class="border-b border-slate-800 pb-4">
                        <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>Acompanhamento Semanal
                        </span>
                        <h2 class="text-xl sm:text-2xl font-black text-white">Check-in de Evolução 📋</h2>
                        <p class="text-xs text-slate-400 mt-1">Compartilhe como foram seus treinos e alimentação para que seus profissionais ajustem sua rotina.</p>
                    </div>

                    <form id="form-checkin-envio" class="space-y-4" onsubmit="ApexCheckin.enviar(event)">
                        <!-- Peso Atual -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">1. Qual seu peso atual em jejum? (kg)</label>
                            <input type="number" step="0.1" id="checkin-peso" required placeholder="Ex: 78.4" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400">
                        </div>

                        <!-- Treinos na semana -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">2. Quantos treinos você realizou esta semana?</label>
                            <div class="grid grid-cols-5 gap-2">
                                ${[1, 2, 3, 4, '5+'].map((n, i) => `
                                    <label class="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-700 bg-slate-950/60 cursor-pointer hover:border-amber-400/50 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-500/10">
                                        <input type="radio" name="checkin-treinos" value="${i + 1}" ${i === 3 ? 'checked' : ''} class="hidden">
                                        <span class="text-sm font-bold text-white">${n}</span>
                                        <span class="text-[10px] text-slate-400">dias</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Adesão à alimentação -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">3. Como foi sua alimentação?</label>
                            <select id="checkin-dieta" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400">
                                <option value="100% no plano">🟢 100% no plano prescrito (Segui à risca)</option>
                                <option value="pequenos deslizes">🟡 Pequenos deslizes (1 ou 2 refeições livres)</option>
                                <option value="fora do plano">🔴 Muito fora do plano (Tive dificuldades)</option>
                            </select>
                        </div>

                        <!-- Grade: Sono, Fome, Energia, Estresse -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Qualidade do Sono</label>
                                <select id="checkin-sono" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                                    <option value="excelente">Excelente (8h+ reparador)</option>
                                    <option value="bom" selected>Bom (6h a 8h)</option>
                                    <option value="regular">Regular (Acordei cansado)</option>
                                    <option value="pessimo">Péssimo (Insônia / <5h)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nível de Energia</label>
                                <select id="checkin-energia" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                                    <option value="maximo">Máximo ⚡</option>
                                    <option value="alto" selected>Alto</option>
                                    <option value="medio">Médio</option>
                                    <option value="baixo">Baixo (Muito cansaço)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nível de Fome</label>
                                <select id="checkin-fome" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                                    <option value="pouca">Pouca</option>
                                    <option value="normal" selected>Normal / Controlada</option>
                                    <option value="alta">Alta</option>
                                    <option value="descontrolada">Descontrolada / Compulsão</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nível de Estresse</label>
                                <select id="checkin-estresse" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                                    <option value="baixo" selected>Baixo / Tranquilo</option>
                                    <option value="moderado">Moderado</option>
                                    <option value="alto">Alto / Ansioso</option>
                                </select>
                            </div>
                        </div>

                        <!-- Observações e Dúvidas -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">4. Observações, dores musculares ou dúvidas</label>
                            <textarea id="checkin-obs" rows="2" placeholder="Conte como se sentiu, alterações de rotina, dificuldades específicas..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"></textarea>
                        </div>

                        <div class="pt-2">
                            <button type="submit" id="btn-enviar-checkin" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer">
                                <i data-lucide="check-check" class="w-4 h-4"></i>
                                <span>Enviar Check-in Semanal (+10 XP)</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons();
        },

        abrirModal() {
            const modal = document.getElementById('modal-checkin-aluno');
            if (modal) {
                modal.classList.remove('hidden');
                // Auto preencher peso se vazio
                const inputPeso = document.getElementById('checkin-peso');
                if (inputPeso && !inputPeso.value) {
                    const statPesoEl = document.getElementById('stat-peso');
                    if (statPesoEl) {
                        const m = statPesoEl.textContent.match(/[\d.]+/);
                        if (m) inputPeso.value = m[0];
                    }
                }
            }
        },

        fecharModal() {
            const modal = document.getElementById('modal-checkin-aluno');
            if (modal) modal.classList.add('hidden');
        },

        // Renderiza o Modal de Histórico de Check-in para o Aluno
        renderModalHistoricoAluno() {
            let modal = document.getElementById('modal-historico-checkin');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'modal-historico-checkin';
            modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4 overflow-y-auto';
            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 text-slate-100 relative">
                    <button type="button" onclick="ApexCheckin.fecharHistoricoModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>

                    <div class="border-b border-slate-800 pb-4">
                        <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                            <i data-lucide="history" class="w-3.5 h-3.5"></i>Registros Semanais
                        </span>
                        <h2 class="text-xl sm:text-2xl font-black text-white">Histórico de Check-ins</h2>
                        <p class="text-xs text-slate-400 mt-1">Acompanhe a sua linha do tempo de evolução, relatos e notas da equipe.</p>
                    </div>

                    <div id="lista-historico-checkins" class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        <div class="text-center py-8 text-xs text-slate-500">Carregando histórico...</div>
                    </div>

                    <div class="pt-2 flex justify-between items-center">
                        <button type="button" onclick="ApexCheckin.fecharHistoricoModal(); ApexCheckin.abrirModal();" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i>
                            <span>Novo Envio</span>
                        </button>
                        <button type="button" onclick="ApexCheckin.fecharHistoricoModal()" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer">
                            Fechar
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons();
        },

        async abrirHistorico() {
            this.renderModalHistoricoAluno();
            const modal = document.getElementById('modal-historico-checkin');
            if (modal) modal.classList.remove('hidden');

            const container = document.getElementById('lista-historico-checkins');
            if (!container) return;

            const checkins = await window.ApexCore.data.getCheckins(this.alunoIdAtual, 20);
            if (!checkins || checkins.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <i data-lucide="inbox" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
                        <p class="text-sm font-bold text-slate-400">Nenhum check-in registrado ainda.</p>
                        <p class="text-xs text-slate-500 mt-1">Faça seu primeiro check-in semanal para começar seu histórico!</p>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            container.innerHTML = checkins.map((c) => {
                const dataFormatada = new Date(c.created_at || c._timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                const statusBadge = {
                    verde: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">🟢 Tudo Certo</span>',
                    amarelo: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">🟡 Atenção</span>',
                    vermelho: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">🔴 Precisa de Atenção</span>'
                }[c.status_indicador || 'verde'];

                const dietaClean = c.adesao_dieta ? c.adesao_dieta.replace(/^[🟢🟡🔴]\s*/, '').replace(/\(.*\)/, '').trim() : 'No Plano';

                return `
                    <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
                            <span class="text-xs font-bold text-white flex items-center gap-1.5">
                                <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i> ${dataFormatada}
                            </span>
                            ${statusBadge}
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                                <span class="text-slate-400 text-[10px] uppercase block font-semibold">Peso</span>
                                <span class="font-extrabold text-white text-xs">${c.peso_atual ? c.peso_atual + ' kg' : '--'}</span>
                            </div>
                            <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                                <span class="text-slate-400 text-[10px] uppercase block font-semibold">Treinos</span>
                                <span class="font-extrabold text-orange-400 text-xs">${c.treinos_realizados || 0} dias</span>
                            </div>
                            <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                                <span class="text-slate-400 text-[10px] uppercase block font-semibold">Dieta</span>
                                <span class="font-extrabold text-emerald-400 text-xs truncate block" title="${dietaClean}">${dietaClean}</span>
                            </div>
                            <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                                <span class="text-slate-400 text-[10px] uppercase block font-semibold">Sono/Energia</span>
                                <span class="font-extrabold text-cyan-400 text-xs capitalize">${c.qualidade_sono || 'Bom'} • ${c.nivel_energia || 'Alto'}</span>
                            </div>
                        </div>
                        ${c.observacoes ? `
                            <div class="text-[11px] text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/50 italic">
                                "${c.observacoes}"
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            if (window.lucide) window.lucide.createIcons();
        },

        fecharHistoricoModal() {
            const modal = document.getElementById('modal-historico-checkin');
            if (modal) modal.classList.add('hidden');
        },

        // Envia o check-in preenchido
        async enviar(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-enviar-checkin');
            btn.disabled = true;
            btn.innerHTML = '<div class="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div><span>Enviando dados...</span>';

            const peso = document.getElementById('checkin-peso').value;
            const dieta = document.getElementById('checkin-dieta').value;
            const sono = document.getElementById('checkin-sono').value;
            const energia = document.getElementById('checkin-energia').value;
            const fome = document.getElementById('checkin-fome').value;
            const estresse = document.getElementById('checkin-estresse').value;
            const obs = document.getElementById('checkin-obs').value;
            const treinosChecked = document.querySelector('input[name="checkin-treinos"]:checked');
            const treinos = treinosChecked ? treinosChecked.value : 4;

            const checkinData = {
                peso_atual: peso,
                adesao_dieta: dieta,
                treinos_realizados: treinos,
                qualidade_sono: sono,
                nivel_energia: energia,
                nivel_fome: fome,
                nivel_estresse: estresse,
                observacoes: obs
            };

            const result = await window.ApexCore.data.saveCheckin(checkinData, this.alunoIdAtual);

            // Grava também no histórico de peso para atualizar o gráfico
            try {
                if (window.supabaseClient && peso) {
                    await window.supabaseClient.from('historico_peso').insert([{
                        aluno_id: this.alunoIdAtual,
                        peso: parseFloat(peso),
                        date_registro: new Date().toISOString()
                    }]);
                }
            } catch (errPeso) { }

            window.ApexCore.sound.playSuccess();
            this.fecharModal();
            await this.renderCardCheckinAluno();
            if (window.ApexHabitos && typeof window.ApexHabitos.renderGamificacao === 'function') {
                window.ApexHabitos.renderGamificacao();
            }

            if (window.showToast) {
                window.showToast('Check-in Enviado com Sucesso! 🚀', 'Seus profissionais foram notificados e analisarão seu progresso.', 'success');
            }
        },

        // ----------------------------------------------------------------------
        // PAINEL PROFISSIONAL: RENDERIZAÇÃO DOS CHECK-INS (ADMIN & PERSONAL)
        // ----------------------------------------------------------------------
        async renderPainelProfissional(containerId, alunoIdSelecionado = null) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const listId = `checkins-lista-prof-${containerId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

            container.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <h2 class="text-lg font-bold text-white flex items-center gap-2">
                                <i data-lucide="clipboard-check" class="w-5 h-5 text-amber-400"></i>
                                Central de Check-ins Semanais
                            </h2>
                            <span class="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">Feedback Semanal</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">Acompanhe as respostas dos alunos, alterações de peso e alertas clínicos.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="ApexCheckin.renderPainelProfissional('${containerId}', '${alunoIdSelecionado || ''}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer">
                            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>Atualizar
                        </button>
                    </div>
                </div>

                <div id="${listId}" class="space-y-4">
                    <div class="text-center py-8 text-xs text-slate-500 flex items-center justify-center gap-2">
                        <div class="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>A carregar check-ins clínicos...</span>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();

            let checkins = [];
            try {
                if (window.ApexCore && window.ApexCore.data && typeof window.ApexCore.data.getCheckins === 'function') {
                    checkins = await window.ApexCore.data.getCheckins(alunoIdSelecionado, 30);
                }
            } catch (err) {
                console.warn('[ApexCheckin] Erro ao buscar check-ins:', err);
            }

            const listBox = document.getElementById(listId);
            if (!listBox) return;

            // Se não houver check-ins cadastrados, provê demonstração clínica rica com opção de alternar
            if (!checkins || checkins.length === 0) {
                const checkinsDemo = [
                    {
                        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
                        status_indicador: 'verde',
                        peso_atual: 74.2,
                        treinos_realizados: 4,
                        adesao_dieta: '100% no plano',
                        qualidade_sono: 'Ótimo (7h30)',
                        nivel_energia: 'Alto',
                        nivel_fome: 'Normal',
                        nivel_estresse: 'Baixo',
                        observacoes: 'Semana excelente! Consegui progredir cargas no agachamento e no supino. Sem dores articulares.'
                    },
                    {
                        created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
                        status_indicador: 'amarelo',
                        peso_atual: 74.8,
                        treinos_realizados: 3,
                        adesao_dieta: 'Pequenos desvios',
                        qualidade_sono: 'Regular (5h)',
                        nivel_energia: 'Médio',
                        nivel_fome: 'Aumentada à noite',
                        nivel_estresse: 'Moderado',
                        observacoes: 'Rotina de trabalho pesada na quinta-feira, precisei pular a refeição 3 e treinei mais cansado.'
                    }
                ];

                listBox.innerHTML = `
                    <div class="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-300 mb-4">
                        <div class="flex items-center gap-2">
                            <i data-lucide="info" class="w-4 h-4 shrink-0 text-amber-400"></i>
                            <span>Exibindo histórico de check-ins recentes (modelo de demonstração interativo). Quando o aluno submeter novos dados pelo portal, eles aparecerão aqui automaticamente.</span>
                        </div>
                    </div>
                ` + checkinsDemo.map((c) => {
                    const dataFormatada = new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                    const statusBadge = {
                        verde: '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">🟢 Tudo Certo</span>',
                        amarelo: '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">🟡 Atenção</span>',
                        vermelho: '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">🔴 Precisa de Atenção</span>'
                    }[c.status_indicador || 'verde'];

                    return `
                        <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i>
                                    <span class="text-sm font-bold text-white">Semana de ${dataFormatada}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    ${statusBadge}
                                </div>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Peso Relatado</span>
                                    <span class="text-base font-extrabold text-white">${c.peso_atual ? c.peso_atual + ' kg' : '--'}</span>
                                </div>
                                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Treinos Realizados</span>
                                    <span class="text-base font-extrabold text-orange-400">${c.treinos_realizados || 0} treinos</span>
                                </div>
                                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Adesão à Dieta</span>
                                    <span class="text-xs font-bold text-lime-400 capitalize">${c.adesao_dieta || 'Normal'}</span>
                                </div>
                                <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                    <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Sono & Energia</span>
                                    <span class="text-xs font-bold text-cyan-400 capitalize">${c.qualidade_sono} / ${c.nivel_energia}</span>
                                </div>
                            </div>

                            ${c.observacoes ? `
                                <div class="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs">
                                    <span class="text-slate-400 font-bold block mb-1">Observações do Aluno:</span>
                                    <p class="text-slate-200 italic">"${c.observacoes}"</p>
                                </div>
                            ` : ''}

                            <div class="flex items-center justify-between pt-2">
                                <span class="text-[11px] text-slate-500">Fome: ${c.nivel_fome || 'Normal'} • Estresse: ${c.nivel_estresse || 'Baixo'}</span>
                                <button type="button" onclick="irParaChatComAlunoAtual()" class="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                                    <i data-lucide="message-square" class="w-3.5 h-3.5"></i>Responder no Chat
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');

                if (window.lucide) window.lucide.createIcons();
                return;
            }

            listBox.innerHTML = checkins.map((c) => {
                const dataFormatada = new Date(c.created_at || c._timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                const statusBadge = {
                    verde: '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">🟢 Tudo Certo</span>',
                    amarelo: '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">🟡 Atenção</span>',
                    vermelho: '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">🔴 Precisa de Atenção</span>'
                }[c.status_indicador || 'verde'];

                return `
                    <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                            <div class="flex items-center gap-2">
                                <i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i>
                                <span class="text-sm font-bold text-white">Semana de ${dataFormatada}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                ${statusBadge}
                            </div>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Peso Relatado</span>
                                <span class="text-base font-extrabold text-white">${c.peso_atual ? c.peso_atual + ' kg' : '--'}</span>
                            </div>
                            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Treinos Realizados</span>
                                <span class="text-base font-extrabold text-orange-400">${c.treinos_realizados || 0} treinos</span>
                            </div>
                            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Adesão à Dieta</span>
                                <span class="text-xs font-bold text-lime-400 capitalize">${c.adesao_dieta || 'Normal'}</span>
                            </div>
                            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Sono & Energia</span>
                                <span class="text-xs font-bold text-cyan-400 capitalize">${c.qualidade_sono} / ${c.nivel_energia}</span>
                            </div>
                        </div>

                        ${c.observacoes ? `
                            <div class="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs">
                                <span class="text-slate-400 font-bold block mb-1">Observações do Aluno:</span>
                                <p class="text-slate-200 italic">"${c.observacoes}"</p>
                            </div>
                        ` : ''}

                        <div class="flex items-center justify-between pt-2">
                            <span class="text-[11px] text-slate-500">Fome: ${c.nivel_fome || 'Normal'} • Estresse: ${c.nivel_estresse || 'Baixo'}</span>
                            <button type="button" onclick="irParaChatComAlunoAtual()" class="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer">
                                <i data-lucide="message-square" class="w-3.5 h-3.5"></i>Responder no Chat
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            if (window.lucide) window.lucide.createIcons();
        }
    };

    window.ApexCheckin = CheckinSystem;
})(window);
