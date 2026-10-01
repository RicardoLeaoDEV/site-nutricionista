/**
 * ApexFit SaaS - Dashboard de Evolução Física, Medidas & Fotos Comparativas
 * Funcionalidades:
 * - Registro de Medidas Corporais (Braço, Tórax, Cintura, Abdômen, Quadril, Coxa, % Gordura)
 * - Comparação Fotográfica Interativa (Antes | Depois / Início, 30d, 60d, 90d, Atual)
 * - Gráficos e Deltas de Evolução (Peso Inicial -> Peso Atual, Variação total)
 */

(function (window) {
    'use strict';

    const EvolutionTracker = {
        alunoIdAtual: null,
        fotosCache: [],
        medidasCache: [],

        init(alunoId) {
            this.alunoIdAtual = alunoId;
            this.carregarDados();
        },

        async carregarDados() {
            if (!this.alunoIdAtual) return;
            this.medidasCache = await window.ApexCore.data.getMedidas(this.alunoIdAtual, 20);
            this.renderMedidas();
            this.renderComparadorFotos();
        },

        // Renderiza tabela / histórico de medidas corporais
        renderMedidas() {
            const container = document.getElementById('container-medidas-corporais');
            if (!container) return;

            const ultimas = this.medidasCache?.[0];

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="ruler" class="w-3.5 h-3.5"></i>Biometria Corporal
                            </span>
                            <h2 class="text-lg font-bold text-white">Medidas Corporais & Circunferências</h2>
                            <p class="text-xs text-slate-400">Acompanhe a perda de medidas e ganho de massa muscular.</p>
                        </div>
                        <button type="button" onclick="ApexEvolucao.abrirModalMedidas()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-blue-500/40 flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-center transition-all">
                            <i data-lucide="plus" class="w-4 h-4"></i>Registrar Novas Medidas
                        </button>
                    </div>

                    <!-- Grid de Medidas Atuais -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Braço D / E</span>
                            <span class="text-sm font-extrabold text-white">${ultimas ? `${ultimas.braco_direito || '--'} / ${ultimas.braco_esquerdo || '--'} cm` : '--'}</span>
                        </div>
                        <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tórax</span>
                            <span class="text-sm font-extrabold text-blue-400">${ultimas?.torax ? ultimas.torax + ' cm' : '--'}</span>
                        </div>
                        <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Cintura</span>
                            <span class="text-sm font-extrabold text-emerald-400">${ultimas?.cintura ? ultimas.cintura + ' cm' : '--'}</span>
                        </div>
                        <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Abdômen</span>
                            <span class="text-sm font-extrabold text-amber-400">${ultimas?.abdomen ? ultimas.abdomen + ' cm' : '--'}</span>
                        </div>
                        <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Quadril</span>
                            <span class="text-sm font-extrabold text-purple-400">${ultimas?.quadril ? ultimas.quadril + ' cm' : '--'}</span>
                        </div>
                        <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Coxa D / E</span>
                            <span class="text-sm font-extrabold text-white">${ultimas ? `${ultimas.coxa_direita || '--'} / ${ultimas.coxa_esquerda || '--'} cm` : '--'}</span>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            this.injetarModalMedidas();
        },

        injetarModalMedidas() {
            let modal = document.getElementById('modal-registro-medidas');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'modal-registro-medidas';
            modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4 overflow-y-auto';
            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-slate-100 relative">
                    <button type="button" onclick="ApexEvolucao.fecharModalMedidas()" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>

                    <div class="border-b border-slate-800 pb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1">
                            <i data-lucide="ruler" class="w-3.5 h-3.5"></i>Antropometria
                        </span>
                        <h2 class="text-xl font-black text-white">Registrar Medidas Corporais 📏</h2>
                        <p class="text-xs text-slate-400 mt-1">Preencha com fita métrica os valores em centímetros (cm).</p>
                    </div>

                    <form id="form-medidas-corpo" class="space-y-4" onsubmit="ApexEvolucao.salvarMedidas(event)">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Braço Direito (cm)</label>
                                <input type="number" step="0.5" id="med-braco-d" placeholder="Ex: 36.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Braço Esquerdo (cm)</label>
                                <input type="number" step="0.5" id="med-braco-e" placeholder="Ex: 36.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Tórax / Peitoral (cm)</label>
                                <input type="number" step="0.5" id="med-torax" placeholder="Ex: 102.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Cintura (cm)</label>
                                <input type="number" step="0.5" id="med-cintura" placeholder="Ex: 82.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Abdômen (Umbigo)</label>
                                <input type="number" step="0.5" id="med-abdomen" placeholder="Ex: 86.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Quadril (cm)</label>
                                <input type="number" step="0.5" id="med-quadril" placeholder="Ex: 98.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Coxa Direita (cm)</label>
                                <input type="number" step="0.5" id="med-coxa-d" placeholder="Ex: 58.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Coxa Esquerda (cm)</label>
                                <input type="number" step="0.5" id="med-coxa-e" placeholder="Ex: 57.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                            </div>
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Percentual de Gordura Estimado (% - Opcional)</label>
                            <input type="number" step="0.1" id="med-bf" placeholder="Ex: 14.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                        </div>

                        <div class="pt-2">
                            <button type="submit" id="btn-salvar-medidas" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                <span>Salvar Medidas (+10 XP)</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons();
        },

        abrirModalMedidas() {
            const modal = document.getElementById('modal-registro-medidas');
            if (modal) modal.classList.remove('hidden');
        },

        fecharModalMedidas() {
            const modal = document.getElementById('modal-registro-medidas');
            if (modal) modal.classList.add('hidden');
        },

        async salvarMedidas(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-salvar-medidas');
            btn.disabled = true;

            const dados = {
                braco_direito: document.getElementById('med-braco-d').value,
                braco_esquerdo: document.getElementById('med-braco-e').value,
                torax: document.getElementById('med-torax').value,
                cintura: document.getElementById('med-cintura').value,
                abdomen: document.getElementById('med-abdomen').value,
                quadril: document.getElementById('med-quadril').value,
                coxa_direita: document.getElementById('med-coxa-d').value,
                coxa_esquerda: document.getElementById('med-coxa-e').value,
                percentual_gordura: document.getElementById('med-bf').value,
                data_registro: new Date().toISOString().split('T')[0]
            };

            await window.ApexCore.data.saveMedidas(dados, this.alunoIdAtual);
            window.ApexCore.sound.playSuccess();
            this.fecharModalMedidas();
            await this.carregarDados();

            if (window.showToast) {
                window.showToast('Medidas Salvas!', 'Histórico biométrico atualizado com sucesso.', 'success');
            }
        },

        // ----------------------------------------------------------------------
        // COMPARADOR DE FOTOS ANTES | DEPOIS
        // ----------------------------------------------------------------------
        getAnguloFoto(f) {
            if (!f) return '';
            const raw = (f.tipo || f.angulo || '').toString().toLowerCase().trim();
            if (raw === 'perfil' || raw === 'lado' || raw === 'lateral') return 'lado';
            if (raw === 'costas' || raw === 'costa') return 'costas';
            if (raw === 'frente') return 'frente';
            return raw;
        },

        normalizarAngulo(val) {
            const raw = (val || '').toString().toLowerCase().trim();
            if (raw === 'perfil' || raw === 'lado' || raw === 'lateral') return 'lado';
            if (raw === 'costas' || raw === 'costa') return 'costas';
            return 'frente';
        },

        renderComparadorFotos() {
            const container = document.getElementById('container-comparador-fotos');
            if (!container) return;

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="columns" class="w-3.5 h-3.5"></i>Transformação Visual
                            </span>
                            <h2 class="text-lg font-bold text-white">Comparador de Evolução: Antes & Depois</h2>
                            <p class="text-xs text-slate-400">Compare lado a lado suas fotos de início com sua forma atual.</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <label for="filtro-angulo-comparador" class="text-xs font-semibold text-slate-400 hidden sm:inline">Ângulo:</label>
                            <select id="filtro-angulo-comparador" onchange="ApexEvolucao.filtrarComparador()" class="bg-slate-950 border border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer transition-colors shadow-sm">
                                <option value="frente">Frente</option>
                                <option value="lado">Lado</option>
                                <option value="costas">Costas</option>
                            </select>
                        </div>
                    </div>

                    <!-- Área de Comparação Visual -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="boxes-comparacao">
                        <!-- Card Antes / Início -->
                        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden group">
                            <span class="absolute top-3 left-3 bg-slate-900/95 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700 z-10 shadow-sm">
                                🏁 Início da Jornada
                            </span>
                            <div id="foto-antes-container" class="w-full h-full flex flex-col items-center justify-center text-slate-500 py-8">
                                <i data-lucide="image" class="w-8 h-8 mb-2 opacity-50"></i>
                                <span class="text-xs">Foto inicial não registrada</span>
                            </div>
                        </div>

                        <!-- Card Atual / Recente -->
                        <div class="bg-slate-950/70 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden group">
                            <span class="absolute top-3 left-3 bg-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-purple-500/40 z-10 shadow-sm">
                                ⭐ Foto Atual
                            </span>
                            <div id="foto-depois-container" class="w-full h-full flex flex-col items-center justify-center text-slate-500 py-8">
                                <i data-lucide="image" class="w-8 h-8 mb-2 opacity-50"></i>
                                <span class="text-xs">Foto recente não registrada</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            this.carregarFotosComparador();
        },

        async carregarFotosComparador() {
            try {
                let fotos = [];
                // 1. Busca do Supabase
                if (window.supabaseClient && this.alunoIdAtual) {
                    const { data, error } = await window.supabaseClient
                        .from('fotos_evolucao')
                        .select('*')
                        .eq('aluno_id', this.alunoIdAtual)
                        .order('data', { ascending: true });

                    if (!error && data && data.length > 0) {
                        fotos = data;
                    }
                }

                // 2. Se vazio ou offline, tenta buscar do IndexedDB local
                if ((!fotos || fotos.length === 0) && typeof window.dbGetAll === 'function' && this.alunoIdAtual) {
                    try {
                        const locais = await window.dbGetAll(this.alunoIdAtual);
                        if (locais && locais.length > 0) {
                            fotos = locais;
                        }
                    } catch (eDb) { }
                }

                this.fotosCache = fotos;
                const selectAngulo = document.getElementById('filtro-angulo-comparador');
                const anguloAtual = selectAngulo?.value || 'frente';
                this.atualizarComparadorVisual(anguloAtual);
            } catch (e) {
                console.error("Erro ao carregar fotos comparador:", e);
            }
        },

        filtrarComparador() {
            const angulo = document.getElementById('filtro-angulo-comparador')?.value || 'frente';
            this.atualizarComparadorVisual(angulo);
        },

        atualizarComparadorVisual(angulo) {
            const filtro = this.normalizarAngulo(angulo);
            const labelMap = {
                frente: 'Frente',
                lado: 'Lado',
                costas: 'Costas'
            };
            const labelAngulo = labelMap[filtro] || 'Frente';
            const labelUpper = labelAngulo.toUpperCase();

            // Sincroniza o select caso o valor tenha sido passado por parâmetro
            const selectEl = document.getElementById('filtro-angulo-comparador');
            if (selectEl && selectEl.value !== filtro) {
                if (Array.from(selectEl.options).some(o => o.value === filtro)) {
                    selectEl.value = filtro;
                }
            }

            // Filtra estritamente pelo mesmo ângulo para ambos os cards
            const fotosFiltradas = (this.fotosCache || []).filter(f => this.getAnguloFoto(f) === filtro);

            // Ordena cronologicamente (da mais antiga para a mais recente)
            fotosFiltradas.sort((a, b) => {
                const dataA = a.data || a.criadoEm || a.created_at || '';
                const dataB = b.data || b.criadoEm || b.created_at || '';
                if (dataA !== dataB) return dataA.localeCompare(dataB);
                return (a.id || 0) - (b.id || 0);
            });

            const boxAntes = document.getElementById('foto-antes-container');
            const boxDepois = document.getElementById('foto-depois-container');
            if (!boxAntes || !boxDepois) return;

            if (fotosFiltradas.length === 0) {
                // Estado sem fotos para este ângulo específico
                boxAntes.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center text-slate-500 py-10 text-center px-4">
                        <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                            <i data-lucide="image" class="w-6 h-6 text-slate-600"></i>
                        </div>
                        <span class="text-xs font-semibold text-slate-300">Sem foto inicial (${labelAngulo})</span>
                        <span class="text-[11px] text-slate-500 mt-1 max-w-xs">Envie uma foto desse ângulo na seção de Galeria para iniciar sua comparação.</span>
                    </div>
                `;

                boxDepois.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center text-slate-500 py-10 text-center px-4">
                        <div class="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center mb-3">
                            <i data-lucide="camera" class="w-6 h-6 text-purple-400"></i>
                        </div>
                        <span class="text-xs font-semibold text-slate-300">Sem foto atual (${labelAngulo})</span>
                        <span class="text-[11px] text-slate-500 mt-1 max-w-xs">Fotos registradas de ${labelAngulo.toLowerCase()} aparecerão aqui lado a lado.</span>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            const primeira = fotosFiltradas[0];
            const ultima = fotosFiltradas[fotosFiltradas.length - 1];

            const formatarData = (d) => {
                if (!d) return '--';
                if (typeof d === 'string' && d.includes('-') && !d.includes('T')) {
                    const [y, m, dia] = d.split('-');
                    return `${dia}/${m}/${y}`;
                }
                return new Date(d).toLocaleDateString('pt-BR');
            };

            const dataPrimeira = formatarData(primeira.data || primeira.criadoEm || primeira.created_at);
            const dataUltima = formatarData(ultima.data || ultima.criadoEm || ultima.created_at);

            // Card Início da Jornada (Foto mais antiga do ângulo selecionado)
            boxAntes.innerHTML = `
                <div class="w-full flex flex-col items-center pt-5">
                    <div class="relative rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 group flex items-center justify-center max-w-full">
                        <img src="${primeira.imagem}" class="max-h-72 w-auto max-w-full object-contain rounded-xl" alt="Início - ${labelAngulo}">
                        <div class="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                            <i data-lucide="user" class="w-3 h-3 text-purple-400"></i>
                            <span>${labelUpper}</span>
                        </div>
                    </div>
                    <span class="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500"></i>
                        Registrado em ${dataPrimeira}
                    </span>
                </div>
            `;

            // Card Foto Atual (Foto mais recente do MESMO ângulo selecionado)
            boxDepois.innerHTML = `
                <div class="w-full flex flex-col items-center pt-5">
                    <div class="relative rounded-2xl overflow-hidden shadow-xl border border-purple-500/30 bg-slate-950 group flex items-center justify-center max-w-full">
                        <img src="${ultima.imagem}" class="max-h-72 w-auto max-w-full object-contain rounded-xl" alt="Atual - ${labelAngulo}">
                        <div class="absolute top-2.5 left-2.5 bg-purple-950/90 backdrop-blur-md text-purple-200 border border-purple-500/50 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                            <i data-lucide="user" class="w-3 h-3 text-purple-300"></i>
                            <span>${labelUpper}</span>
                        </div>
                    </div>
                    <span class="text-[11px] text-purple-300 mt-3 font-medium flex items-center gap-1.5">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-purple-400"></i>
                        Registrado em ${dataUltima}
                    </span>
                </div>
            `;

            if (window.lucide) window.lucide.createIcons();
        }
    };

    window.ApexEvolucao = EvolutionTracker;
})(window);
