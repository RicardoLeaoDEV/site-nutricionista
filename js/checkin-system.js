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
            this.renderCardCheckinAluno();
            this.renderModalCheckinAluno();
        },

        // Renderiza o card de status do check-in no dashboard do aluno
        async renderCardCheckinAluno() {
            const container = document.getElementById('container-checkin-aluno');
            if (!container) return;

            const checkins = await window.ApexCore.data.getCheckins(this.alunoIdAtual, 1);
            const ultimo = checkins?.[0];
            const hoje = new Date();
            let pendente = true;

            if (ultimo) {
                const dataUltimo = new Date(ultimo.created_at || ultimo._timestamp);
                const diasPassados = Math.floor((hoje - dataUltimo) / (1000 * 60 * 60 * 24));
                if (diasPassados < 7) {
                    pendente = false;
                }
            }

            const statusConfig = {
                verde: { texto: 'Tudo Certo', cor: 'emerald', icone: 'check-circle' },
                amarelo: { texto: 'Atenção', cor: 'amber', icone: 'alert-triangle' },
                vermelho: { texto: 'Precisa de Atenção', cor: 'rose', icone: 'alert-octagon' }
            };

            const status = ultimo ? (statusConfig[ultimo.status_indicador] || statusConfig.verde) : null;

            container.innerHTML = `
                <div class="glass-panel p-5 rounded-2xl border ${pendente ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/90' : 'border-slate-800'} transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl ${pendente ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'} flex items-center justify-center shrink-0">
                                <i data-lucide="${pendente ? 'clipboard-pen' : 'clipboard-check'}" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-sm sm:text-base font-extrabold text-white">Check-in Semanal</h3>
                                    ${pendente ? '<span class="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">Disponível</span>' : '<span class="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Atualizado</span>'}
                                </div>
                                <p class="text-xs text-slate-400 mt-0.5">
                                    ${pendente ? 'Seu personal e nutricionista aguardam seu relato da semana.' : `Último envio registrado. Status da sua semana: <strong class="text-${status.cor}-400 font-bold">🟢 ${status.texto}</strong>`}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <button type="button" onclick="ApexCheckin.abrirModal()" class="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs ${pendente ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'} flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                                <i data-lucide="${pendente ? 'send' : 'history'}" class="w-4 h-4"></i>
                                <span>${pendente ? 'Responder Agora' : 'Ver Histórico / Novo'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
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
            if (modal) modal.classList.remove('hidden');
        },

        fecharModal() {
            const modal = document.getElementById('modal-checkin-aluno');
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
            this.renderCardCheckinAluno();

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

            container.innerHTML = `
                <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div>
                        <h2 class="text-lg font-bold text-white flex items-center gap-2">
                            <i data-lucide="clipboard-check" class="w-5 h-5 text-amber-400"></i>
                            Central de Check-ins Semanais
                        </h2>
                        <p class="text-xs text-slate-400 mt-0.5">Acompanhe as respostas dos alunos, alterações de peso e alertas clínicos.</p>
                    </div>
                    <button type="button" onclick="ApexCheckin.renderPainelProfissional('${containerId}', '${alunoIdSelecionado || ''}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all">
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>Atualizar
                    </button>
                </div>

                <div id="checkins-lista-prof" class="space-y-4">
                    <div class="text-center py-8 text-xs text-slate-500">Buscando check-ins...</div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();

            const checkins = await window.ApexCore.data.getCheckins(alunoIdSelecionado, 30);
            const listBox = document.getElementById('checkins-lista-prof');
            if (!listBox) return;

            if (!checkins || checkins.length === 0) {
                listBox.innerHTML = `
                    <div class="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <i data-lucide="inbox" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
                        <p class="text-sm font-bold text-slate-400">Nenhum check-in registrado para este aluno ainda.</p>
                        <p class="text-xs text-slate-500 mt-1">O aluno receberá um lembrete semanal para preencher os dados.</p>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            listBox.innerHTML = checkins.map((c, idx) => {
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
                            <button type="button" onclick="irParaChatComAlunoAtual()" class="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
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
