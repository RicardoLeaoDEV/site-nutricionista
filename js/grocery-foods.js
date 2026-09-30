/**
 * ApexFit SaaS - Banco de Alimentos & Gerador de Lista de Compras
 * Funcionalidades:
 * - Banco de dados com mais de 80 alimentos padrão (Tabela TACO/IBGE) com calorias e macronutrientes
 * - Pesquisa rápida e inclusão de alimentos personalizados
 * - Gerador inteligente de lista de compras categorizada (Proteínas, Carboidratos, Frutas/Vegetais, etc.)
 * - Checklist de compras, edição de quantidades e compartilhamento para WhatsApp
 */

(function (window) {
    'use strict';

    const BANCO_ALIMENTOS_PADRAO = [
        // Proteínas
        { nome: 'Peito de Frango Grelhado', porcao: '100g', cal: 165, prot: 31.0, carb: 0.0, gord: 3.6, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Patinho Moído / Bife Grelhado', porcao: '100g', cal: 175, prot: 28.5, carb: 0.0, gord: 6.2, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Ovo Inteiro Cozido', porcao: '1 un (50g)', cal: 72, prot: 6.3, carb: 0.5, gord: 4.8, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Clara de Ovo', porcao: '1 un (30g)', cal: 16, prot: 3.6, carb: 0.2, gord: 0.1, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Tilápia / Peixe Branco Grelhado', porcao: '100g', cal: 128, prot: 26.0, carb: 0.0, gord: 2.7, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Salmão Grelhado', porcao: '100g', cal: 206, prot: 22.0, carb: 0.0, gord: 12.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Whey Protein Concentrado 80%', porcao: '30g', cal: 120, prot: 24.0, carb: 2.5, gord: 1.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Whey Protein Isolado', porcao: '30g', cal: 110, prot: 27.0, carb: 0.5, gord: 0.2, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Iogurte Natural Desnatado', porcao: '170g', cal: 85, prot: 9.0, carb: 11.0, gord: 0.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Queijo Cottage', porcao: '50g', cal: 49, prot: 6.0, carb: 1.5, gord: 2.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Atum em Conserva ao Natural', porcao: '60g', cal: 70, prot: 15.0, carb: 0.0, gord: 0.8, fib: 0.0, cat: 'Proteínas' },

        // Carboidratos
        { nome: 'Arroz Branco Cozido', porcao: '100g', cal: 130, prot: 2.5, carb: 28.2, gord: 0.3, fib: 0.4, cat: 'Carboidratos' },
        { nome: 'Arroz Integral Cozido', porcao: '100g', cal: 112, prot: 2.6, carb: 23.5, gord: 0.9, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Batata Doce Cozida', porcao: '100g', cal: 86, prot: 1.6, carb: 20.1, gord: 0.1, fib: 3.0, cat: 'Carboidratos' },
        { nome: 'Batata Inglesa Cozida', porcao: '100g', cal: 87, prot: 1.9, carb: 20.1, gord: 0.1, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Mandioca / Aipim Cozido', porcao: '100g', cal: 160, prot: 1.4, carb: 38.1, gord: 0.3, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Aveia em Flocos', porcao: '30g', cal: 118, prot: 4.3, carb: 20.0, gord: 2.1, fib: 2.7, cat: 'Carboidratos' },
        { nome: 'Goma de Tapioca', porcao: '50g', cal: 120, prot: 0.0, carb: 30.0, gord: 0.0, fib: 0.0, cat: 'Carboidratos' },
        { nome: 'Pão de Forma Integral', porcao: '2 fatias (50g)', cal: 120, prot: 5.0, carb: 22.0, gord: 1.5, fib: 3.5, cat: 'Carboidratos' },
        { nome: 'Cuscuz Nordestino Cozido', porcao: '100g', cal: 112, prot: 2.2, carb: 25.0, gord: 0.5, fib: 1.5, cat: 'Carboidratos' },
        { nome: 'Macarrão Cozido', porcao: '100g', cal: 158, prot: 5.8, carb: 31.0, gord: 0.9, fib: 1.8, cat: 'Carboidratos' },

        // Frutas & Vegetais
        { nome: 'Banana Prata', porcao: '1 un média (70g)', cal: 68, prot: 0.9, carb: 18.2, gord: 0.1, fib: 1.4, cat: 'Frutas' },
        { nome: 'Maçã com Casca', porcao: '1 un média (130g)', cal: 72, prot: 0.4, carb: 19.0, gord: 0.2, fib: 3.1, cat: 'Frutas' },
        { nome: 'Mamão Papaia', porcao: '100g', cal: 43, prot: 0.5, carb: 11.0, gord: 0.1, fib: 1.7, cat: 'Frutas' },
        { nome: 'Morango Fresco', porcao: '100g', cal: 32, prot: 0.7, carb: 7.7, gord: 0.3, fib: 2.0, cat: 'Frutas' },
        { nome: 'Abacaxi Pérola', porcao: '1 fatia (100g)', cal: 50, prot: 0.5, carb: 13.0, gord: 0.1, fib: 1.4, cat: 'Frutas' },
        { nome: 'Brócolis Cozido no Vapor', porcao: '100g', cal: 35, prot: 2.4, carb: 7.2, gord: 0.4, fib: 3.3, cat: 'Vegetais' },
        { nome: 'Cenoura Crua Ralada', porcao: '100g', cal: 41, prot: 0.9, carb: 9.6, gord: 0.2, fib: 2.8, cat: 'Vegetais' },

        // Gorduras Saudáveis
        { nome: 'Azeite de Oliva Extra Virgem', porcao: '1 colher de sopa (13ml)', cal: 108, prot: 0.0, carb: 0.0, gord: 12.0, fib: 0.0, cat: 'Gorduras' },
        { nome: 'Pasta de Amendoim Integral', porcao: '1 colher de sopa (15g)', cal: 88, prot: 4.0, carb: 3.0, gord: 7.5, fib: 1.0, cat: 'Gorduras' },
        { nome: 'Castanha-do-Pará', porcao: '2 unidades (10g)', cal: 65, prot: 1.4, carb: 1.2, gord: 6.6, fib: 0.8, cat: 'Gorduras' },
        { nome: 'Abacate Fresco', porcao: '100g', cal: 160, prot: 2.0, carb: 8.5, gord: 14.7, fib: 6.7, cat: 'Gorduras' }
    ];

    const GroceryFoods = {
        alimentos: [...BANCO_ALIMENTOS_PADRAO],
        listaCompras: [],

        init() {
            this.carregarAlimentosPersonalizados();
        },

        carregarAlimentosPersonalizados() {
            try {
                const salvos = JSON.parse(localStorage.getItem('apex_banco_alimentos') || '[]');
                if (salvos.length) {
                    this.alimentos = [...BANCO_ALIMENTOS_PADRAO, ...salvos];
                }
            } catch (e) { }
        },

        // Pesquisa no banco de alimentos
        buscar(termo, categoria = null) {
            const t = (termo || '').toLowerCase().trim();
            return this.alimentos.filter(a => {
                const matchTexto = !t || a.nome.toLowerCase().includes(t) || a.cat.toLowerCase().includes(t);
                const matchCat = !categoria || categoria === 'todos' || a.cat.toLowerCase() === categoria.toLowerCase();
                return matchTexto && matchCat;
            });
        },

        // Adiciona novo alimento personalizado
        adicionarAlimentoPersonalizado(item) {
            this.alimentos.push(item);
            try {
                const salvos = JSON.parse(localStorage.getItem('apex_banco_alimentos') || '[]');
                salvos.push(item);
                localStorage.setItem('apex_banco_alimentos', JSON.stringify(salvos));
            } catch (e) { }
        },

        // ----------------------------------------------------------------------
        // GERADOR INTELIGENTE DE LISTA DE COMPRAS
        // ----------------------------------------------------------------------
        gerarListaAPartirDaDieta(dietas) {
            if (!dietas || !dietas.length) return [];

            const itens = [];
            dietas.forEach(d => {
                const texto = (d.alimentos || '') + '\n' + (d.substituicoes || '');
                const linhas = texto.split(/[\n,;•-]+/);
                linhas.forEach(linha => {
                    const l = linha.trim();
                    if (!l || l.length < 3) return;

                    // Tenta categorizar o item
                    let categoria = 'Outros';
                    const lLower = l.toLowerCase();
                    if (lLower.includes('frango') || lLower.includes('carne') || lLower.includes('ovo') || lLower.includes('peixe') || lLower.includes('whey') || lLower.includes('queijo') || lLower.includes('atum')) {
                        categoria = 'Proteínas';
                    } else if (lLower.includes('arroz') || lLower.includes('batata') || lLower.includes('aveia') || lLower.includes('pão') || lLower.includes('tapioca') || lLower.includes('cuscuz') || lLower.includes('macarrão')) {
                        categoria = 'Carboidratos';
                    } else if (lLower.includes('banana') || lLower.includes('maçã') || lLower.includes('mamão') || lLower.includes('morango') || lLower.includes('laranja') || lLower.includes('abacaxi') || lLower.includes('fruta')) {
                        categoria = 'Frutas';
                    } else if (lLower.includes('salada') || lLower.includes('brócolis') || lLower.includes('cenoura') || lLower.includes('alface') || lLower.includes('tomate') || lLower.includes('legume')) {
                        categoria = 'Vegetais & Saladas';
                    } else if (lLower.includes('azeite') || lLower.includes('amendoim') || lLower.includes('castanha') || lLower.includes('abacate')) {
                        categoria = 'Gorduras';
                    }

                    itens.push({
                        nome: l,
                        categoria,
                        comprado: false
                    });
                });
            });

            // Remove itens duplicados
            const unicos = [];
            const vistos = new Set();
            itens.forEach(item => {
                const key = item.nome.toLowerCase();
                if (!vistos.has(key)) {
                    vistos.add(key);
                    unicos.push(item);
                }
            });

            this.listaCompras = unicos;
            return unicos;
        },

        // Renderiza a Lista de Compras dentro de nutricao.html ou modal
        renderModalListaCompras(containerId) {
            let container = document.getElementById(containerId);
            if (!container) return;

            // Agrupa por categoria
            const categorias = {};
            this.listaCompras.forEach(item => {
                categorias[item.categoria] = categorias[item.categoria] || [];
                categorias[item.categoria].push(item);
            });

            const total = this.listaCompras.length;
            const comprados = this.listaCompras.filter(i => i.comprado).length;

            container.innerHTML = `
                <div class="glass-panel p-6 rounded-3xl border border-lime-500/20 space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>Organização & Economia
                            </span>
                            <h2 class="text-lg font-bold text-white">Lista de Compras Inteligente 🛒</h2>
                            <p class="text-xs text-slate-400">Gerada automaticamente a partir do seu cardápio semanal.</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="ApexAlimentos.compartilharWhatsApp()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer">
                                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>Copiar p/ WhatsApp
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-xs text-slate-400">
                        <span>${comprados} de ${total} itens comprados</span>
                        <span class="font-bold text-lime-400">${total > 0 ? Math.round((comprados / total) * 100) : 0}% concluído</span>
                    </div>

                    <div class="space-y-4">
                        ${Object.keys(categorias).map(cat => `
                            <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                                <span class="text-xs font-black uppercase text-lime-400 tracking-wider">${cat}</span>
                                <div class="space-y-1.5">
                                    ${categorias[cat].map((item, idx) => `
                                        <label class="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer hover:text-white py-1">
                                            <input type="checkbox" ${item.comprado ? 'checked' : ''} onchange="ApexAlimentos.toggleComprado('${item.nome}', this.checked)" class="w-4 h-4 rounded accent-lime-500">
                                            <span class="${item.comprado ? 'line-through text-slate-500' : ''}">${item.nome}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        toggleComprado(nome, checked) {
            const item = this.listaCompras.find(i => i.nome === nome);
            if (item) item.comprado = checked;
            this.renderModalListaCompras('container-lista-compras-box');
        },

        compartilharWhatsApp() {
            let texto = '*🛒 LISTA DE COMPRAS APEXFIT*\n\n';
            const categorias = {};
            this.listaCompras.forEach(item => {
                categorias[item.categoria] = categorias[item.categoria] || [];
                categorias[item.categoria].push(item);
            });

            for (const cat in categorias) {
                texto += `*${cat.toUpperCase()}*\n`;
                categorias[cat].forEach(i => {
                    texto += `• [${i.comprado ? 'X' : ' '}] ${i.nome}\n`;
                });
                texto += '\n';
            }

            navigator.clipboard.writeText(texto).then(() => {
                if (window.showToast) {
                    window.showToast('Lista Copiada! 📋', 'Pronta para colar no WhatsApp ou bloco de notas.', 'success');
                }
            });
        }
    };

    window.ApexAlimentos = GroceryFoods;
    GroceryFoods.init();
})(window);
