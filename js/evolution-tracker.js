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
                            <select id="filtro-angulo-comparador" onchange="ApexEvolucao.filtrarComparador()" class="bg-slate-950 border border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 text-slate-200 focus:outline-none">
                                <option value="frente">Frente</option>
                                <option value="costas">Costas</option>
                                <option value="perfil">Lateral / Perfil</option>
                            </select>
                        </div>
                    </div>

                    <!-- Área de Comparação Visual -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="boxes-comparacao">
                        <!-- Card Antes / Início -->
                        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
                            <span class="absolute top-3 left-3 bg-slate-900/90 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700">
                                🏁 Início da Jornada
                            </span>
                            <div id="foto-antes-container" class="w-full h-full flex flex-col items-center justify-center text-slate-500 py-12">
                                <i data-lucide="image" class="w-8 h-8 mb-2 opacity-50"></i>
                                <span class="text-xs">Foto inicial não registrada</span>
                            </div>
                        </div>

                        <!-- Card Atual / 30d, 60d, 90d -->
                        <div class="bg-slate-950/70 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
                            <span class="absolute top-3 left-3 bg-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-purple-500/40">
                                ⭐ Foto Atual
                            </span>
                            <div id="foto-depois-container" class="w-full h-full flex flex-col items-center justify-center text-slate-500 py-12">
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
            // Busca fotos do banco / galeria
            try {
                if (window.supabaseClient && this.alunoIdAtual) {
                    const { data } = await window.supabaseClient
                        .from('fotos_evolucao')
                        .select('*')
                        .eq('aluno_id', this.alunoIdAtual)
                        .order('data', { ascending: true });

                    if (data && data.length > 0) {
                        this.fotosCache = data;
                        this.atualizarComparadorVisual('frente');
                    }
                }
            } catch (e) { }
        },

        filtrarComparador() {
            const angulo = document.getElementById('filtro-angulo-comparador')?.value || 'frente';
            this.atualizarComparadorVisual(angulo);
        },

        atualizarComparadorVisual(angulo) {
            const fotosFiltradas = this.fotosCache.filter(f => (f.angulo || 'frente').toLowerCase() === angulo.toLowerCase());
            const boxAntes = document.getElementById('foto-antes-container');
            const boxDepois = document.getElementById('foto-depois-container');
            if (!boxAntes || !boxDepois) return;

            if (fotosFiltradas.length > 0) {
                const primeira = fotosFiltradas[0];
                const ultima = fotosFiltradas[fotosFiltradas.length - 1];

                boxAntes.innerHTML = `
                    <img src="${primeira.imagem}" class="max-h-72 w-auto object-contain rounded-xl shadow-lg" alt="Foto Início">
                    <span class="text-[11px] text-slate-400 mt-2 font-medium">Registrado em ${new Date(primeira.data).toLocaleDateString('pt-BR')}</span>
                `;

                boxDepois.innerHTML = `
                    <img src="${ultima.imagem}" class="max-h-72 w-auto object-contain rounded-xl shadow-lg border border-purple-500/30" alt="Foto Atual">
                    <span class="text-[11px] text-purple-300 mt-2 font-medium">Registrado em ${new Date(ultima.data).toLocaleDateString('pt-BR')}</span>
                `;
            }
        }
    };

    window.ApexEvolucao = EvolutionTracker;
})(window);
