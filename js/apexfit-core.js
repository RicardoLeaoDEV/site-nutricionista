/**
 * ApexFit SaaS - Core Platform Engine & Unified Data Layer
 * Handles:
 * - Supabase Authentication & Role-Based Access Control (Admin, Personal, Nutri, Aluno)
 * - Dual-Persistence Engine (Native Supabase Tables with seamless fallback to Mensagens JSON store & LocalStorage)
 * - Notification Center & Real-time Alerting
 * - Gamification & XP System (+10 Treino, +10 Check-in, +5 Refeição, +5 Água, +10 Foto)
 * - Sound Synthesis via Web Audio API (Rest Timer & Achievement chimes)
 */

(function (window) {
    'use strict';

    const SUPABASE_URL = 'https://dnlqkozlaqizhqsexcei.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubHFrb3psYXFpemhxc2V4Y2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODk3MjksImV4cCI6MjEwNTc2NTcyOX0.-YEYBVHYcIBoe5taFgcC1jO2AbIYdnfI_srwif9dd7I';
    const ADMIN_UID = '04fb83ed-ec6b-4a56-9993-e99f32ededee';

    // Inicializa cliente Supabase se ainda não estiver disponível
    let supabaseClient = window.supabaseClient;
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
    }

    // Cache de presença das tabelas nativas no Supabase para evitar 404s repetidos
    const tableCache = {};

    // --------------------------------------------------------------------------
    // 1. SOUND SYNTHESIS ENGINE (Sem arquivos externos, 100% confiável)
    // --------------------------------------------------------------------------
    const soundEngine = {
        ctx: null,
        init() {
            if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
        },
        playSuccess() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } catch (e) { }
        },
        playTimerDone() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                // Tríade ascendente revigorante (Descanso finalizado!)
                const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                freqs.forEach((f, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + (idx * 0.09);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, t);
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.28);
                });
            } catch (e) { }
        },
        playLevelUp() {
            try {
                this.init();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const freqs = [440, 554.37, 659.25, 880];
                freqs.forEach((f, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + (idx * 0.12);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, t);
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.4);
                });
            } catch (e) { }
        }
    };

    // --------------------------------------------------------------------------
    // 2. DUAL-PERSISTENCE DATA ACCESS LAYER
    // --------------------------------------------------------------------------
    const ApexData = {
        async isTableReady(tableName) {
            if (tableCache[tableName] !== undefined) return tableCache[tableName];
            try {
                const { error } = await supabaseClient.from(tableName).select('id').limit(1);
                tableCache[tableName] = !error;
                return tableCache[tableName];
            } catch (e) {
                tableCache[tableName] = false;
                return false;
            }
        },

        // Salva dados no banco ou no store resiliente 'mensagens' (remetente: sistema_<canal>)
        async saveRecord(tableName, fallbackChannel, record, alunoId) {
            const hasTable = await this.isTableReady(tableName);
            if (hasTable) {
                try {
                    const { data, error } = await supabaseClient.from(tableName).insert([record]).select();
                    if (!error) return { success: true, data: data?.[0], source: 'table' };
                } catch (e) {
                    console.warn(`[ApexData] Falha ao gravar em ${tableName}, usando fallback`, e);
                }
            }

            // Fallback resiliente: grava na tabela mensagens existente como registro JSON
            if (alunoId && fallbackChannel) {
                try {
                    const payload = {
                        _apex_type: fallbackChannel,
                        _timestamp: new Date().toISOString(),
                        ...record
                    };
                    const { data, error } = await supabaseClient.from('mensagens').insert([{
                        aluno_id: alunoId,
                        remetente: `sistema_${fallbackChannel}`,
                        mensagem: JSON.stringify(payload),
                        lida: true
                    }]).select();

                    // Salva também em localStorage para cache ultra-rápido offline
                    try {
                        const localKey = `apex_${fallbackChannel}_${alunoId}`;
                        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
                        existing.unshift(payload);
                        localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 100)));
                    } catch (errLocal) { }

                    return { success: !error, data: payload, source: 'fallback_mensagens' };
                } catch (e) {
                    console.error('[ApexData] Erro no fallback de mensagens:', e);
                }
            }

            return { success: false };
        },

        // Carrega registros com ordenação e limite
        async getRecords(tableName, fallbackChannel, alunoId, limit = 50) {
            const hasTable = await this.isTableReady(tableName);
            if (hasTable) {
                try {
                    let query = supabaseClient.from(tableName).select('*').order('created_at', { ascending: false }).limit(limit);
                    if (alunoId) query = query.eq('aluno_id', alunoId);
                    const { data, error } = await query;
                    if (!error && data && data.length > 0) return data;
                } catch (e) { }
            }

            // Fallback: busca na tabela mensagens
            if (fallbackChannel) {
                try {
                    let query = supabaseClient
                        .from('mensagens')
                        .select('id, aluno_id, mensagem, created_at')
                        .eq('remetente', `sistema_${fallbackChannel}`)
                        .order('created_at', { ascending: false })
                        .limit(limit);

                    if (alunoId) {
                        query = query.eq('aluno_id', alunoId);
                    }

                    const { data, error } = await query;

                    if (!error && data && data.length > 0) {
                        return data.map(m => {
                            try {
                                const parsed = JSON.parse(m.mensagem);
                                return { id: m.id, aluno_id: m.aluno_id, created_at: m.created_at, ...parsed };
                            } catch (e) {
                                return null;
                            }
                        }).filter(Boolean);
                    }
                } catch (e) { }

                // Fallback do localStorage se estiver offline
                try {
                    if (alunoId) {
                        const localKey = `apex_${fallbackChannel}_${alunoId}`;
                        return JSON.parse(localStorage.getItem(localKey) || '[]');
                    } else {
                        const prefix = `apex_${fallbackChannel}_`;
                        const all = [];
                        for (let i = 0; i < localStorage.length; i++) {
                            const k = localStorage.key(i);
                            if (k && k.startsWith(prefix)) {
                                try {
                                    const items = JSON.parse(localStorage.getItem(k) || '[]');
                                    all.push(...items);
                                } catch (e) { }
                            }
                        }
                        return all.sort((a, b) => new Date(b._timestamp || b.created_at || 0) - new Date(a._timestamp || a.created_at || 0)).slice(0, limit);
                    }
                } catch (e) {
                    return [];
                }
            }

            return [];
        },

        // ----------------------------------------------------------------------
        // CHECK-INS SEMANAIS
        // ----------------------------------------------------------------------
        async saveCheckin(checkinData, alunoId) {
            // Calcula indicador automático (🟢 🟡 🔴)
            let indicador = 'verde';
            let alertas = 0;
            if (checkinData.adesao_dieta === 'fora do plano' || checkinData.dificuldade_dieta === 'muita') alertas += 2;
            if (checkinData.qualidade_sono === 'pessimo' || checkinData.nivel_estresse === 'alto') alertas += 1;
            if (checkinData.treinos_realizados < 2) alertas += 1;
            if (checkinData.nivel_fome === 'descontrolada') alertas += 1;

            if (alertas >= 3) indicador = 'vermelho';
            else if (alertas >= 1) indicador = 'amarelo';

            const record = {
                aluno_id: alunoId,
                peso_atual: parseFloat(checkinData.peso_atual) || null,
                adesao_dieta: checkinData.adesao_dieta || '100% no plano',
                treinos_realizados: parseInt(checkinData.treinos_realizados) || 0,
                qualidade_sono: checkinData.qualidade_sono || 'bom',
                nivel_energia: checkinData.nivel_energia || 'alto',
                nivel_fome: checkinData.nivel_fome || 'normal',
                nivel_estresse: checkinData.nivel_estresse || 'baixo',
                dificuldade_dieta: checkinData.dificuldade_dieta || 'nenhuma',
                observacoes: checkinData.observacoes || '',
                status_indicador: indicador,
                fotos: checkinData.fotos || []
            };

            const result = await this.saveRecord('checkins', 'checkin', record, alunoId);

            // Recompensa de Gamificação: +10 XP pelo check-in!
            await this.addXP(alunoId, 10, 'Check-in Semanal Enviado! 📋');

            // Cria notificação para os profissionais
            await this.createNotification({
                usuario_id: ADMIN_UID,
                titulo: 'Novo Check-in Semanal Recebido!',
                mensagem: `Aluno enviou o check-in da semana. Status: ${indicador === 'verde' ? '🟢 Tudo Certo' : (indicador === 'amarelo' ? '🟡 Atenção' : '🔴 Precisa de Atenção')}`,
                tipo: 'checkin',
                link: 'admin.html#secao-checkins'
            });

            return { ...result, indicador };
        },

        async getCheckins(alunoId, limit = 20) {
            return await this.getRecords('checkins', 'checkin', alunoId, limit);
        },

        // ----------------------------------------------------------------------
        // MEDIDAS CORPORAIS
        // ----------------------------------------------------------------------
        async saveMedidas(medidasData, alunoId) {
            const record = {
                aluno_id: alunoId,
                data_registro: medidasData.data_registro || new Date().toISOString().split('T')[0],
                peso: parseFloat(medidasData.peso) || null,
                braco_direito: parseFloat(medidasData.braco_direito) || null,
                braco_esquerdo: parseFloat(medidasData.braco_esquerdo) || null,
                torax: parseFloat(medidasData.torax) || null,
                cintura: parseFloat(medidasData.cintura) || null,
                abdomen: parseFloat(medidasData.abdomen) || null,
                quadril: parseFloat(medidasData.quadril) || null,
                coxa_direita: parseFloat(medidasData.coxa_direita) || null,
                coxa_esquerda: parseFloat(medidasData.coxa_esquerda) || null,
                panturrilha: parseFloat(medidasData.panturrilha) || null,
                percentual_gordura: parseFloat(medidasData.percentual_gordura) || null,
                massa_muscular: parseFloat(medidasData.massa_muscular) || null,
                observacoes: medidasData.observacoes || ''
            };

            const result = await this.saveRecord('medidas', 'medidas', record, alunoId);
            await this.addXP(alunoId, 10, 'Medidas Atualizadas! 📏');
            return result;
        },

        async getMedidas(alunoId, limit = 20) {
            return await this.getRecords('medidas', 'medidas', alunoId, limit);
        },

        // ----------------------------------------------------------------------
        // EXECUÇÃO DE SÉRIES DE TREINO (Série 1, 2, 3, 4 + Carga + Reps)
        // ----------------------------------------------------------------------
        async saveSerieLog(serieData, alunoId) {
            const record = {
                aluno_id: alunoId,
                exercicio_id: serieData.exercicio_id || null,
                treino_nome: serieData.treino_nome || '',
                exercicio_nome: serieData.exercicio_nome || '',
                serie_numero: parseInt(serieData.serie_numero) || 1,
                repeticoes_feitas: parseInt(serieData.repeticoes_feitas) || null,
                carga_utilizada: parseFloat(serieData.carga_utilizada) || null,
                descanso_segundos: parseInt(serieData.descanso_segundos) || 60,
                concluido: true,
                data_execucao: new Date().toISOString().split('T')[0]
            };

            const result = await this.saveRecord('treino_series_logs', 'treino_serie', record, alunoId);
            return result;
        },

        // ----------------------------------------------------------------------
        // HÁBITOS DIÁRIOS & STREAK (🔥)
        // ----------------------------------------------------------------------
        async toggleHabito(habitoTitulo, alunoId, concluido, dataStr) {
            const hoje = dataStr || new Date().toISOString().split('T')[0];
            const record = {
                aluno_id: alunoId,
                habito_titulo: habitoTitulo,
                concluido: Boolean(concluido),
                data_registro: hoje
            };

            const key = `apex_habitos_${alunoId}_${hoje}`;
            let hojeLogs = {};
            try { hojeLogs = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { }
            hojeLogs[habitoTitulo] = concluido;
            localStorage.setItem(key, JSON.stringify(hojeLogs));

            // Salva de forma resiliente
            await this.saveRecord('habitos_logs', 'habito_log', record, alunoId);

            if (concluido) {
                await this.addXP(alunoId, 2, `Hábito cumprido: ${habitoTitulo} ✅`);
            }

            return hojeLogs;
        },

        getHabitosDoDia(alunoId, dataStr) {
            const hoje = dataStr || new Date().toISOString().split('T')[0];
            const key = `apex_habitos_${alunoId}_${hoje}`;
            try {
                return JSON.parse(localStorage.getItem(key) || '{}');
            } catch (e) {
                return {};
            }
        },

        // ----------------------------------------------------------------------
        // RASTREADOR DE HIDRATAÇÃO (+250ml, +500ml, +1L)
        // ----------------------------------------------------------------------
        async addAgua(mlAdicionar, alunoId, metaMl = 3000) {
            const hoje = new Date().toISOString().split('T')[0];
            const key = `apex_agua_${alunoId}_${hoje}`;
            let atual = parseInt(localStorage.getItem(key) || '0', 10);
            const anterior = atual;
            atual = Math.max(0, atual + mlAdicionar);
            localStorage.setItem(key, String(atual));

            const record = {
                aluno_id: alunoId,
                data_registro: hoje,
                total_ml: atual,
                meta_ml: metaMl
            };

            await this.saveRecord('hidratacao_logs', 'hidratacao', record, alunoId);

            // Bônus de XP ao atingir a meta
            if (anterior < metaMl && atual >= metaMl) {
                await this.addXP(alunoId, 5, 'Meta de Hidratação Atingida! 💧');
                soundEngine.playLevelUp();
            }

            return { totalMl: atual, metaMl, pct: Math.min(100, Math.round((atual / metaMl) * 100)) };
        },

        getAguaHoje(alunoId, metaMl = 3000) {
            const hoje = new Date().toISOString().split('T')[0];
            const key = `apex_agua_${alunoId}_${hoje}`;
            const totalMl = parseInt(localStorage.getItem(key) || '0', 10);
            return { totalMl, metaMl, pct: Math.min(100, Math.round((totalMl / metaMl) * 100)) };
        },

        // ----------------------------------------------------------------------
        // GAMIFICAÇÃO & XP
        // ----------------------------------------------------------------------
        async addXP(alunoId, pontos, motivo) {
            if (!alunoId) return;
            const key = `apex_gamificacao_${alunoId}`;
            let dados = { xp: 0, nivel: 1, conquistas: [] };
            try {
                dados = { ...dados, ...JSON.parse(localStorage.getItem(key) || '{}') };
            } catch (e) { }

            const xpAnterior = dados.xp;
            dados.xp += pontos;
            const novoNivel = Math.floor(dados.xp / 100) + 1;
            const subiuNivel = novoNivel > dados.nivel;
            dados.nivel = novoNivel;

            localStorage.setItem(key, JSON.stringify(dados));

            // Salva no banco
            await this.saveRecord('gamificacao_logs', 'gamificacao', {
                aluno_id: alunoId,
                xp_ganho: pontos,
                xp_total: dados.xp,
                nivel: dados.nivel,
                motivo: motivo
            }, alunoId);

            if (subiuNivel) {
                soundEngine.playLevelUp();
                if (window.showToast) {
                    window.showToast('NÍVEL SUPERADO! 🏆', `Parabéns! Você alcançou o Nível ${novoNivel}!`, 'success');
                }
            } else if (pontos > 0 && window.showToast) {
                window.showToast(`+${pontos} XP Ganho! ⭐`, motivo || 'Você ganhou pontos de evolução!', 'info');
            }

            return dados;
        },

        getGamificacao(alunoId) {
            const key = `apex_gamificacao_${alunoId}`;
            try {
                return JSON.parse(localStorage.getItem(key) || '{"xp":0,"nivel":1,"conquistas":[]}');
            } catch (e) {
                return { xp: 0, nivel: 1, conquistas: [] };
            }
        },

        // ----------------------------------------------------------------------
        // NOTIFICAÇÕES
        // ----------------------------------------------------------------------
        async createNotification({ usuario_id, titulo, mensagem, tipo = 'info', link = null }) {
            const record = {
                usuario_id: usuario_id || ADMIN_UID,
                titulo,
                mensagem,
                tipo,
                link,
                lida: false
            };

            await this.saveRecord('notificacoes', 'notificacao', record, usuario_id);

            // Atualiza badge em tempo real se a função global existir
            if (window.ApexCore && window.ApexCore.atualizarBadgesNotificacao) {
                window.ApexCore.atualizarBadgesNotificacao();
            }

            return record;
        },

        async getNotificacoes(usuarioId, limit = 25) {
            return await this.getRecords('notificacoes', 'notificacao', usuarioId, limit);
        }
    };

    // --------------------------------------------------------------------------
    // 3. AUTH & ROLE ROUTING
    // --------------------------------------------------------------------------
    const ApexAuth = {
        ADMIN_UID,

        async getSession() {
            if (!supabaseClient) return null;
            const { data: { session } } = await supabaseClient.auth.getSession();
            return session;
        },

        getUserRole(session) {
            if (!session || !session.user) return 'visitante';
            if (session.user.id === ADMIN_UID) return 'admin';
            const meta = session.user.user_metadata || {};
            if (meta.papel) return meta.papel;
            return 'aluno';
        },

        // Injeta a Barra de Troca Rápida de Papel para Profissionais/Admin
        injectRoleSwitcher() {
            this.getSession().then(session => {
                if (!session) return;
                const role = this.getUserRole(session);
                // Se for admin ou profissional, injeta atalhos rápidos de navegação entre portais
                if (role === 'admin' || role === 'personal' || role === 'nutricionista') {
                    const existing = document.getElementById('apex-role-switcher');
                    if (existing) return;

                    const switcher = document.createElement('div');
                    switcher.id = 'apex-role-switcher';
                    switcher.className = 'fixed bottom-4 left-4 z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 backdrop-blur-xl text-xs font-semibold';
                    switcher.innerHTML = `
                        <span class="text-[10px] text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">Modo:</span>
                        <a href="admin.html" title="Espaço do Nutricionista" class="px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${window.location.pathname.includes('admin') ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
                            <i data-lucide="apple" class="w-3.5 h-3.5"></i>
                            <span class="hidden sm:inline">Nutricionista</span>
                        </a>
                        <a href="personal.html" title="Espaço do Personal Trainer" class="px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${window.location.pathname.includes('personal') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
                            <i data-lucide="dumbbell" class="w-3.5 h-3.5"></i>
                            <span class="hidden sm:inline">Personal</span>
                        </a>
                        <a href="dashboard.html" title="Visão do Aluno" class="px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${window.location.pathname.includes('dashboard') ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
                            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                            <span class="hidden sm:inline">Ver Aluno</span>
                        </a>
                    `;
                    document.body.appendChild(switcher);
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        }
    };

    // Exporta para o escopo global
    window.ApexCore = {
        sound: soundEngine,
        data: ApexData,
        auth: ApexAuth,
        supabaseClient
    };

    // Auto-inicialização quando a página estiver carregada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ApexAuth.injectRoleSwitcher());
    } else {
        ApexAuth.injectRoleSwitcher();
    }

})(window);
