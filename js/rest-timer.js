/**
 * ApexFit SaaS - Cronômetro de Descanso Inteligente & Rastreador de Séries
 * Funcionalidades:
 * - Cronômetro flutuante responsivo (30s, 45s, 60s, 90s, 120s e personalizado)
 * - Botões: Iniciar, Pausar, Reiniciar, +15s, -15s
 * - Disparo sonoro (Web Audio API) e notificação visual ao zerar
 * - Suporte a execução de séries (Série 1, Série 2, Série 3, Série 4) com carga e reps
 */

(function (window) {
    'use strict';

    const RestTimer = {
        tempoInicial: 60,
        tempoRestante: 60,
        intervalId: null,
        rodando: false,
        autoStart: true,

        init() {
            this.injetarWidgetHTML();
        },

        injetarWidgetHTML() {
            let widget = document.getElementById('apex-rest-timer-widget');
            if (widget) return;

            widget = document.createElement('div');
            widget.id = 'apex-rest-timer-widget';
            widget.className = 'hidden fixed bottom-24 right-4 sm:bottom-24 sm:right-6 lg:bottom-6 lg:right-6 z-40 transform translate-y-32 opacity-0 pointer-events-none transition-all duration-300 w-[calc(100vw-2rem)] max-w-xs sm:w-80';
            widget.innerHTML = `
                <div class="glass-panel bg-slate-900/95 border border-orange-500/40 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-slate-100 space-y-3">
                    <!-- Topo do Cronômetro -->
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                <i data-lucide="timer" class="w-4 h-4"></i>
                            </div>
                            <span class="text-xs font-black tracking-wider uppercase text-orange-400">Tempo de Descanso</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <button type="button" onclick="ApexTimer.minimizar()" title="Minimizar" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                                <i data-lucide="minus" class="w-3.5 h-3.5"></i>
                            </button>
                            <button type="button" onclick="ApexTimer.fechar()" title="Fechar" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                                <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Display Central do Tempo -->
                    <div class="flex items-center justify-center py-2 relative">
                        <div class="text-center">
                            <div id="apex-timer-display" class="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">01:00</div>
                            <span id="apex-timer-status" class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pronto</span>
                        </div>
                    </div>

                    <!-- Presets Rápidos -->
                    <div class="flex items-center justify-between gap-1 text-[11px] font-bold">
                        ${[30, 45, 60, 90, 120].map(s => `
                            <button type="button" onclick="ApexTimer.definirTempo(${s})" class="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 text-slate-300 border border-slate-700 transition-colors text-center cursor-pointer">
                                ${s}s
                            </button>
                        `).join('')}
                    </div>

                    <!-- Controles Principais -->
                    <div class="flex items-center gap-2 pt-1">
                        <button type="button" onclick="ApexTimer.ajustar(-15)" title="-15 segundos" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer font-bold text-xs">
                            -15s
                        </button>

                        <button type="button" id="btn-timer-toggle" onclick="ApexTimer.toggle()" class="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer">
                            <i data-lucide="play" id="icone-timer-toggle" class="w-4 h-4 fill-current"></i>
                            <span id="texto-timer-toggle">Iniciar</span>
                        </button>

                        <button type="button" onclick="ApexTimer.reiniciar()" title="Reiniciar" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer">
                            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                        </button>

                        <button type="button" onclick="ApexTimer.ajustar(15)" title="+15 segundos" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer font-bold text-xs">
                            +15s
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(widget);
            if (window.lucide) window.lucide.createIcons();
        },

        mostrar(segundos = null) {
            this.injetarWidgetHTML();
            if (segundos) {
                this.tempoInicial = parseInt(segundos) || 60;
                this.tempoRestante = this.tempoInicial;
            }
            this.atualizarDisplay();
            const widget = document.getElementById('apex-rest-timer-widget');
            if (widget) {
                widget.classList.remove('hidden', 'translate-y-32', 'opacity-0', 'pointer-events-none');
                widget.classList.add('translate-y-0', 'opacity-100');
            }
        },

        fechar() {
            this.pausar();
            const widget = document.getElementById('apex-rest-timer-widget');
            if (widget) {
                widget.classList.add('hidden', 'translate-y-32', 'opacity-0', 'pointer-events-none');
                widget.classList.remove('translate-y-0', 'opacity-100');
            }
        },

        minimizar() {
            this.fechar();
        },

        definirTempo(segundos) {
            this.pausar();
            this.tempoInicial = segundos;
            this.tempoRestante = segundos;
            this.atualizarDisplay();
            this.iniciar();
        },

        ajustar(deltaSegundos) {
            this.tempoRestante = Math.max(5, this.tempoRestante + deltaSegundos);
            this.atualizarDisplay();
        },

        toggle() {
            if (this.rodando) this.pausar();
            else this.iniciar();
        },

        iniciar() {
            if (this.rodando) return;
            if (this.tempoRestante <= 0) this.tempoRestante = this.tempoInicial;

            this.rodando = true;
            this.atualizarBotao();
            const statusEl = document.getElementById('apex-timer-status');
            if (statusEl) statusEl.textContent = 'Descansando...';

            this.intervalId = setInterval(() => {
                this.tempoRestante--;
                this.atualizarDisplay();

                if (this.tempoRestante <= 0) {
                    this.concluir();
                }
            }, 1000);
        },

        pausar() {
            if (!this.rodando) return;
            this.rodando = false;
            clearInterval(this.intervalId);
            this.atualizarBotao();
            const statusEl = document.getElementById('apex-timer-status');
            if (statusEl) statusEl.textContent = 'Pausado';
        },

        reiniciar() {
            this.pausar();
            this.tempoRestante = this.tempoInicial;
            this.atualizarDisplay();
        },

        concluir() {
            this.pausar();
            this.tempoRestante = 0;
            this.atualizarDisplay();

            const statusEl = document.getElementById('apex-timer-status');
            if (statusEl) {
                statusEl.textContent = 'Tempo Esgotado! Próxima Série 🔥';
                statusEl.className = 'text-[11px] uppercase font-black text-emerald-400 tracking-wider animate-bounce';
            }

            // Toca o alarme sonoro
            if (window.ApexCore && window.ApexCore.sound) {
                window.ApexCore.sound.playTimerDone();
            }

            if (window.showToast) {
                window.showToast('Descanso Finalizado! ⏱️', 'Hora de começar a próxima série!', 'success');
            }
        },

        atualizarDisplay() {
            const m = Math.floor(this.tempoRestante / 60);
            const s = this.tempoRestante % 60;
            const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            const displayEl = document.getElementById('apex-timer-display');
            if (displayEl) {
                displayEl.textContent = str;
                if (this.tempoRestante <= 5 && this.tempoRestante > 0) {
                    displayEl.className = 'text-4xl sm:text-5xl font-black tracking-tight text-amber-400 font-mono animate-pulse';
                } else if (this.tempoRestante === 0) {
                    displayEl.className = 'text-4xl sm:text-5xl font-black tracking-tight text-emerald-400 font-mono';
                } else {
                    displayEl.className = 'text-4xl sm:text-5xl font-black tracking-tight text-white font-mono';
                }
            }
        },

        atualizarBotao() {
            const icone = document.getElementById('icone-timer-toggle');
            const texto = document.getElementById('texto-timer-toggle');
            const btn = document.getElementById('btn-timer-toggle');
            if (!btn) return;

            if (this.rodando) {
                icone.setAttribute('data-lucide', 'pause');
                texto.textContent = 'Pausar';
                btn.className = 'flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer';
            } else {
                icone.setAttribute('data-lucide', 'play');
                texto.textContent = 'Iniciar';
                btn.className = 'flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer';
            }
            if (window.lucide) window.lucide.createIcons();
        },

        // Chamado quando o aluno marca uma série no treino
        acionarPorSerie(tempoSugerido = 60) {
            this.mostrar(tempoSugerido);
            this.iniciar();
        }
    };

    window.ApexTimer = RestTimer;

    // Inicializa ao carregar a página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RestTimer.init());
    } else {
        RestTimer.init();
    }
})(window);
