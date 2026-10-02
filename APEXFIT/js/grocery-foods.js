/**
 * ApexFit SaaS - Banco de Alimentos & Gerador de Lista de Compras
 * Tabela Nutricional Brasileira (TACO / IBGE / USDA)
 * Funcionalidades:
 * - Banco abrangente com mais de 70 alimentos brasileiros padronizados per 100g
 * - Cálculo automático preciso de calorias e macronutrientes (Proteínas, Carboidratos, Gorduras, Fibras) por gramatura digitada
 * - Pesquisa instantânea por nome e filtro por categorias (Proteínas, Carboidratos, Frutas, Vegetais, Gorduras)
 * - Inclusão e persistência de alimentos personalizados em localStorage
 * - Gerador inteligente de lista de compras categorizada e compartilhamento via WhatsApp
 */

(function (window) {
    'use strict';

    // Base de dados padronizada por 100g (baseGramas: 100) para cálculo proporcional perfeito
    const BANCO_ALIMENTOS_PADRAO = [
        // ================= PROTEÍNAS =================
        { nome: 'Peito de Frango Grelhado', baseGramas: 100, porcao: '100g', cal: 165, prot: 31.0, carb: 0.0, gord: 3.6, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Patinho Moído / Bife Grelhado', baseGramas: 100, porcao: '100g', cal: 175, prot: 28.5, carb: 0.0, gord: 6.2, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Filé Mignon Grelhado', baseGramas: 100, porcao: '100g', cal: 190, prot: 29.0, carb: 0.0, gord: 7.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Alcatra Bife Grelhado', baseGramas: 100, porcao: '100g', cal: 195, prot: 28.0, carb: 0.0, gord: 8.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Lombo Suíno Magro Assado', baseGramas: 100, porcao: '100g', cal: 180, prot: 27.0, carb: 0.0, gord: 7.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Sobrecoxa de Frango sem Pele', baseGramas: 100, porcao: '100g', cal: 215, prot: 25.0, carb: 0.0, gord: 12.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Peito de Peru Fatiado', baseGramas: 100, porcao: '100g', cal: 105, prot: 21.0, carb: 1.5, gord: 1.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Tilápia / Peixe Branco Grelhado', baseGramas: 100, porcao: '100g', cal: 128, prot: 26.0, carb: 0.0, gord: 2.7, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Salmão Grelhado', baseGramas: 100, porcao: '100g', cal: 206, prot: 22.0, carb: 0.0, gord: 12.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Atum em Conserva ao Natural', baseGramas: 100, porcao: '100g', cal: 116, prot: 26.0, carb: 0.0, gord: 1.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Sardinha Cozida / em Conserva', baseGramas: 100, porcao: '100g', cal: 164, prot: 21.0, carb: 0.0, gord: 8.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Camarão Cozido', baseGramas: 100, porcao: '100g', cal: 99, prot: 21.0, carb: 0.0, gord: 1.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Ovo Inteiro Cozido', baseGramas: 100, porcao: '100g (~2 ovos)', cal: 144, prot: 12.6, carb: 1.0, gord: 9.6, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Clara de Ovo Cozida', baseGramas: 100, porcao: '100g (~3 claras)', cal: 52, prot: 11.0, carb: 0.7, gord: 0.2, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Omelete Simples (azeite leve)', baseGramas: 100, porcao: '100g', cal: 154, prot: 10.6, carb: 1.2, gord: 11.8, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Whey Protein Concentrado 80%', baseGramas: 100, porcao: '100g (30g = 120 kcal)', cal: 400, prot: 80.0, carb: 8.3, gord: 5.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Whey Protein Isolado 90%', baseGramas: 100, porcao: '100g (30g = 110 kcal)', cal: 367, prot: 90.0, carb: 1.7, gord: 0.7, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Iogurte Natural Desnatado', baseGramas: 100, porcao: '100g', cal: 43, prot: 4.1, carb: 5.8, gord: 0.3, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Iogurte Grego Tradicional', baseGramas: 100, porcao: '100g', cal: 100, prot: 6.0, carb: 6.0, gord: 5.5, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Queijo Cottage', baseGramas: 100, porcao: '100g', cal: 98, prot: 11.1, carb: 3.4, gord: 4.3, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Queijo Minas Frescal', baseGramas: 100, porcao: '100g', cal: 227, prot: 17.4, carb: 3.2, gord: 16.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Queijo Muçarela', baseGramas: 100, porcao: '100g', cal: 280, prot: 22.0, carb: 2.2, gord: 21.0, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Queijo Parmesão Ralado', baseGramas: 100, porcao: '100g', cal: 392, prot: 35.6, carb: 1.7, gord: 25.8, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Leite Desnatado', baseGramas: 100, porcao: '100ml / 100g', cal: 35, prot: 3.2, carb: 4.8, gord: 0.1, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Leite Integral', baseGramas: 100, porcao: '100ml / 100g', cal: 61, prot: 3.1, carb: 4.7, gord: 3.2, fib: 0.0, cat: 'Proteínas' },
        { nome: 'Tofu Orgânico Firme', baseGramas: 100, porcao: '100g', cal: 76, prot: 8.0, carb: 1.9, gord: 4.8, fib: 0.3, cat: 'Proteínas' },
        { nome: 'Proteína de Soja Texturizada Cozida', baseGramas: 100, porcao: '100g', cal: 118, prot: 17.0, carb: 9.0, gord: 1.0, fib: 5.0, cat: 'Proteínas' },

        // ================= CARBOIDRATOS =================
        { nome: 'Arroz Branco Cozido', baseGramas: 100, porcao: '100g', cal: 130, prot: 2.5, carb: 28.2, gord: 0.3, fib: 0.4, cat: 'Carboidratos' },
        { nome: 'Arroz Integral Cozido', baseGramas: 100, porcao: '100g', cal: 112, prot: 2.6, carb: 23.5, gord: 0.9, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Feijão Carioca Cozido', baseGramas: 100, porcao: '100g', cal: 76, prot: 4.8, carb: 13.6, gord: 0.5, fib: 8.5, cat: 'Carboidratos' },
        { nome: 'Feijão Preto Cozido', baseGramas: 100, porcao: '100g', cal: 77, prot: 4.5, carb: 14.0, gord: 0.5, fib: 8.4, cat: 'Carboidratos' },
        { nome: 'Batata Doce Cozida', baseGramas: 100, porcao: '100g', cal: 86, prot: 1.6, carb: 20.1, gord: 0.1, fib: 3.0, cat: 'Carboidratos' },
        { nome: 'Batata Inglesa Cozida', baseGramas: 100, porcao: '100g', cal: 87, prot: 1.9, carb: 20.1, gord: 0.1, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Batata Baroa / Mandioquinha', baseGramas: 100, porcao: '100g', cal: 90, prot: 1.0, carb: 21.0, gord: 0.2, fib: 2.1, cat: 'Carboidratos' },
        { nome: 'Mandioca / Aipim Cozido', baseGramas: 100, porcao: '100g', cal: 160, prot: 1.4, carb: 38.1, gord: 0.3, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Aveia em Flocos', baseGramas: 100, porcao: '100g (30g = 118 kcal)', cal: 394, prot: 14.3, carb: 66.6, gord: 7.0, fib: 9.1, cat: 'Carboidratos' },
        { nome: 'Farelo de Aveia', baseGramas: 100, porcao: '100g', cal: 246, prot: 17.3, carb: 50.8, gord: 7.0, fib: 15.4, cat: 'Carboidratos' },
        { nome: 'Goma de Tapioca Hidratada', baseGramas: 100, porcao: '100g (50g = 120 kcal)', cal: 240, prot: 0.0, carb: 60.0, gord: 0.0, fib: 0.0, cat: 'Carboidratos' },
        { nome: 'Pão de Forma Integral', baseGramas: 100, porcao: '100g (~2 fatias = 50g)', cal: 240, prot: 10.0, carb: 44.0, gord: 3.0, fib: 7.0, cat: 'Carboidratos' },
        { nome: 'Pão Francês Tradicional', baseGramas: 100, porcao: '100g (1 un = 50g)', cal: 300, prot: 8.0, carb: 58.0, gord: 3.1, fib: 2.3, cat: 'Carboidratos' },
        { nome: 'Cuscuz Nordestino Cozido', baseGramas: 100, porcao: '100g', cal: 112, prot: 2.2, carb: 25.0, gord: 0.5, fib: 1.5, cat: 'Carboidratos' },
        { nome: 'Macarrão Tradicional Cozido', baseGramas: 100, porcao: '100g', cal: 158, prot: 5.8, carb: 31.0, gord: 0.9, fib: 1.8, cat: 'Carboidratos' },
        { nome: 'Macarrão Integral Cozido', baseGramas: 100, porcao: '100g', cal: 124, prot: 5.3, carb: 26.5, gord: 0.5, fib: 3.9, cat: 'Carboidratos' },
        { nome: 'Grão-de-Bico Cozido', baseGramas: 100, porcao: '100g', cal: 164, prot: 8.9, carb: 27.4, gord: 2.6, fib: 7.6, cat: 'Carboidratos' },
        { nome: 'Lentilha Cozida', baseGramas: 100, porcao: '100g', cal: 116, prot: 9.0, carb: 20.0, gord: 0.4, fib: 7.9, cat: 'Carboidratos' },
        { nome: 'Quinoa Cozida', baseGramas: 100, porcao: '100g', cal: 120, prot: 4.4, carb: 21.3, gord: 1.9, fib: 2.8, cat: 'Carboidratos' },
        { nome: 'Milho Verde Cozido', baseGramas: 100, porcao: '100g', cal: 98, prot: 3.2, carb: 21.0, gord: 1.3, fib: 2.4, cat: 'Carboidratos' },
        { nome: 'Granola Tradicional / Aveia & Mel', baseGramas: 100, porcao: '100g', cal: 420, prot: 10.0, carb: 68.0, gord: 12.0, fib: 7.0, cat: 'Carboidratos' },

        // ================= FRUTAS =================
        { nome: 'Banana Prata', baseGramas: 100, porcao: '100g (1 média = 70g)', cal: 98, prot: 1.3, carb: 26.0, gord: 0.1, fib: 2.0, cat: 'Frutas' },
        { nome: 'Banana Nanica', baseGramas: 100, porcao: '100g', cal: 92, prot: 1.4, carb: 23.8, gord: 0.1, fib: 1.9, cat: 'Frutas' },
        { nome: 'Maçã com Casca', baseGramas: 100, porcao: '100g (1 un = 130g)', cal: 56, prot: 0.3, carb: 14.6, gord: 0.2, fib: 2.4, cat: 'Frutas' },
        { nome: 'Mamão Papaia', baseGramas: 100, porcao: '100g', cal: 43, prot: 0.5, carb: 11.0, gord: 0.1, fib: 1.7, cat: 'Frutas' },
        { nome: 'Morango Fresco', baseGramas: 100, porcao: '100g', cal: 32, prot: 0.7, carb: 7.7, gord: 0.3, fib: 2.0, cat: 'Frutas' },
        { nome: 'Abacaxi Pérola', baseGramas: 100, porcao: '100g (1 fatia)', cal: 50, prot: 0.5, carb: 13.0, gord: 0.1, fib: 1.4, cat: 'Frutas' },
        { nome: 'Laranja Pêra', baseGramas: 100, porcao: '100g (1 un = 130g)', cal: 47, prot: 0.9, carb: 11.7, gord: 0.1, fib: 2.4, cat: 'Frutas' },
        { nome: 'Melancia Fresca', baseGramas: 100, porcao: '100g', cal: 30, prot: 0.6, carb: 7.5, gord: 0.1, fib: 0.4, cat: 'Frutas' },
        { nome: 'Melão Espanhol', baseGramas: 100, porcao: '100g', cal: 34, prot: 0.8, carb: 8.2, gord: 0.2, fib: 0.9, cat: 'Frutas' },
        { nome: 'Uva Itália / Rubi', baseGramas: 100, porcao: '100g', cal: 69, prot: 0.7, carb: 18.1, gord: 0.2, fib: 0.9, cat: 'Frutas' },
        { nome: 'Manga Tommy / Palmer', baseGramas: 100, porcao: '100g', cal: 60, prot: 0.8, carb: 15.0, gord: 0.4, fib: 1.6, cat: 'Frutas' },
        { nome: 'Kiwi Fresco', baseGramas: 100, porcao: '100g', cal: 61, prot: 1.1, carb: 14.7, gord: 0.5, fib: 3.0, cat: 'Frutas' },
        { nome: 'Pêra Williams', baseGramas: 100, porcao: '100g', cal: 57, prot: 0.4, carb: 15.2, gord: 0.1, fib: 3.1, cat: 'Frutas' },
        { nome: 'Polpa de Açaí Puro (sem xarope)', baseGramas: 100, porcao: '100g', cal: 60, prot: 0.8, carb: 6.2, gord: 3.9, fib: 3.2, cat: 'Frutas' },

        // ================= VEGETAIS & SALADAS =================
        { nome: 'Brócolis Cozido no Vapor', baseGramas: 100, porcao: '100g', cal: 35, prot: 2.4, carb: 7.2, gord: 0.4, fib: 3.3, cat: 'Vegetais' },
        { nome: 'Cenoura Crua Ralada', baseGramas: 100, porcao: '100g', cal: 41, prot: 0.9, carb: 9.6, gord: 0.2, fib: 2.8, cat: 'Vegetais' },
        { nome: 'Alface Crespa / Americana', baseGramas: 100, porcao: '100g', cal: 15, prot: 1.4, carb: 2.9, gord: 0.2, fib: 1.3, cat: 'Vegetais' },
        { nome: 'Tomate Salada', baseGramas: 100, porcao: '100g', cal: 18, prot: 0.9, carb: 3.9, gord: 0.2, fib: 1.2, cat: 'Vegetais' },
        { nome: 'Couve Manteiga Refogada', baseGramas: 100, porcao: '100g', cal: 90, prot: 3.0, carb: 8.0, gord: 5.5, fib: 3.5, cat: 'Vegetais' },
        { nome: 'Espinafre Cozido', baseGramas: 100, porcao: '100g', cal: 23, prot: 3.0, carb: 3.8, gord: 0.3, fib: 2.4, cat: 'Vegetais' },
        { nome: 'Abobrinha Verde Cozida', baseGramas: 100, porcao: '100g', cal: 17, prot: 1.2, carb: 3.1, gord: 0.3, fib: 1.0, cat: 'Vegetais' },
        { nome: 'Pepino com Casca', baseGramas: 100, porcao: '100g', cal: 15, prot: 0.7, carb: 3.6, gord: 0.1, fib: 0.5, cat: 'Vegetais' },
        { nome: 'Beterraba Cozida', baseGramas: 100, porcao: '100g', cal: 44, prot: 1.7, carb: 10.0, gord: 0.2, fib: 2.0, cat: 'Vegetais' },
        { nome: 'Couve-Flor Cozida', baseGramas: 100, porcao: '100g', cal: 25, prot: 1.9, carb: 5.0, gord: 0.3, fib: 2.0, cat: 'Vegetais' },
        { nome: 'Vagem Cozida', baseGramas: 100, porcao: '100g', cal: 35, prot: 1.9, carb: 7.9, gord: 0.2, fib: 3.2, cat: 'Vegetais' },
        { nome: 'Chuchu Cozido', baseGramas: 100, porcao: '100g', cal: 19, prot: 0.8, carb: 4.5, gord: 0.1, fib: 1.7, cat: 'Vegetais' },

        // ================= GORDURAS SAUDÁVEIS =================
        { nome: 'Azeite de Oliva Extra Virgem', baseGramas: 100, porcao: '100g (1 c. sopa = 13ml)', cal: 884, prot: 0.0, carb: 0.0, gord: 100.0, fib: 0.0, cat: 'Gorduras' },
        { nome: 'Pasta de Amendoim Integral', baseGramas: 100, porcao: '100g (1 c. sopa = 15g)', cal: 588, prot: 25.0, carb: 20.0, gord: 50.0, fib: 6.0, cat: 'Gorduras' },
        { nome: 'Castanha-do-Pará (Brasil)', baseGramas: 100, porcao: '100g (~2 un = 10g)', cal: 656, prot: 14.3, carb: 12.3, gord: 66.4, fib: 7.5, cat: 'Gorduras' },
        { nome: 'Castanha de Caju Torrada', baseGramas: 100, porcao: '100g', cal: 553, prot: 18.2, carb: 30.2, gord: 43.8, fib: 3.3, cat: 'Gorduras' },
        { nome: 'Nozes Chilenas', baseGramas: 100, porcao: '100g', cal: 654, prot: 15.2, carb: 13.7, gord: 65.2, fib: 6.7, cat: 'Gorduras' },
        { nome: 'Abacate Fresco', baseGramas: 100, porcao: '100g', cal: 160, prot: 2.0, carb: 8.5, gord: 14.7, fib: 6.7, cat: 'Gorduras' },
        { nome: 'Semente de Chia', baseGramas: 100, porcao: '100g', cal: 486, prot: 16.5, carb: 42.1, gord: 30.7, fib: 34.4, cat: 'Gorduras' },
        { nome: 'Linhaça Dourada Moída', baseGramas: 100, porcao: '100g', cal: 534, prot: 18.3, carb: 28.9, gord: 42.2, fib: 27.3, cat: 'Gorduras' },
        { nome: 'Manteiga sem Sal', baseGramas: 100, porcao: '100g', cal: 717, prot: 0.9, carb: 0.1, gord: 81.1, fib: 0.0, cat: 'Gorduras' },
        { nome: 'Óleo de Coco Extra Virgem', baseGramas: 100, porcao: '100g', cal: 862, prot: 0.0, carb: 0.0, gord: 100.0, fib: 0.0, cat: 'Gorduras' }
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
                if (salvos && salvos.length) {
                    // Evita duplicatas com os padrões por nome
                    const nomesPadrao = new Set(BANCO_ALIMENTOS_PADRAO.map(a => a.nome.toLowerCase()));
                    const novos = salvos.filter(s => !nomesPadrao.has((s.nome || '').toLowerCase()));
                    this.alimentos = [...BANCO_ALIMENTOS_PADRAO, ...novos];
                } else {
                    this.alimentos = [...BANCO_ALIMENTOS_PADRAO];
                }
            } catch (e) {
                this.alimentos = [...BANCO_ALIMENTOS_PADRAO];
            }
        },

        // Obter alimento exato por nome
        obterAlimentoPorNome(nome) {
            if (!nome) return null;
            const n = nome.toLowerCase().trim();
            return this.alimentos.find(a => a.nome.toLowerCase().trim() === n) || null;
        },

        // Pesquisa no banco de alimentos com suporte a categoria
        buscar(termo = '', categoria = 'todos') {
            const t = (termo || '').toLowerCase().trim();
            const cat = (categoria || 'todos').toLowerCase().trim();

            return this.alimentos.filter(a => {
                const matchTexto = !t || a.nome.toLowerCase().includes(t) || (a.cat && a.cat.toLowerCase().includes(t));
                const matchCat = cat === 'todos' || (a.cat && a.cat.toLowerCase() === cat);
                return matchTexto && matchCat;
            });
        },

        // ----------------------------------------------------------------------
        // CÁLCULO PRECISO DE MACRONUTRIENTES E CALORIAS POR GRAMATURA
        // ----------------------------------------------------------------------
        calcularMacros(alimentoOuNome, gramas) {
            let food = typeof alimentoOuNome === 'string'
                ? this.obterAlimentoPorNome(alimentoOuNome)
                : alimentoOuNome;

            if (!food) return null;

            const g = parseFloat(gramas) || 0;
            const base = food.baseGramas || 100;
            const fator = g / base;

            const cal = Math.round((food.cal || 0) * fator);
            const prot = parseFloat(((food.prot || 0) * fator).toFixed(1));
            const carb = parseFloat(((food.carb || 0) * fator).toFixed(1));
            const gord = parseFloat(((food.gord || 0) * fator).toFixed(1));
            const fib = parseFloat(((food.fib || 0) * fator).toFixed(1));

            return {
                nome: food.nome,
                cat: food.cat || 'Geral',
                gramas: g,
                cal: cal,
                prot: prot,
                carb: carb,
                gord: gord,
                fib: fib,
                rawFood: food
            };
        },

        // Formatação legível para prescrição médica/nutricional
        formatarAlimentoTexto(itemCalculado) {
            if (!itemCalculado) return '';
            return `• ${itemCalculado.gramas}g ${itemCalculado.nome} (${itemCalculado.cal} kcal | P: ${itemCalculado.prot}g | C: ${itemCalculado.carb}g | G: ${itemCalculado.gord}g)`;
        },

        // Adiciona novo alimento personalizado e salva no LocalStorage
        adicionarAlimentoPersonalizado(item) {
            if (!item || !item.nome) return false;
            const novo = {
                nome: item.nome.trim(),
                baseGramas: 100,
                porcao: item.porcao || '100g',
                cal: Math.round(Number(item.cal) || 0),
                prot: Number(Number(item.prot || 0).toFixed(1)),
                carb: Number(Number(item.carb || 0).toFixed(1)),
                gord: Number(Number(item.gord || 0).toFixed(1)),
                fib: Number(Number(item.fib || 0).toFixed(1)),
                cat: item.cat || 'Personalizados'
            };

            this.alimentos.push(novo);

            try {
                const salvos = JSON.parse(localStorage.getItem('apex_banco_alimentos') || '[]');
                salvos.push(novo);
                localStorage.setItem('apex_banco_alimentos', JSON.stringify(salvos));
            } catch (e) {
                console.warn('Erro ao salvar no localStorage:', e);
            }
            return novo;
        },

        // ----------------------------------------------------------------------
        // GERADOR INTELIGENTE DE LISTA DE COMPRAS
        // ----------------------------------------------------------------------
        gerarListaAPartirDaDieta(dietas) {
            if (!dietas || !dietas.length) return [];

            const itens = [];
            dietas.forEach(d => {
                const texto = (d.alimentos || '') + '\n' + (d.substituicoes || '');
                // Divide por quebras de linha, ponto e vírgula, marcadores de lista ou hífen precedido/sucedido de espaço
                // Preserva palavras compostas como Grão-de-bico, Couve-flor, Pré-treino
                const linhas = texto.split(/(?:\r?\n|;|\s*•\s*|\s*[*]\s*|^\s*-\s+|\s+-\s+)/);
                linhas.forEach(linha => {
                    let l = linha.trim().replace(/^[-•*]\s*/, '').trim();
                    if (!l || l.length < 3) return;

                    // Tenta categorizar o item
                    let categoria = 'Outros';
                    const lLower = l.toLowerCase();
                    if (lLower.includes('frango') || lLower.includes('carne') || lLower.includes('ovo') || lLower.includes('peixe') || lLower.includes('whey') || lLower.includes('queijo') || lLower.includes('atum') || lLower.includes('patinho') || lLower.includes('tilápia')) {
                        categoria = 'Proteínas';
                    } else if (lLower.includes('arroz') || lLower.includes('batata') || lLower.includes('aveia') || lLower.includes('pão') || lLower.includes('tapioca') || lLower.includes('cuscuz') || lLower.includes('macarrão') || lLower.includes('feijão') || lLower.includes('mandioca') || lLower.includes('grão') || lLower.includes('lentilha')) {
                        categoria = 'Carboidratos';
                    } else if (lLower.includes('banana') || lLower.includes('maçã') || lLower.includes('mamão') || lLower.includes('morango') || lLower.includes('laranja') || lLower.includes('abacaxi') || lLower.includes('uva') || lLower.includes('fruta')) {
                        categoria = 'Frutas';
                    } else if (lLower.includes('salada') || lLower.includes('brócolis') || lLower.includes('cenoura') || lLower.includes('alface') || lLower.includes('tomate') || lLower.includes('legume') || lLower.includes('couve') || lLower.includes('espinafre')) {
                        categoria = 'Vegetais & Saladas';
                    } else if (lLower.includes('azeite') || lLower.includes('amendoim') || lLower.includes('castanha') || lLower.includes('abacate') || lLower.includes('chia') || lLower.includes('manteiga')) {
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

        lastContainerId: 'modal-lista-compras-conteudo',

        // Renderiza a Lista de Compras dentro de nutricao.html ou modal
        renderModalListaCompras(containerId) {
            const targetId = containerId || this.lastContainerId || 'modal-lista-compras-conteudo';
            this.lastContainerId = targetId;
            let container = document.getElementById(targetId);
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
                <div class="glass-panel p-5 sm:p-6 md:p-8 rounded-3xl border border-lime-500/20 space-y-5 shadow-2xl relative">
                    <!-- Topo do Modal com Fechar Seguro e Ações -->
                    <div class="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
                        <div class="min-w-0 flex-1">
                            <span class="text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="shopping-cart" class="w-3.5 h-3.5 shrink-0"></i>Organização & Economia
                            </span>
                            <h2 class="text-lg sm:text-xl font-extrabold text-white tracking-tight">Lista de Compras Inteligente 🛒</h2>
                            <p class="text-xs text-slate-400 mt-0.5">Gerada automaticamente a partir do seu cardápio prescrito.</p>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button type="button" onclick="ApexAlimentos.compartilharWhatsApp()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 sm:px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95">
                                <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                                <span class="hidden sm:inline">Copiar p/ WhatsApp</span>
                                <span class="sm:hidden">WhatsApp</span>
                            </button>
                            <button type="button" onclick="fecharListaCompras()" class="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer active:scale-95" title="Fechar" aria-label="Fechar">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Barra de Progresso e Métricas -->
                    <div class="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <span class="font-medium">${comprados} de ${total} itens marcados</span>
                        <span class="font-extrabold text-lime-400">${total > 0 ? Math.round((comprados / total) * 100) : 0}% concluído</span>
                    </div>

                    <!-- Categorias em Grid Responsivo (2 colunas em telas maiores) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        ${Object.keys(categorias).map(cat => `
                            <div class="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 space-y-2.5 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5 mb-2">
                                        <span class="text-xs font-black uppercase text-lime-400 tracking-wider">${cat}</span>
                                        <span class="text-[10px] text-slate-500 font-semibold">${categorias[cat].length} itens</span>
                                    </div>
                                    <div class="space-y-1.5">
                                        ${categorias[cat].map((item) => `
                                            <label class="flex items-start gap-2.5 text-xs text-slate-200 cursor-pointer hover:text-white py-1 group select-none transition-colors">
                                                <input type="checkbox" ${item.comprado ? 'checked' : ''} onchange="ApexAlimentos.toggleComprado('${item.nome.replace(/'/g, "\\'")}', this.checked)" class="mt-0.5 w-4 h-4 rounded accent-lime-500 shrink-0 cursor-pointer">
                                                <span class="break-words min-w-0 flex-1 leading-relaxed ${item.comprado ? 'line-through text-slate-500' : 'group-hover:text-lime-200'}">${item.nome}</span>
                                            </label>
                                        `).join('')}
                                    </div>
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
            this.renderModalListaCompras(this.lastContainerId);
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
