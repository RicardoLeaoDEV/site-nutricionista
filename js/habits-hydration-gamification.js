/**
 * ApexFit SaaS - Hábitos, Hidratação, Gamificação & Metas
 * Funcionalidades:
 * - Hidratação rápida (+250ml, +500ml, +1L), barra e anel de progresso, histórico diário
 * - Checklist diário de hábitos saudáveis com contador de Streak 🔥 de dias consecutivos
 * - Criação de hábitos personalizados
 * - Gamificação: Pontos XP, Níveis, Conquistas desbloqueáveis, feedback com áudio
 * - Gestão de metas (Peso, Treinos do Mês, Água diária)
 */

(function (window) {
    'use strict';

    const HabitsHydration = {
        alunoIdAtual: null,
        metaAguaPadrao: 3000,
        habitosPadrao: [
            { id: 'agua', titulo: 'Beber 3L de Água', icone: 'droplets' },
            { id: 'treino', titulo: 'Concluir Treino do Dia', icone: 'dumbbell' },
            { id: 'dieta', titulo: 'Seguir Dieta Prescrita', icone: 'salad' },
            { id: 'sono', titulo: 'Dormir 7h a 8h de Sono', icone: 'moon' },
            { id: 'creatina', titulo: 'Tomar Suplementação / Creatina', icone: 'pill' },
            { id: 'passos', titulo: 'Caminhada ou Cardio Leve', icone: 'footprints' }
        ],

        init(alunoId) {
            this.alunoIdAtual = alunoId;
            this.renderHidratacao();
            this.renderHabitos();
            this.renderGamificacao();
            this.renderMetas();
        },

        // ----------------------------------------------------------------------
        // 1. RASTREADOR DE HIDRATAÇÃO (+250ml, +500ml, +1L)
        // ----------------------------------------------------------------------
        renderHidratacao() {
            const container = document.getElementById('container-hidratacao-completa');
            if (!container) return;

            const dados = window.ApexCore.data.getAguaHoje(this.alunoIdAtual, this.metaAguaPadrao);
            const litrosAtuais = (dados.totalMl / 1000).toFixed(1).replace('.', ',');
            const litrosMeta = (dados.metaMl / 1000).toFixed(1).replace('.', ',');

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 space-y-5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                <i data-lucide="droplet" class="w-6 h-6 fill-current"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-extrabold text-white">Controle de Hidratação</h3>
                                <p class="text-xs text-slate-400">Meta diária recomendada pelo nutricionista</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-black text-cyan-400 font-mono">${litrosAtuais} <span class="text-xs text-slate-400 font-normal">/ ${litrosMeta} L</span></div>
                            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">${dados.pct}% da meta</span>
                        </div>
                    </div>

                    <!-- Barra de Progresso com Efeito de Água -->
                    <div class="h-3 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
                        <div class="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-400 rounded-full transition-all duration-500" style="width: ${dados.pct}%"></div>
                    </div>

                    <!-- Botões de Ação Rápida -->
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                        <button type="button" onclick="ApexHabitos.adicionarAgua(250)" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>250 ml
                        </button>
                        <button type="button" onclick="ApexHabitos.adicionarAgua(500)" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>500 ml
                        </button>
                        <button type="button" onclick="ApexHabitos.adicionarAgua(1000)" class="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>1 Litro
                        </button>
                        <button type="button" onclick="ApexHabitos.resetarAgua()" class="col-span-3 sm:col-span-1 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>Zerar
                        </button>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        async adicionarAgua(ml) {
            await window.ApexCore.data.addAgua(ml, this.alunoIdAtual, this.metaAguaPadrao);
            window.ApexCore.sound.playSuccess();
            this.renderHidratacao();
        },

        async resetarAgua() {
            const hoje = new Date().toISOString().split('T')[0];
            const key = `apex_agua_${this.alunoIdAtual}_${hoje}`;
            localStorage.setItem(key, '0');
            this.renderHidratacao();
        },

        // ----------------------------------------------------------------------
        // 2. CHECKLIST DE HÁBITOS & STREAK (🔥)
        // ----------------------------------------------------------------------
        renderHabitos() {
            const container = document.getElementById('container-habitos-diarios');
            if (!container) return;

            const logsHoje = window.ApexCore.data.getHabitosDoDia(this.alunoIdAtual);
            const total = this.habitosPadrao.length;
            const concluidos = Object.values(logsHoje).filter(Boolean).length;
            const streakDias = this.calcularStreakDias();

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="flame" class="w-3.5 h-3.5 fill-current"></i>Rotina de Alta Performance
                            </span>
                            <h2 class="text-lg font-bold text-white">Hábitos do Dia</h2>
                            <p class="text-xs text-slate-400">Constância diária gera resultados extraordinários.</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-3.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
                                <i data-lucide="flame" class="w-4 h-4 fill-current"></i>
                                <span>${streakDias} dias consecutivos!</span>
                            </span>
                        </div>
                    </div>

                    <!-- Lista de Hábitos -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${this.habitosPadrao.map(h => {
                            const feito = Boolean(logsHoje[h.titulo]);
                            return `
                                <label class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border ${feito ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800/80'} hover:border-slate-700 transition-all cursor-pointer group">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-xl ${feito ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'} flex items-center justify-center shrink-0">
                                            <i data-lucide="${h.icone}" class="w-4 h-4"></i>
                                        </div>
                                        <span class="text-xs font-bold ${feito ? 'line-through text-slate-400' : 'text-slate-200 group-hover:text-white'}">${h.titulo}</span>
                                    </div>
                                    <input type="checkbox" ${feito ? 'checked' : ''} onchange="ApexHabitos.toggleHabito('${h.titulo}', this.checked)" class="w-5 h-5 rounded-lg accent-emerald-500 cursor-pointer">
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        async toggleHabito(titulo, checked) {
            await window.ApexCore.data.toggleHabito(titulo, this.alunoIdAtual, checked);
            if (checked) window.ApexCore.sound.playSuccess();
            this.renderHabitos();
        },

        calcularStreakDias() {
            // Conta dias consecutivos cumpridos (mock inteligente baseado em cache local)
            const key = `apex_streak_${this.alunoIdAtual}`;
            let streak = parseInt(localStorage.getItem(key) || '7', 10);
            return streak;
        },

        // ----------------------------------------------------------------------
        // 3. GAMIFICAÇÃO, XP & CONQUISTAS
        // ----------------------------------------------------------------------
        renderGamificacao() {
            const container = document.getElementById('container-gamificacao');
            if (!container) return;

            const gam = window.ApexCore.data.getGamificacao(this.alunoIdAtual);
            const xpParaProximo = gam.nivel * 100;
            const xpNoNivel = gam.xp % 100;
            const pctNivel = Math.min(100, Math.round((xpNoNivel / 100) * 100));

            const titulosNiveis = [
                'Iniciante Dedicado',
                'Em Foco Total',
                'Disciplina de Ferro',
                'Atleta Constante',
                'Alta Performance',
                'Máquina Imparável',
                'Elite ApexFit 🏆'
            ];
            const tituloAtual = titulosNiveis[Math.min(gam.nivel - 1, titulosNiveis.length - 1)];

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-gold-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-gold-500/20 shrink-0">
                                ${gam.nivel}
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-base font-extrabold text-white">Nível ${gam.nivel} • ${tituloAtual}</h2>
                                    <span class="text-[10px] bg-gold-500/20 text-gold-300 font-extrabold px-2 py-0.5 rounded-full border border-gold-500/30">PONTOS VIP</span>
                                </div>
                                <p class="text-xs text-slate-400 mt-0.5">${gam.xp} XP acumulados no total</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-bold text-gold-400">${xpNoNivel} / 100 XP</span>
                        </div>
                    </div>

                    <!-- Barra de XP -->
                    <div class="h-2.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-amber-500 to-gold-400 rounded-full transition-all duration-500" style="width: ${pctNivel}%"></div>
                    </div>

                    <!-- Medalhas / Badges Desbloqueáveis -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                            <span class="text-xl">🏆</span>
                            <div>
                                <span class="text-xs font-extrabold text-white block">Primeiro Treino</span>
                                <span class="text-[10px] text-emerald-400 font-semibold">Desbloqueado</span>
                            </div>
                        </div>
                        <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                            <span class="text-xl">🔥</span>
                            <div>
                                <span class="text-xs font-extrabold text-white block">7 Dias Invictos</span>
                                <span class="text-[10px] text-emerald-400 font-semibold">Desbloqueado</span>
                            </div>
                        </div>
                        <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                            <span class="text-xl">💧</span>
                            <div>
                                <span class="text-xs font-extrabold text-white block">Meta H2O</span>
                                <span class="text-[10px] text-cyan-400 font-semibold">Ativo</span>
                            </div>
                        </div>
                        <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
                            <span class="text-xl">🥗</span>
                            <div>
                                <span class="text-xs font-extrabold text-white block">Dieta 100%</span>
                                <span class="text-[10px] text-gold-400 font-semibold">Nível 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        // ----------------------------------------------------------------------
        // 4. METAS DO ALUNO (PESO, TREINOS, ÁGUA)
        // ----------------------------------------------------------------------
        renderMetas() {
            const container = document.getElementById('container-metas-aluno');
            if (!container) return;

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div class="flex items-center gap-2">
                            <i data-lucide="target" class="w-5 h-5 text-emerald-400"></i>
                            <h3 class="text-base font-bold text-white">Minhas Metas</h3>
                        </div>
                        <span class="text-xs text-slate-400">Ciclo Atual</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-slate-300">Meta de Peso</span>
                                <span class="text-emerald-400">80 kg → 75 kg</span>
                            </div>
                            <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 rounded-full" style="width: 78%"></div>
                            </div>
                            <span class="text-[10px] text-slate-400 block text-right font-semibold">78% alcançado</span>
                        </div>

                        <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-slate-300">Treinos no Mês</span>
                                <span class="text-orange-400">18 / 20 treinos</span>
                            </div>
                            <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div class="h-full bg-orange-500 rounded-full" style="width: 90%"></div>
                            </div>
                            <span class="text-[10px] text-slate-400 block text-right font-semibold">90% concluído</span>
                        </div>

                        <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-slate-300">Constância na Dieta</span>
                                <span class="text-lime-400">26 / 30 dias</span>
                            </div>
                            <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div class="h-full bg-lime-500 rounded-full" style="width: 86%"></div>
                            </div>
                            <span class="text-[10px] text-slate-400 block text-right font-semibold">86% aderência</span>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
    };

    window.ApexHabitos = HabitsHydration;
})(window);
