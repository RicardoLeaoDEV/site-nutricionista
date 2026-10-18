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
        isProfissional: false,
        profissionalNome: '',
        profissionalTipo: '',

        init(alunoId, options = {}) {
            this.alunoIdAtual = alunoId;
            this.isProfissional = options.isProfissional === true;
            this.profissionalNome = options.profissionalNome || '';
            this.profissionalTipo = options.profissionalTipo || '';
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

            let dataFormatada = '--';
            if (ultimas?.data_registro) {
                const partes = ultimas.data_registro.split('-');
                if (partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                else dataFormatada = ultimas.data_registro;
            } else if (ultimas?.created_at) {
                try {
                    dataFormatada = new Date(ultimas.created_at).toLocaleDateString('pt-BR');
                } catch (e) { }
            }

            const nomeProfissional = ultimas?.profissional_nome || 'Profissional Vinculado';
            const tipoProfissional = ultimas?.profissional_tipo
                ? (ultimas.profissional_tipo.toLowerCase().includes('nutri') ? 'Nutricionista' : 'Personal Trainer')
                : 'Nutricionista / Personal';

            // HTML de Auditoria e Acesso Restrito (Exclusivo para o Aluno vs Profissional)
            let blocoAcaoOuAuditoria = '';
            if (this.isProfissional) {
                blocoAcaoOuAuditoria = `
                    <button type="button" onclick="ApexEvolucao.abrirModalMedidas()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-blue-500/40 flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-center transition-all active:scale-95">
                        <i data-lucide="plus" class="w-4 h-4"></i>Registrar / Atualizar Medidas do Aluno
                    </button>
                `;
            } else {
                // Aluno visualizando: apenas leitura com identificação de auditoria
                if (ultimas) {
                    blocoAcaoOuAuditoria = `
                        <div class="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/25 px-3.5 py-2 rounded-2xl text-xs">
                            <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                <i data-lucide="shield-check" class="w-4 h-4"></i>
                            </div>
                            <div class="leading-tight">
                                <span class="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">Última Avaliação Antropométrica</span>
                                <span class="text-xs text-white font-medium">
                                    Registrado por: <strong class="text-blue-300 font-bold">${nomeProfissional}</strong> <span class="text-slate-400">(${tipoProfissional})</span> • <strong class="text-slate-300">${dataFormatada}</strong>
                                </span>
                            </div>
                        </div>
                    `;
                } else {
                    blocoAcaoOuAuditoria = `
                        <div class="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs text-slate-400">
                            <div class="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                                <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                            </div>
                            <span>As medidas corporais são atualizadas exclusivamente pelo seu Nutricionista ou Personal Trainer.</span>
                        </div>
                    `;
                }
            }

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-amber-500/30 transition-all space-y-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="ruler" class="w-3.5 h-3.5"></i>Biometria Corporal & Antropometria
                            </span>
                            <h2 class="text-lg font-bold text-white">Medidas Corporais & Circunferências</h2>
                            <p class="text-xs text-slate-400">Dados antropométricos oficiais validados pelo profissional.</p>
                        </div>
                        ${blocoAcaoOuAuditoria}
                    </div>

                    <!-- Informações do Profissional Responsável (quando disponível) -->
                    ${ultimas ? `
                        <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                            <div class="flex items-center gap-2">
                                <i data-lucide="user-check" class="w-3.5 h-3.5 text-blue-400"></i>
                                <span>Avaliador Responsável: <strong class="text-slate-200">${nomeProfissional}</strong></span>
                                <span class="text-slate-600">•</span>
                                <span class="text-blue-400 font-medium">${tipoProfissional}</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-slate-400">
                                <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500"></i>
                                <span>Data do Registro: <strong class="text-slate-200">${dataFormatada}</strong></span>
                            </div>
                        </div>
                    ` : ''}

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

            if (this.isProfissional) {
                this.injetarModalMedidas();
            }
        },

        injetarModalMedidas() {
            let modal = document.getElementById('modal-registro-medidas');
            if (modal) modal.remove();

            const ultimas = this.medidasCache?.[0] || {};
            const hoje = new Date().toISOString().split('T')[0];

            modal = document.createElement('div');
            modal.id = 'modal-registro-medidas';
            modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4 overflow-y-auto';
            modal.innerHTML = `
                <div class="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-slate-100 relative max-h-[90vh] overflow-y-auto">
                    <button type="button" onclick="ApexEvolucao.fecharModalMedidas()" class="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>

                    <div class="border-b border-slate-800 pb-3">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                                <i data-lucide="shield-check" class="w-3 h-3"></i>Área do Profissional
                            </span>
                            <span class="text-xs text-slate-400">${this.profissionalNome ? `Avaliador: <strong class="text-white">${this.profissionalNome}</strong>` : ''}</span>
                        </div>
                        <h2 class="text-xl font-black text-white">Avaliação Antropométrica 📏</h2>
                        <p class="text-xs text-slate-400 mt-1">Preencha as circunferências com fita métrica em centímetros (cm).</p>
                    </div>

                    <form id="form-medidas-corpo" class="space-y-4" onsubmit="ApexEvolucao.salvarMedidas(event)">
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Data da Avaliação *</label>
                            <input type="date" id="med-data" value="${hoje}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Braço Direito (cm)</label>
                                <input type="number" step="0.1" id="med-braco-d" value="${ultimas.braco_direito || ''}" placeholder="Ex: 36.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Braço Esquerdo (cm)</label>
                                <input type="number" step="0.1" id="med-braco-e" value="${ultimas.braco_esquerdo || ''}" placeholder="Ex: 36.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Tórax / Peitoral (cm)</label>
                                <input type="number" step="0.1" id="med-torax" value="${ultimas.torax || ''}" placeholder="Ex: 102.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Cintura (cm)</label>
                                <input type="number" step="0.1" id="med-cintura" value="${ultimas.cintura || ''}" placeholder="Ex: 82.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Abdômen / Umbigo (cm)</label>
                                <input type="number" step="0.1" id="med-abdomen" value="${ultimas.abdomen || ''}" placeholder="Ex: 86.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Quadril (cm)</label>
                                <input type="number" step="0.1" id="med-quadril" value="${ultimas.quadril || ''}" placeholder="Ex: 98.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Coxa Direita (cm)</label>
                                <input type="number" step="0.1" id="med-coxa-d" value="${ultimas.coxa_direita || ''}" placeholder="Ex: 58.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Coxa Esquerda (cm)</label>
                                <input type="number" step="0.1" id="med-coxa-e" value="${ultimas.coxa_esquerda || ''}" placeholder="Ex: 57.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Panturrilha (cm)</label>
                                <input type="number" step="0.1" id="med-panturrilha" value="${ultimas.panturrilha || ''}" placeholder="Ex: 38.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Peso na Avaliação (kg)</label>
                                <input type="number" step="0.1" id="med-peso-avaliacao" value="${ultimas.peso || ''}" placeholder="Ex: 78.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">% Gordura Estimado (BF)</label>
                                <input type="number" step="0.1" id="med-bf" value="${ultimas.percentual_gordura || ''}" placeholder="Ex: 14.5" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Massa Muscular Estimada (kg)</label>
                                <input type="number" step="0.1" id="med-massa" value="${ultimas.massa_muscular || ''}" placeholder="Ex: 34.0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                            </div>
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Observações Clínicas (Opcional)</label>
                            <textarea id="med-observacoes" rows="2" placeholder="Observações posturais, retenção ou comentários..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">${ultimas.observacoes || ''}</textarea>
                        </div>

                        <div class="pt-2">
                            <button type="submit" id="btn-salvar-medidas" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                <span>Salvar Avaliação Antropométrica</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons();
        },

        abrirModalMedidas() {
            if (!this.isProfissional) {
                if (window.showToast) {
                    window.showToast('Acesso Restrito 🔒', 'Apenas o nutricionista ou personal vinculado pode atualizar suas medidas.', 'info');
                }
                return;
            }
            const modal = document.getElementById('modal-registro-medidas');
            if (modal) modal.classList.remove('hidden');
        },

        fecharModalMedidas() {
            const modal = document.getElementById('modal-registro-medidas');
            if (modal) modal.classList.add('hidden');
        },

        async salvarMedidas(e) {
            e.preventDefault();
            if (!this.isProfissional) return;

            const btn = document.getElementById('btn-salvar-medidas');
            if (btn) btn.disabled = true;

            const dados = {
                braco_direito: document.getElementById('med-braco-d')?.value || null,
                braco_esquerdo: document.getElementById('med-braco-e')?.value || null,
                torax: document.getElementById('med-torax')?.value || null,
                cintura: document.getElementById('med-cintura')?.value || null,
                abdomen: document.getElementById('med-abdomen')?.value || null,
                quadril: document.getElementById('med-quadril')?.value || null,
                coxa_direita: document.getElementById('med-coxa-d')?.value || null,
                coxa_esquerda: document.getElementById('med-coxa-e')?.value || null,
                panturrilha: document.getElementById('med-panturrilha')?.value || null,
                peso: document.getElementById('med-peso-avaliacao')?.value || null,
                percentual_gordura: document.getElementById('med-bf')?.value || null,
                massa_muscular: document.getElementById('med-massa')?.value || null,
                observacoes: document.getElementById('med-observacoes')?.value || '',
                data_registro: document.getElementById('med-data')?.value || new Date().toISOString().split('T')[0],
                profissional_nome: this.profissionalNome || 'Profissional Responsável',
                profissional_tipo: this.profissionalTipo || 'profissional'
            };

            await window.ApexCore.data.saveMedidas(dados, this.alunoIdAtual);
            if (window.ApexCore && window.ApexCore.sound) window.ApexCore.sound.playSuccess();
            this.fecharModalMedidas();
            await this.carregarDados();

            if (window.showToast) {
                window.showToast('Avaliação Salva! 📏', `Medidas atualizadas por ${this.profissionalNome || 'Profissional'}.`, 'success');
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
        },

        // ----------------------------------------------------------------------
        // SUÍTE COMPLETA DE ANTROPOMETRIA & MEDIDAS CORPORAIS (NOVA ABA & CHIPS)
        // ----------------------------------------------------------------------
        formatarTempoRelativo(dataStr) {
            if (!dataStr) return 'Sem aferição';
            try {
                const d = new Date(dataStr.includes('T') ? dataStr : dataStr + 'T12:00:00');
                if (isNaN(d.getTime())) return dataStr;
                const agora = new Date();
                const diffMs = agora - d;
                const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                if (diffDias <= 0) return 'Atualizado hoje';
                if (diffDias === 1) return 'Atualizado ontem';
                if (diffDias > 1 && diffDias < 30) return `Atualizado há ${diffDias} dias`;
                if (diffDias >= 30 && diffDias < 60) return 'Atualizado há 1 mês';
                if (diffDias >= 60 && diffDias < 365) return `Atualizado há ${Math.floor(diffDias / 30)} meses`;
                return `Aferido em ${d.toLocaleDateString('pt-BR')}`;
            } catch (e) {
                return dataStr;
            }
        },

        // Renderiza os chips de resumo no Card Clínico do Aluno
        async renderChipsAntropometria(containerId, alunoId) {
            const el = document.getElementById(containerId);
            if (!el) return;
            if (!alunoId) {
                el.innerHTML = '<span class="text-xs text-slate-500 italic">Selecione um aluno para visualizar as medidas mais recentes.</span>';
                return;
            }

            try {
                const medidas = await window.ApexCore.data.getMedidas(alunoId, 1);
                const m = (medidas && medidas.length > 0) ? medidas[0] : null;

                if (!m) {
                    el.innerHTML = `
                        <div class="flex flex-wrap items-center gap-1.5 text-xs">
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800" title="% Gordura Corporal Estimada">
                                <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">%BF:</span> <strong>--</strong>
                            </span>
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800" title="Cintura / Abdômen">
                                <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Cintura/Abd:</span> <strong>--</strong>
                            </span>
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800" title="Braço Direito e Esquerdo">
                                <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Braço (D/E):</span> <strong>--</strong>
                            </span>
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800" title="Coxa Direita e Esquerda">
                                <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Coxa (D/E):</span> <strong>--</strong>
                            </span>
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                                <i data-lucide="clock" class="w-3 h-3 text-amber-400"></i>
                                <span>Sem aferição</span>
                            </span>
                        </div>
                    `;
                    if (window.lucide) window.lucide.createIcons();
                    return;
                }

                const bf = (m.percentual_gordura != null && m.percentual_gordura !== '') ? `${parseFloat(m.percentual_gordura).toFixed(1)}%` : '--';
                const cintura = (m.cintura != null && m.cintura !== '') ? `${parseFloat(m.cintura).toFixed(1)}` : '--';
                const abdomen = (m.abdomen != null && m.abdomen !== '') ? `${parseFloat(m.abdomen).toFixed(1)}` : '--';
                const cinturaAbd = (cintura !== '--' || abdomen !== '--') ? `${cintura} / ${abdomen} cm` : '--';

                const bracoD = (m.braco_direito != null && m.braco_direito !== '') ? `${parseFloat(m.braco_direito).toFixed(1)}` : '--';
                const bracoE = (m.braco_esquerdo != null && m.braco_esquerdo !== '') ? `${parseFloat(m.braco_esquerdo).toFixed(1)}` : '--';
                const bracoStr = (bracoD !== '--' || bracoE !== '--') ? `${bracoD} / ${bracoE} cm` : '--';

                const coxaD = (m.coxa_direita != null && m.coxa_direita !== '') ? `${parseFloat(m.coxa_direita).toFixed(1)}` : '--';
                const coxaE = (m.coxa_esquerda != null && m.coxa_esquerda !== '') ? `${parseFloat(m.coxa_esquerda).toFixed(1)}` : '--';
                const coxaStr = (coxaD !== '--' || coxaE !== '--') ? `${coxaD} / ${coxaE} cm` : '--';

                const dataReg = m.data_registro || m.created_at || m.atualizado_em;
                const tempoRelativo = this.formatarTempoRelativo(dataReg);

                el.innerHTML = `
                    <div class="flex flex-wrap items-center gap-1.5 text-xs">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm" title="% Gordura Corporal Estimada (%BF)">
                            <span class="text-[9px] uppercase font-bold text-amber-400/80 tracking-wider">%BF:</span> <strong>${bf}</strong>
                        </span>
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm" title="Cintura e Abdômen (Risco Metabólico)">
                            <span class="text-[9px] uppercase font-bold text-emerald-400/80 tracking-wider">Cintura/Abd:</span> <strong>${cinturaAbd}</strong>
                        </span>
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 shadow-sm" title="Braço Direito e Esquerdo">
                            <span class="text-[9px] uppercase font-bold text-blue-400/80 tracking-wider">Braço (D/E):</span> <strong>${bracoStr}</strong>
                        </span>
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-sm" title="Coxa Direita e Esquerda">
                            <span class="text-[9px] uppercase font-bold text-purple-400/80 tracking-wider">Coxa (D/E):</span> <strong>${coxaStr}</strong>
                        </span>
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-sm" title="Data da última aferição">
                            <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i>
                            <span>${tempoRelativo}</span>
                        </span>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
            } catch (e) {
                console.error("Erro ao renderizar chips antropométricos:", e);
            }
        },

        // Renderiza a aba completa de medidas para o profissional (Personal ou Nutricionista)
        async renderAbaMedidasProfissional(containerId, alunoId, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const isNutri = (options.tipo === 'nutricionista');
            const corTema = isNutri ? 'lime' : 'blue';
            const hoje = new Date().toISOString().split('T')[0];
            const nomeProf = options.profissionalNome || window.nomeProfissionalLogado || (isNutri ? 'Nutricionista' : 'Personal Trainer');

            if (!alunoId) {
                container.innerHTML = `
                    <div class="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4">
                        <div class="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
                            <i data-lucide="user-x" class="w-8 h-8"></i>
                        </div>
                        <h2 class="text-lg font-bold text-white">Nenhum Aluno Selecionado</h2>
                        <p class="text-xs text-slate-400 max-w-md mx-auto">
                            Selecione um aluno no menu superior ou na lista de alunos vinculados para preencher ou visualizar o histórico de avaliações antropométricas.
                        </p>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            // Oculta estritamente a barra flutuante de ações de treino se estiver visível
            const stickyActions = document.getElementById('sticky-personal-actions');
            if (stickyActions) {
                stickyActions.classList.add('hidden');
                stickyActions.style.setProperty('display', 'none', 'important');
            }

            // Busca histórico completo de medidas do aluno
            const medidas = await window.ApexCore.data.getMedidas(alunoId, 50);
            const ultimas = (medidas && medidas.length > 0) ? medidas[0] : {};

            // Encontra dados reais do aluno no cache ou lista global
            const listaAlunos = window.listaAlunosCache || [];
            let aluno = listaAlunos.find(a => String(a.id) === String(alunoId));
            if (!aluno && window.perfisAlunosCache && window.perfisAlunosCache[alunoId]) {
                aluno = { id: alunoId, ...window.perfisAlunosCache[alunoId] };
            }
            if (!aluno) {
                aluno = { id: alunoId, nome: 'Aluno Selecionado' };
            }

            const dataUltimaAfericao = ultimas.data_registro || ultimas.created_at;
            const tempoRelativo = this.formatarTempoRelativo(dataUltimaAfericao);

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- Cabeçalho da Aba de Medidas -->
                    <div class="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-amber-500/30 transition-all space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-2xl bg-${corTema}-500/15 text-${corTema}-400 border border-${corTema}-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-${corTema}-500/10">
                                    <i data-lucide="ruler" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <h2 class="text-lg sm:text-xl font-black text-white">Avaliação Antropométrica & Circunferências Corporais</h2>
                                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-${corTema}-500/10 text-${corTema}-400 border border-${corTema}-500/25">
                                            ${isNutri ? 'Módulo Nutrição' : 'Módulo Personal'}
                                        </span>
                                    </div>
                                    <p class="text-xs text-slate-400 mt-0.5">
                                        Registro padronizado de perímetros corporais, composição bioimpedância e acompanhamento de assimetrias.
                                    </p>
                                </div>
                            </div>

                            <!-- Aluno Ativo: Seletor Rápido e Avatar Real -->
                            <div class="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-md min-w-[240px]">
                                <div class="relative w-11 h-11 rounded-xl overflow-hidden bg-${corTema}-500/20 text-${corTema}-300 flex items-center justify-center font-black text-sm shrink-0 border border-${corTema}-500/30">
                                    ${aluno.foto_perfil ? `
                                        <img src="${aluno.foto_perfil}" alt="${aluno.nome || 'Aluno'}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                                        <span class="hidden w-full h-full items-center justify-center font-bold">${(aluno.nome || 'A').charAt(0).toUpperCase()}</span>
                                    ` : `
                                        <span class="w-full h-full flex items-center justify-center font-bold">${(aluno.nome || 'A').charAt(0).toUpperCase()}</span>
                                    `}
                                </div>
                                <div class="leading-tight min-w-0 flex-1">
                                    <span class="text-[10px] uppercase font-black tracking-wider text-${corTema}-400 block mb-1 flex items-center gap-1">
                                        <i data-lucide="user-check" class="w-3 h-3"></i>Aluno Avaliado
                                    </span>
                                    <select id="filtro-medidas-aluno-select"
                                        onchange="if(typeof window.setActiveStudent === 'function') { window.setActiveStudent(this.value, 'medidas'); } else if(window.ApexEvolucao) { ApexEvolucao.renderAbaMedidasProfissional('${containerId}', this.value, { tipo: '${options.tipo || 'personal'}', profissionalNome: '${nomeProf}' }); }"
                                        class="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-${corTema}-500 cursor-pointer truncate">
                                        ${listaAlunos.map(a => `<option value="${a.id}" ${String(a.id) === String(alunoId) ? 'selected' : ''}>${a.nome || 'Aluno'} (${a.email || ''})</option>`).join('')}
                                        ${!listaAlunos.some(a => String(a.id) === String(alunoId)) ? `<option value="${alunoId}" selected>${aluno.nome || 'Aluno Selecionado'}</option>` : ''}
                                    </select>
                                    <span class="text-[10px] text-slate-400 block mt-1">${tempoRelativo}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Mini Pills de Resumo Rápido -->
                        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                            <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">% Gordura (%BF)</span>
                                <span class="text-sm font-black text-amber-400">${ultimas.percentual_gordura ? `${parseFloat(ultimas.percentual_gordura).toFixed(1)}%` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cintura</span>
                                <span class="text-sm font-black text-emerald-400">${ultimas.cintura ? `${parseFloat(ultimas.cintura).toFixed(1)} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Abdômen</span>
                                <span class="text-sm font-black text-teal-400">${ultimas.abdomen ? `${parseFloat(ultimas.abdomen).toFixed(1)} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Braço D / E</span>
                                <span class="text-sm font-black text-blue-400">${(ultimas.braco_direito || ultimas.braco_esquerdo) ? `${ultimas.braco_direito || '--'} / ${ultimas.braco_esquerdo || '--'} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Coxa D / E</span>
                                <span class="text-sm font-black text-purple-400">${(ultimas.coxa_direita || ultimas.coxa_esquerda) ? `${ultimas.coxa_direita || '--'} / ${ultimas.coxa_esquerda || '--'} cm` : '--'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- FORMULÁRIO COMPLETO DE PREENCHIMENTO DE MEDIDAS -->
                    <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-amber-500/30 transition-all space-y-6">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 class="text-base font-bold text-white flex items-center gap-2">
                                    <i data-lucide="edit-3" class="w-4 h-4 text-${corTema}-400"></i>
                                    Formulário de Aferição Física
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">Preencha todas as medidas em centímetros (cm) e peso em quilogramas (kg).</p>
                            </div>
                            <span class="text-xs text-slate-400 hidden sm:inline">Avaliador: <strong class="text-white">${nomeProf}</strong></span>
                        </div>

                        <form id="form-tab-medidas-${options.tipo}" onsubmit="ApexEvolucao.salvarMedidasAba(event, 'form-tab-medidas-${options.tipo}', '${alunoId}', { tipo: '${options.tipo}', nomeProf: '${nomeProf}' })" class="space-y-6">
                            <!-- Metadados da Aferição & Biometria Geral -->
                            <div class="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-${corTema}-400 flex items-center gap-1.5">
                                    <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                                    Dados Gerais da Avaliação
                                </h4>
                                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Data da Aferição *</label>
                                        <input type="date" name="data_registro" value="${hoje}" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Peso Atual (kg)</label>
                                        <input type="number" step="0.1" name="peso" value="${ultimas.peso || ''}" placeholder="Ex: 78.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">% Gordura Estimado (%BF)</label>
                                        <input type="number" step="0.1" name="percentual_gordura" value="${ultimas.percentual_gordura || ''}" placeholder="Ex: 14.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Massa Muscular Estimada (kg)</label>
                                        <input type="number" step="0.1" name="massa_muscular" value="${ultimas.massa_muscular || ''}" placeholder="Ex: 34.2" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                </div>
                            </div>

                            <!-- Tronco & Circunferências Centrais -->
                            <div class="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                    <i data-lucide="disc" class="w-3.5 h-3.5"></i>
                                    Tronco & Risco Metabólico (cm)
                                </h4>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Tórax / Peitoral (cm)</label>
                                        <input type="number" step="0.1" name="torax" value="${ultimas.torax || ''}" placeholder="Ex: 102.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Cintura (cm)</label>
                                        <input type="number" step="0.1" name="cintura" value="${ultimas.cintura || ''}" placeholder="Ex: 82.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Abdômen / Umbigo (cm)</label>
                                        <input type="number" step="0.1" name="abdomen" value="${ultimas.abdomen || ''}" placeholder="Ex: 86.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Quadril (cm)</label>
                                        <input type="number" step="0.1" name="quadril" value="${ultimas.quadril || ''}" placeholder="Ex: 98.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                </div>
                            </div>

                            <!-- Membros Superiores -->
                            <div class="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                                    <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                                    Membros Superiores (cm)
                                </h4>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Braço Direito (cm)</label>
                                        <input type="number" step="0.1" name="braco_direito" value="${ultimas.braco_direito || ''}" placeholder="Ex: 36.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Braço Esquerdo (cm)</label>
                                        <input type="number" step="0.1" name="braco_esquerdo" value="${ultimas.braco_esquerdo || ''}" placeholder="Ex: 36.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Antebraço Direito (cm)</label>
                                        <input type="number" step="0.1" name="antibraco_direito" value="${ultimas.antibraco_direito || ''}" placeholder="Ex: 29.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Antebraço Esquerdo (cm)</label>
                                        <input type="number" step="0.1" name="antibraco_esquerdo" value="${ultimas.antibraco_esquerdo || ''}" placeholder="Ex: 28.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                </div>
                            </div>

                            <!-- Membros Inferiores -->
                            <div class="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-4">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                    <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
                                    Membros Inferiores & Perímetros (cm)
                                </h4>
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Coxa Direita (cm)</label>
                                        <input type="number" step="0.1" name="coxa_direita" value="${ultimas.coxa_direita || ''}" placeholder="Ex: 58.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Coxa Esquerda (cm)</label>
                                        <input type="number" step="0.1" name="coxa_esquerda" value="${ultimas.coxa_esquerda || ''}" placeholder="Ex: 57.5" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Panturrilha Direita (cm)</label>
                                        <input type="number" step="0.1" name="panturrilha_direita" value="${ultimas.panturrilha_direita || ultimas.panturrilha || ''}" placeholder="Ex: 38.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                    <div>
                                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Panturrilha Esquerda (cm)</label>
                                        <input type="number" step="0.1" name="panturrilha_esquerda" value="${ultimas.panturrilha_esquerda || ultimas.panturrilha || ''}" placeholder="Ex: 38.0" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-${corTema}-500">
                                    </div>
                                </div>
                            </div>

                            <!-- Observações Clínicas -->
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Observações Clínicas & Conduta</label>
                                <textarea name="observacoes" rows="2" placeholder="Observações sobre retenção, simetria muscular, método de bioimpedância ou orientações..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-${corTema}-500">${ultimas.observacoes || ''}</textarea>
                            </div>

                            <!-- Botão Salvar -->
                            <div class="pt-2">
                                <button type="submit" id="btn-salvar-tab-medidas-${options.tipo}" class="w-full py-3.5 rounded-xl bg-${corTema}-500 hover:bg-${corTema}-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-${corTema}-500/20 transition-all cursor-pointer active:scale-95">
                                    <i data-lucide="check-circle" class="w-4 h-4"></i>
                                    <span>Salvar Avaliação Antropométrica</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- HISTÓRICO DE AFERIÇÕES DO ALUNO -->
                    <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 class="text-base font-bold text-white flex items-center gap-2">
                                    <i data-lucide="history" class="w-4 h-4 text-purple-400"></i>
                                    Histórico de Avaliações Antropométricas
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">Todas as aferições registradas para este aluno.</p>
                            </div>
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                ${medidas ? medidas.length : 0} registros
                            </span>
                        </div>

                        ${(!medidas || medidas.length === 0) ? `
                            <div class="text-center py-8 text-slate-500 text-xs italic">
                                Nenhuma avaliação registrada anteriormente. Preencha o formulário acima para criar o primeiro registro.
                            </div>
                        ` : `
                            <div class="space-y-3">
                                ${medidas.map((item, idx) => {
                                    const dFormat = item.data_registro ? item.data_registro.split('-').reverse().join('/') : (item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '--');
                                    const prof = item.profissional_nome || 'Profissional';
                                    const profTipo = item.profissional_tipo ? (item.profissional_tipo.includes('nutri') ? 'Nutricionista' : 'Personal') : '';

                                    return `
                                        <div class="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
                                            <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                                                <div class="flex items-center gap-2">
                                                    <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-white">#${medidas.length - idx}</span>
                                                    <strong class="text-xs text-white">${dFormat}</strong>
                                                    <span class="text-slate-500">•</span>
                                                    <span class="text-[11px] text-slate-400">Avaliador: <strong class="text-slate-200">${prof}</strong> ${profTipo ? `<span class="text-${corTema}-400">(${profTipo})</span>` : ''}</span>
                                                </div>
                                                <div class="text-[11px] text-slate-400 flex items-center gap-2">
                                                    ${item.peso ? `<span class="text-white font-bold">${item.peso} kg</span>` : ''}
                                                    ${item.percentual_gordura ? `<span class="text-amber-400 font-bold">${item.percentual_gordura}% BF</span>` : ''}
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
                                                <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                    <span class="text-[9px] uppercase font-bold text-slate-500 block">Braço (D/E)</span>
                                                    <span class="font-extrabold text-blue-300">${item.braco_direito || '--'} / ${item.braco_esquerdo || '--'} cm</span>
                                                </div>
                                                <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                    <span class="text-[9px] uppercase font-bold text-slate-500 block">Tórax</span>
                                                    <span class="font-extrabold text-slate-200">${item.torax ? item.torax + ' cm' : '--'}</span>
                                                </div>
                                                <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                    <span class="text-[9px] uppercase font-bold text-slate-500 block">Cintura</span>
                                                    <span class="font-extrabold text-emerald-300">${item.cintura ? item.cintura + ' cm' : '--'}</span>
                                                </div>
                                                <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                    <span class="text-[9px] uppercase font-bold text-slate-500 block">Abdômen</span>
                                                    <span class="font-extrabold text-teal-300">${item.abdomen ? item.abdomen + ' cm' : '--'}</span>
                                                </div>
                                                <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                    <span class="text-[9px] uppercase font-bold text-slate-500 block">Quadril</span>
                                                    <span class="font-extrabold text-purple-300">${item.quadril ? item.quadril + ' cm' : '--'}</span>
                                                </div>
                                                <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                    <span class="text-[9px] uppercase font-bold text-slate-500 block">Coxa (D/E)</span>
                                                    <span class="font-extrabold text-violet-300">${item.coxa_direita || '--'} / ${item.coxa_esquerda || '--'} cm</span>
                                                </div>
                                            </div>

                                            ${item.observacoes ? `
                                                <div class="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-xl border border-slate-800/50">
                                                    <strong class="text-slate-300">Obs:</strong> ${item.observacoes}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;

            if (window.lucide) window.lucide.createIcons();
        },

        // Salvar formulário da aba
        async salvarMedidasAba(e, formId, alunoId, options = {}) {
            e.preventDefault();
            const form = document.getElementById(formId);
            if (!form || !alunoId) return;

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(form);
            const dados = {
                data_registro: formData.get('data_registro') || new Date().toISOString().split('T')[0],
                peso: formData.get('peso') || null,
                percentual_gordura: formData.get('percentual_gordura') || null,
                massa_muscular: formData.get('massa_muscular') || null,
                torax: formData.get('torax') || null,
                cintura: formData.get('cintura') || null,
                abdomen: formData.get('abdomen') || null,
                quadril: formData.get('quadril') || null,
                braco_direito: formData.get('braco_direito') || null,
                braco_esquerdo: formData.get('braco_esquerdo') || null,
                antibraco_direito: formData.get('antibraco_direito') || null,
                antibraco_esquerdo: formData.get('antibraco_esquerdo') || null,
                coxa_direita: formData.get('coxa_direita') || null,
                coxa_esquerda: formData.get('coxa_esquerda') || null,
                panturrilha_direita: formData.get('panturrilha_direita') || null,
                panturrilha_esquerda: formData.get('panturrilha_esquerda') || null,
                panturrilha: formData.get('panturrilha_direita') || null,
                observacoes: formData.get('observacoes') || '',
                profissional_nome: options.nomeProf || window.nomeProfissionalLogado || 'Profissional',
                profissional_tipo: options.tipo || 'profissional'
            };

            try {
                await window.ApexCore.data.saveMedidas(dados, alunoId);
                if (window.ApexCore && window.ApexCore.sound) window.ApexCore.sound.playSuccess();

                if (window.showToast) {
                    window.showToast('Avaliação Salva com Sucesso! 📏', 'As medidas antropométricas foram gravadas e sincronizadas.', 'success');
                }

                // Recarrega a aba
                if (options.tipo === 'personal') {
                    await this.renderAbaMedidasProfissional('conteudo-tab-personal-medidas', alunoId, options);
                    if (typeof atualizarCardAlunoClinico === 'function') atualizarCardAlunoClinico(alunoId);
                } else if (options.tipo === 'nutricionista') {
                    await this.renderAbaMedidasProfissional('conteudo-tab-nutri-medidas', alunoId, options);
                    if (typeof atualizarCardAlunoClinico === 'function') atualizarCardAlunoClinico(alunoId);
                }
            } catch (err) {
                console.error("Erro ao salvar medidas na aba:", err);
                if (window.showToast) window.showToast('Erro ao Salvar', 'Não foi possível salvar as medidas.', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        },

        // Renderiza a aba de medidas para o aluno no dashboard.html
        async renderAbaMedidasAluno(containerId, alunoId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!alunoId) {
                container.innerHTML = `
                    <div class="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-slate-400">
                        Carregando informações biométricas do aluno...
                    </div>
                `;
                return;
            }

            const medidas = await window.ApexCore.data.getMedidas(alunoId, 50);
            const ultimas = (medidas && medidas.length > 0) ? medidas[0] : null;

            if (!ultimas) {
                container.innerHTML = `
                    <div class="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 shadow-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-amber-500/30 transition-all text-center space-y-4">
                        <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                            <i data-lucide="ruler" class="w-8 h-8"></i>
                        </div>
                        <h2 class="text-xl font-bold text-white">Nenhuma Avaliação Antropométrica Cadastrada</h2>
                        <p class="text-xs text-slate-400 max-w-md mx-auto">
                            Suas medidas corporais e percentual de gordura são preenchidos e validados diretamente pelo seu Personal Trainer ou Nutricionista durante suas avaliações físicas.
                        </p>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            const dFormat = ultimas.data_registro ? ultimas.data_registro.split('-').reverse().join('/') : (ultimas.created_at ? new Date(ultimas.created_at).toLocaleDateString('pt-BR') : '--');
            const prof = ultimas.profissional_nome || 'Profissional Responsável';
            const profTipo = ultimas.profissional_tipo ? (ultimas.profissional_tipo.includes('nutri') ? 'Nutricionista' : 'Personal Trainer') : 'Avaliador';
            const tempoRelativo = this.formatarTempoRelativo(ultimas.data_registro || ultimas.created_at);

            // Relação Cintura-Quadril (RCQ)
            let rcqHtml = '';
            if (ultimas.cintura && ultimas.quadril) {
                const rcq = (parseFloat(ultimas.cintura) / parseFloat(ultimas.quadril)).toFixed(2);
                let rcqClass = 'Baixo Risco';
                let rcqCor = 'text-emerald-400';
                if (rcq > 0.95) {
                    rcqClass = 'Risco Elevado';
                    rcqCor = 'text-amber-400';
                }
                rcqHtml = `
                    <div class="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl text-center">
                        <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Relação Cintura/Quadril (RCQ)</span>
                        <div class="flex items-center justify-center gap-1.5">
                            <span class="text-base font-black text-white">${rcq}</span>
                            <span class="text-[10px] font-bold ${rcqCor}">(${rcqClass})</span>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="space-y-6">
                    <!-- Banner de Destaque da Avaliação Mais Recente -->
                    <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-amber-500/30 transition-all space-y-5">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                            <div>
                                <span class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1">
                                    <i data-lucide="shield-check" class="w-4 h-4"></i>Avaliação Oficial Auditada
                                </span>
                                <h2 class="text-xl font-bold text-white">Minhas Medidas Corporais & Antropometria</h2>
                                <p class="text-xs text-slate-400">Circunferências físicas e percentual de gordura validados pela sua equipe técnica.</p>
                            </div>

                            <div class="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/25 px-4 py-2 rounded-2xl text-xs self-start sm:self-center">
                                <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                    <i data-lucide="user-check" class="w-4 h-4"></i>
                                </div>
                                <div class="leading-tight">
                                    <span class="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">Avaliador Responsável</span>
                                    <span class="text-xs text-white font-medium">
                                        <strong class="text-blue-300 font-bold">${prof}</strong> <span class="text-slate-400">(${profTipo})</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Data e Tempo Relativo -->
                        <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                            <div class="flex items-center gap-2 text-slate-300">
                                <i data-lucide="calendar" class="w-4 h-4 text-blue-400"></i>
                                <span>Aferido em <strong class="text-white">${dFormat}</strong></span>
                            </div>
                            <div class="flex items-center gap-1.5 text-amber-400 font-semibold">
                                <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                                <span>${tempoRelativo}</span>
                            </div>
                        </div>

                        <!-- 6 Cards de Destaque -->
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">% Gordura (%BF)</span>
                                <span class="text-base font-black text-amber-400">${ultimas.percentual_gordura ? `${parseFloat(ultimas.percentual_gordura).toFixed(1)}%` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Braço D / E</span>
                                <span class="text-base font-black text-blue-400">${(ultimas.braco_direito || ultimas.braco_esquerdo) ? `${ultimas.braco_direito || '--'} / ${ultimas.braco_esquerdo || '--'} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cintura</span>
                                <span class="text-base font-black text-emerald-400">${ultimas.cintura ? `${parseFloat(ultimas.cintura).toFixed(1)} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Abdômen</span>
                                <span class="text-base font-black text-teal-400">${ultimas.abdomen ? `${parseFloat(ultimas.abdomen).toFixed(1)} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Quadril</span>
                                <span class="text-base font-black text-purple-400">${ultimas.quadril ? `${parseFloat(ultimas.quadril).toFixed(1)} cm` : '--'}</span>
                            </div>
                            <div class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                                <span class="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Coxa D / E</span>
                                <span class="text-base font-black text-violet-400">${(ultimas.coxa_direita || ultimas.coxa_esquerda) ? `${ultimas.coxa_direita || '--'} / ${ultimas.coxa_esquerda || '--'} cm` : '--'}</span>
                            </div>
                        </div>

                        ${rcqHtml}

                        ${ultimas.observacoes ? `
                            <div class="p-3.5 bg-slate-950/50 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                                <strong class="text-blue-400 block mb-0.5 font-bold">Observações do Profissional:</strong>
                                ${ultimas.observacoes}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Histórico Completo de Medidas do Aluno -->
                    <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 class="text-base font-bold text-white flex items-center gap-2">
                                    <i data-lucide="history" class="w-4 h-4 text-purple-400"></i>
                                    Histórico de Todas as Aferições
                                </h3>
                                <p class="text-xs text-slate-400 mt-0.5">Acompanhe sua evolução ao longo das consultas e reavaliações.</p>
                            </div>
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                ${medidas.length} registros
                            </span>
                        </div>

                        <div class="space-y-3">
                            ${medidas.map((item, idx) => {
                                const dataAfer = item.data_registro ? item.data_registro.split('-').reverse().join('/') : (item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '--');
                                const itemProf = item.profissional_nome || 'Profissional';
                                const itemProfTipo = item.profissional_tipo ? (item.profissional_tipo.includes('nutri') ? 'Nutricionista' : 'Personal') : '';

                                return `
                                    <div class="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
                                        <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                                            <div class="flex items-center gap-2">
                                                <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-white">#${medidas.length - idx}</span>
                                                <strong class="text-xs text-white">${dataAfer}</strong>
                                                <span class="text-slate-500">•</span>
                                                <span class="text-[11px] text-slate-400">${itemProf} <span class="text-blue-400">(${itemProfTipo})</span></span>
                                            </div>
                                            <div class="text-[11px] text-slate-400 flex items-center gap-2">
                                                ${item.peso ? `<span class="text-white font-bold">${item.peso} kg</span>` : ''}
                                                ${item.percentual_gordura ? `<span class="text-amber-400 font-bold">${item.percentual_gordura}% BF</span>` : ''}
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
                                            <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                <span class="text-[9px] uppercase font-bold text-slate-500 block">Braço D/E</span>
                                                <span class="font-extrabold text-blue-300">${item.braco_direito || '--'} / ${item.braco_esquerdo || '--'} cm</span>
                                            </div>
                                            <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                <span class="text-[9px] uppercase font-bold text-slate-500 block">Tórax</span>
                                                <span class="font-extrabold text-slate-200">${item.torax ? item.torax + ' cm' : '--'}</span>
                                            </div>
                                            <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                <span class="text-[9px] uppercase font-bold text-slate-500 block">Cintura</span>
                                                <span class="font-extrabold text-emerald-300">${item.cintura ? item.cintura + ' cm' : '--'}</span>
                                            </div>
                                            <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                <span class="text-[9px] uppercase font-bold text-slate-500 block">Abdômen</span>
                                                <span class="font-extrabold text-teal-300">${item.abdomen ? item.abdomen + ' cm' : '--'}</span>
                                            </div>
                                            <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                <span class="text-[9px] uppercase font-bold text-slate-500 block">Quadril</span>
                                                <span class="font-extrabold text-purple-300">${item.quadril ? item.quadril + ' cm' : '--'}</span>
                                            </div>
                                            <div class="bg-slate-900/60 p-2 rounded-xl text-center">
                                                <span class="text-[9px] uppercase font-bold text-slate-500 block">Coxa D/E</span>
                                                <span class="font-extrabold text-violet-300">${item.coxa_direita || '--'} / ${item.coxa_esquerda || '--'} cm</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;

            if (window.lucide) window.lucide.createIcons();
        }
    };

    window.ApexEvolucao = EvolutionTracker;
})(window);
