/**
 * Real Fit Hub - Banco de Alimentos & Gerador Inteligente de Lista de Compras
 * Tabela Nutricional Brasileira (TACO / IBGE / USDA)
 * 
 * Funcionalidades Avançadas:
 * - Banco de alimentos padronizado per 100g para prescrição e cálculo de macronutrientes
 * - Conversão precisa de alimento pronto/prescrito para alimento CRU a ser comprado no supermercado (Fator de Cocção FCO)
 * - Projeção de compras Semanal (7 dias) e Mensal (30 dias)
 * - Estimativa financeira de custos de mercado semanal e mensal com subtotais por categoria
 * - Geração de PDF profissional da Lista de Compras com logo oficial e dados do Nutricionista
 * - Envio e compartilhamento direto via WhatsApp com integração Web Share API e download
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

    // ================= TABELA DE CONVERSÃO CRU & ESTIMATIVA DE SUPERMERCADO =================
    const TABELA_CONVERSAO_CRU = [
        // PROTEÍNAS
        {
            chaves: ['frango', 'peito de frango', 'sobrecoxa'],
            nomeMercado: 'Peito de Frango Resfriado (Cru / Filé)',
            categoria: 'Proteínas & Carnes',
            tipo: 'peso',
            fatorCru: 1.33, // 100g pronto precisa de 133g cru (perda de água)
            precoKg: 22.90,
            unidadePadrao: 'kg',
            infoPreparo: '100g grelhado requer ~133g cru no mercado'
        },
        {
            chaves: ['patinho', 'carne moída', 'bife', 'alcatra', 'filé mignon', 'carne'],
            nomeMercado: 'Carne Bovina Moída / Bife (Cru - Patinho/Alcatra)',
            categoria: 'Proteínas & Carnes',
            tipo: 'peso',
            fatorCru: 1.35,
            precoKg: 39.90,
            unidadePadrao: 'kg',
            infoPreparo: '100g pronto requer ~135g cru no açougue'
        },
        {
            chaves: ['tilápia', 'peixe', 'salmão', 'pescada', 'atum fresco'],
            nomeMercado: 'Filé de Tilápia / Peixe Branco (Cru / Fresco)',
            categoria: 'Proteínas & Carnes',
            tipo: 'peso',
            fatorCru: 1.25,
            precoKg: 38.90,
            unidadePadrao: 'kg',
            infoPreparo: '100g grelhado requer ~125g cru na peixaria'
        },
        {
            chaves: ['atum em conserva', 'atum'],
            nomeMercado: 'Atum em Conserva ao Natural (Lata 170g)',
            categoria: 'Proteínas & Carnes',
            tipo: 'unidade',
            fatorCru: 1.0,
            precoUnitario: 8.50,
            unidadePadrao: 'lata',
            infoPreparo: 'Lata 170g (peso drenado ~120g)'
        },
        {
            chaves: ['ovo', 'ovos', 'clara'],
            nomeMercado: 'Ovos Brancos / Vermelhos Tipo Grande',
            categoria: 'Proteínas & Carnes',
            tipo: 'unidade',
            fatorCru: 1.0,
            precoUnitario: 0.80, // ~R$ 24 a cartela c/ 30
            unidadePadrao: 'un',
            infoPreparo: 'Cartelas de 30 ovos ou dúzias'
        },
        {
            chaves: ['whey', 'whey protein', 'proteína'],
            nomeMercado: 'Whey Protein Concentrado / Isolado (Refil 900g)',
            categoria: 'Laticínios & Suplementos',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 122.20, // ~R$ 110 por 900g
            unidadePadrao: 'g',
            infoPreparo: 'Potes ou refis de 900g'
        },
        {
            chaves: ['queijo', 'cottage', 'minas', 'muçarela', 'parmesão'],
            nomeMercado: 'Queijo Minas Frescal / Cottage / Muçarela',
            categoria: 'Laticínios & Suplementos',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 48.00,
            unidadePadrao: 'kg',
            infoPreparo: 'Peça refrigerada em gramas'
        },
        {
            chaves: ['leite', 'desnatado', 'integral'],
            nomeMercado: 'Leite Desnatado / Integral (Caixa UHT 1L)',
            categoria: 'Laticínios & Suplementos',
            tipo: 'volume',
            fatorCru: 1.0,
            precoLitro: 5.50,
            unidadePadrao: 'L',
            infoPreparo: 'Caixas de 1 Litro'
        },
        {
            chaves: ['iogurte'],
            nomeMercado: 'Iogurte Natural / Grego Desnatado (Pote)',
            categoria: 'Laticínios & Suplementos',
            tipo: 'unidade',
            fatorCru: 1.0,
            precoUnitario: 4.50,
            unidadePadrao: 'pote',
            infoPreparo: 'Potes de 160g a 200g'
        },

        // CARBOIDRATOS & GRÃOS
        {
            chaves: ['arroz branco', 'arroz integral', 'arroz'],
            nomeMercado: 'Arroz Branco / Integral Tipo 1 (Grão Cru / Pacote)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 0.40, // 100g arroz pronto requer 40g arroz cru (expande 2.5x)
            precoKg: 6.50,
            unidadePadrao: 'kg',
            infoPreparo: 'Grão cru rende 2.5x após cozimento'
        },
        {
            chaves: ['feijão carioca', 'feijão preto', 'feijão'],
            nomeMercado: 'Feijão Carioca / Preto Tipo 1 (Grão Cru / Pacote)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 0.42, // 100g feijão pronto requer 42g feijão cru (expande 2.4x)
            precoKg: 7.90,
            unidadePadrao: 'kg',
            infoPreparo: 'Grão cru rende 2.4x após cozimento'
        },
        {
            chaves: ['batata doce', 'batata inglesa', 'batata baroa', 'mandioca', 'aipim'],
            nomeMercado: 'Batata Doce / Batata Inglesa (Crua - Hortifrúti)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 1.15, // Descasque e limpeza in natura
            precoKg: 5.90,
            unidadePadrao: 'kg',
            infoPreparo: 'Pesagem in natura crua com casca'
        },
        {
            chaves: ['aveia em flocos', 'farelo de aveia', 'aveia'],
            nomeMercado: 'Aveia em Flocos Finos / Grossos (Pacote)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 18.00,
            unidadePadrao: 'g',
            infoPreparo: 'Pacotes secos de 250g ou 500g'
        },
        {
            chaves: ['pão de forma', 'pão integral', 'pão francês', 'pão'],
            nomeMercado: 'Pão de Forma 100% Integral (Pacote)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 21.00, // ~R$ 9.50 pacote de 450g
            unidadePadrao: 'pct',
            infoPreparo: 'Pacotes de 450g (~20 fatias)'
        },
        {
            chaves: ['tapioca', 'goma de tapioca'],
            nomeMercado: 'Goma de Tapioca Hidratada (Pacote)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 9.90,
            unidadePadrao: 'kg',
            infoPreparo: 'Pacotes de 500g ou 1kg'
        },
        {
            chaves: ['cuscuz', 'flocão de milho', 'milho'],
            nomeMercado: 'Flocão de Milho para Cuscuz (Pacote 500g)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 0.70, // Cuscuz expande 1.4x
            precoKg: 5.80,
            unidadePadrao: 'kg',
            infoPreparo: 'Pacotes de 500g'
        },
        {
            chaves: ['macarrão'],
            nomeMercado: 'Macarrão de Sêmola / Integral (Cru - Pacote 500g)',
            categoria: 'Carboidratos & Grãos',
            tipo: 'peso',
            fatorCru: 0.45, // Macarrão expande 2.2x
            precoKg: 8.90,
            unidadePadrao: 'kg',
            infoPreparo: 'Pacotes secos de 500g'
        },

        // FRUTAS
        {
            chaves: ['banana prata', 'banana nanica', 'banana'],
            nomeMercado: 'Banana Prata / Nanica Selecionada',
            categoria: 'Frutas',
            tipo: 'unidade',
            fatorCru: 1.15,
            precoUnitario: 0.70, // ~R$ 6.90/kg
            pesoMedioUnidade: 100,
            unidadePadrao: 'un',
            infoPreparo: 'Por dúzias ou pesagem no quilo'
        },
        {
            chaves: ['maçã', 'maçã gala', 'maçã fuji'],
            nomeMercado: 'Maçã Nacional Gala / Fuji',
            categoria: 'Frutas',
            tipo: 'unidade',
            fatorCru: 1.10,
            precoUnitario: 1.30,
            pesoMedioUnidade: 130,
            unidadePadrao: 'un',
            infoPreparo: 'Hortifrúti fresco'
        },
        {
            chaves: ['mamão', 'papaia'],
            nomeMercado: 'Mamão Papaia / Formosa',
            categoria: 'Frutas',
            tipo: 'peso',
            fatorCru: 1.25,
            precoKg: 8.50,
            unidadePadrao: 'kg',
            infoPreparo: 'Pesagem in natura com casca'
        },
        {
            chaves: ['morango'],
            nomeMercado: 'Morango Fresco Selecionado (Bandeja 250g)',
            categoria: 'Frutas',
            tipo: 'peso',
            fatorCru: 1.05,
            precoKg: 28.00,
            unidadePadrao: 'g',
            infoPreparo: 'Bandejas frescas de 250g'
        },
        {
            chaves: ['abacaxi', 'laranja', 'melancia', 'melão', 'uva'],
            nomeMercado: 'Frutas Variadas da Época (Hortifrúti)',
            categoria: 'Frutas',
            tipo: 'peso',
            fatorCru: 1.20,
            precoKg: 7.90,
            unidadePadrao: 'kg',
            infoPreparo: 'In natura'
        },

        // VEGETAIS & SALADAS
        {
            chaves: ['brócolis'],
            nomeMercado: 'Brócolis Ninja / Americano Fresco (Cru)',
            categoria: 'Vegetais & Saladas',
            tipo: 'peso',
            fatorCru: 1.25,
            precoKg: 12.90,
            unidadePadrao: 'kg',
            infoPreparo: 'Maço in natura cru com talo'
        },
        {
            chaves: ['salada', 'alface', 'rúcula', 'folhas'],
            nomeMercado: 'Alface Crespa / Americana & Folhas Verdes',
            categoria: 'Vegetais & Saladas',
            tipo: 'unidade',
            fatorCru: 1.0,
            precoUnitario: 3.50,
            unidadePadrao: 'maço',
            infoPreparo: 'Maços frescos higienizados'
        },
        {
            chaves: ['tomate'],
            nomeMercado: 'Tomate Longa Vida / Italiano',
            categoria: 'Vegetais & Saladas',
            tipo: 'peso',
            fatorCru: 1.05,
            precoKg: 7.90,
            unidadePadrao: 'kg',
            infoPreparo: 'Hortifrúti fresco'
        },
        {
            chaves: ['cenoura', 'beterraba', 'chuchu', 'abobrinha'],
            nomeMercado: 'Legumes Variados (Cenoura/Abobrinha/Beterraba)',
            categoria: 'Vegetais & Saladas',
            tipo: 'peso',
            fatorCru: 1.15,
            precoKg: 6.90,
            unidadePadrao: 'kg',
            infoPreparo: 'In natura cru'
        },

        // GORDURAS & MERCEARIA
        {
            chaves: ['azeite de oliva', 'azeite'],
            nomeMercado: 'Azeite de Oliva Extra Virgem (Vidro 500ml)',
            categoria: 'Gorduras & Mercearia',
            tipo: 'volume',
            fatorCru: 1.0,
            precoLitro: 78.00, // ~R$ 39 vidro de 500ml
            unidadePadrao: 'ml',
            infoPreparo: 'Vidro de 500ml'
        },
        {
            chaves: ['pasta de amendoim', 'amendoim'],
            nomeMercado: 'Pasta de Amendoim Integral 100% Pura (Pote 500g)',
            categoria: 'Gorduras & Mercearia',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 44.00, // ~R$ 22 por 500g
            unidadePadrao: 'g',
            infoPreparo: 'Potes de 500g ou 1kg'
        },
        {
            chaves: ['castanha', 'nozes', 'chia', 'linhaça'],
            nomeMercado: 'Castanhas Selecionadas / Sementes (Granel)',
            categoria: 'Gorduras & Mercearia',
            tipo: 'peso',
            fatorCru: 1.0,
            precoKg: 75.00,
            unidadePadrao: 'g',
            infoPreparo: 'A granel ou pacotes de 100g'
        }
    ];

    const GroceryFoods = {
        alimentos: [...BANCO_ALIMENTOS_PADRAO],
        listaCompras: [],
        resumoCalculado: null,
        periodoAtivo: 'semanal', // 'semanal' ou 'mensal'
        lastContainerId: 'modal-lista-compras-conteudo',

        init() {
            this.carregarAlimentosPersonalizados();
        },

        carregarAlimentosPersonalizados() {
            try {
                const salvos = JSON.parse(localStorage.getItem('apex_banco_alimentos') || '[]');
                if (salvos && salvos.length) {
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

        obterAlimentoPorNome(nome) {
            if (!nome) return null;
            const n = nome.toLowerCase().trim();
            return this.alimentos.find(a => a.nome.toLowerCase().trim() === n) || null;
        },

        buscar(termo = '', categoria = 'todos') {
            const t = (termo || '').toLowerCase().trim();
            const cat = (categoria || 'todos').toLowerCase().trim();

            return this.alimentos.filter(a => {
                const matchTexto = !t || a.nome.toLowerCase().includes(t) || (a.cat && a.cat.toLowerCase().includes(t));
                const matchCat = cat === 'todos' || (a.cat && a.cat.toLowerCase() === cat);
                return matchTexto && matchCat;
            });
        },

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

        formatarAlimentoTexto(itemCalculado) {
            if (!itemCalculado) return '';
            return `• ${itemCalculado.gramas}g ${itemCalculado.nome} (${itemCalculado.cal} kcal | P: ${itemCalculado.prot}g | C: ${itemCalculado.carb}g | G: ${itemCalculado.gord}g)`;
        },

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
        // PARSER & PROCESSADOR DE LISTA DE COMPRAS (CRU / SEMANAL / MENSAL)
        // ----------------------------------------------------------------------
        extrairQuantidadeELinha(linha) {
            const limpa = linha.replace(/^[-•*]\s*/, '').trim();
            if (!limpa || limpa.length < 3) return null;

            // Ignorar termos de preparo vazios ou bebidas livres sem compra
            const lower = limpa.toLowerCase();
            if (lower.startsWith('beba água') || lower.startsWith('água à vontade') || lower === 'água' || lower === 'agua') {
                return null;
            }

            let gramas = 0;
            let unidades = 0;
            let ml = 0;

            const matchG = limpa.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gramas?)\b/i);
            const matchMl = limpa.match(/(\d+(?:[.,]\d+)?)\s*(?:ml|litros?|l)\b/i);
            const matchColher = limpa.match(/(\d+(?:[.,]\d+)?)\s*(?:colheres?|c\.)(?:\s+de\s+(?:sopa|chá))?/i);
            const matchUn = limpa.match(/^(\d+(?:[.,]\d+)?)\s*(?:unidades?|un|fatias?|ovos?|bananas?|maçãs?)\b/i) ||
                            limpa.match(/(\d+(?:[.,]\d+)?)\s*(?:unidades?|un|fatias?|ovos?|bananas?|maçãs?)\b/i);

            if (matchG) {
                gramas = parseFloat(matchG[1].replace(',', '.'));
            } else if (matchMl) {
                ml = parseFloat(matchMl[1].replace(',', '.'));
            } else if (matchColher) {
                const c = parseFloat(matchColher[1].replace(',', '.'));
                ml = c * 13;
                gramas = c * 15;
            } else if (matchUn) {
                unidades = parseFloat(matchUn[1].replace(',', '.'));
            } else {
                const matchNum = limpa.match(/^(\d+(?:[.,]\d+)?)\s+([a-zA-ZÀ-ÿ]+)/);
                if (matchNum) {
                    unidades = parseFloat(matchNum[1].replace(',', '.'));
                }
            }

            return {
                textoOriginal: limpa,
                gramas,
                unidades,
                ml
            };
        },

        identificarAlimentoMercado(infoLinha) {
            const texto = infoLinha.textoOriginal.toLowerCase();

            for (const regra of TABELA_CONVERSAO_CRU) {
                for (const chave of regra.chaves) {
                    if (texto.includes(chave)) {
                        return regra;
                    }
                }
            }

            // Fallback genérico inteligente
            let cat = 'Gorduras & Mercearia';
            let precoKg = 16.0;
            let fatorCru = 1.0;

            if (texto.includes('fruta') || texto.includes('suco')) {
                cat = 'Frutas';
                precoKg = 8.0;
                fatorCru = 1.15;
            } else if (texto.includes('legume') || texto.includes('verdura') || texto.includes('folha') || texto.includes('salada')) {
                cat = 'Vegetais & Saladas';
                precoKg = 9.0;
                fatorCru = 1.20;
            } else if (texto.includes('carne') || texto.includes('peixe') || texto.includes('frango')) {
                cat = 'Proteínas & Carnes';
                precoKg = 28.0;
                fatorCru = 1.30;
            }

            return {
                chaves: [infoLinha.textoOriginal],
                nomeMercado: infoLinha.textoOriginal.replace(/^\d+\s*(?:g|ml|un|colheres?|de)?\s*/i, '').trim(),
                categoria: cat,
                tipo: 'peso',
                fatorCru: fatorCru,
                precoKg: precoKg,
                unidadePadrao: 'g',
                infoPreparo: 'Item avulso da prescrição'
            };
        },

        gerarListaAPartirDaDieta(dietas) {
            if (!dietas || !dietas.length) {
                this.listaCompras = [];
                this.resumoCalculado = null;
                return [];
            }

            const mapaItens = new Map();

            dietas.forEach(d => {
                const textoCompleto = (d.alimentos || '') + '\n' + (d.substituicoes || '');
                const linhas = textoCompleto.split(/(?:\r?\n|;|\s*•\s*|\s*[*]\s*|^\s*-\s+|\s+-\s+)/);

                linhas.forEach(linha => {
                    const parsed = this.extrairQuantidadeELinha(linha);
                    if (!parsed) return;

                    const regra = this.identificarAlimentoMercado(parsed);
                    const chaveMapa = regra.nomeMercado;

                    if (!mapaItens.has(chaveMapa)) {
                        mapaItens.set(chaveMapa, {
                            regra: regra,
                            nomeMercado: regra.nomeMercado,
                            categoria: regra.categoria,
                            tipo: regra.tipo,
                            diarioGramasPrescrito: 0,
                            diarioUnidadesPrescrito: 0,
                            diarioMlPrescrito: 0,
                            exemplosTextos: []
                        });
                    }

                    const item = mapaItens.get(chaveMapa);
                    if (parsed.gramas > 0) item.diarioGramasPrescrito += parsed.gramas;
                    if (parsed.unidades > 0) item.diarioUnidadesPrescrito += parsed.unidades;
                    if (parsed.ml > 0) item.diarioMlPrescrito += parsed.ml;
                    if (item.exemplosTextos.length < 2 && !item.exemplosTextos.includes(parsed.textoOriginal)) {
                        item.exemplosTextos.push(parsed.textoOriginal);
                    }
                });
            });

            // Recupera marcações anteriores se houver
            let checados = {};
            try {
                checados = JSON.parse(localStorage.getItem('rfh_lista_compras_check') || '{}');
            } catch (e) { }

            const itensProcessados = [];
            let totalCustoSemanalGeral = 0;
            let totalCustoMensalGeral = 0;

            mapaItens.forEach(item => {
                const r = item.regra;
                let qtdSemanalCruStr = '';
                let qtdMensalCruStr = '';
                let custoSemanalEst = 0;
                let custoMensalEst = 0;
                let prescricaoDiariaStr = '';

                if (r.tipo === 'unidade') {
                    const unDia = item.diarioUnidadesPrescrito || (item.diarioGramasPrescrito && r.pesoMedioUnidade ? Math.ceil(item.diarioGramasPrescrito / r.pesoMedioUnidade) : 1);
                    const unSemana = Math.ceil(unDia * 7);
                    const unMes = Math.ceil(unDia * 30);

                    prescricaoDiariaStr = `${unDia} un/dia`;
                    if (r.chaves.includes('ovo')) {
                        qtdSemanalCruStr = `${unSemana} un (~${Math.max(1, Math.ceil(unSemana / 30))} cartela c/ 30)`;
                        qtdMensalCruStr = `${unMes} un (${Math.ceil(unMes / 30)} cartelas c/ 30)`;
                        custoSemanalEst = unSemana * (r.precoUnitario || 0.80);
                        custoMensalEst = unMes * (r.precoUnitario || 0.80);
                    } else if (r.chaves.includes('salada')) {
                        qtdSemanalCruStr = `2 maços frescos`;
                        qtdMensalCruStr = `8 maços frescos`;
                        custoSemanalEst = 2 * (r.precoUnitario || 3.50);
                        custoMensalEst = 8 * (r.precoUnitario || 3.50);
                    } else {
                        qtdSemanalCruStr = `${unSemana} unidades`;
                        qtdMensalCruStr = `${unMes} unidades`;
                        custoSemanalEst = unSemana * (r.precoUnitario || 1.0);
                        custoMensalEst = unMes * (r.precoUnitario || 1.0);
                    }
                } else if (r.tipo === 'volume') {
                    const mlDia = item.diarioMlPrescrito || item.diarioGramasPrescrito || 15;
                    const mlSemana = Math.round(mlDia * 7);
                    const mlMes = Math.round(mlDia * 30);

                    prescricaoDiariaStr = mlDia >= 1000 ? `${(mlDia / 1000).toFixed(1)}L/dia` : `${mlDia}ml/dia`;
                    qtdSemanalCruStr = mlSemana >= 1000 ? `${(mlSemana / 1000).toFixed(2)} Litros` : `${mlSemana} ml`;
                    qtdMensalCruStr = mlMes >= 1000 ? `${(mlMes / 1000).toFixed(2)} Litros` : `${mlMes} ml`;

                    const precoPorMl = (r.precoLitro || 10.0) / 1000;
                    custoSemanalEst = mlSemana * precoPorMl;
                    custoMensalEst = mlMes * precoPorMl;
                } else {
                    const gDiaPrescrito = item.diarioGramasPrescrito || 100;
                    const gDiaCru = gDiaPrescrito * (r.fatorCru || 1.0);
                    const gSemanaCru = Math.round(gDiaCru * 7);
                    const gMesCru = Math.round(gDiaCru * 30);

                    prescricaoDiariaStr = `${gDiaPrescrito}g pronto/dia`;
                    qtdSemanalCruStr = gSemanaCru >= 1000 ? `${(gSemanaCru / 1000).toFixed(2)} kg (cru)` : `${gSemanaCru}g (cru)`;
                    qtdMensalCruStr = gMesCru >= 1000 ? `${(gMesCru / 1000).toFixed(2)} kg (cru)` : `${gMesCru}g (cru)`;

                    const precoPorGrama = (r.precoKg || 20.0) / 1000;
                    custoSemanalEst = gSemanaCru * precoPorGrama;
                    custoMensalEst = gMesCru * precoPorGrama;
                }

                totalCustoSemanalGeral += custoSemanalEst;
                totalCustoMensalGeral += custoMensalEst;

                itensProcessados.push({
                    nome: item.nomeMercado,
                    nomeMercado: item.nomeMercado,
                    categoria: item.categoria,
                    prescricaoDiaria: prescricaoDiariaStr,
                    qtdSemanalCru: qtdSemanalCruStr,
                    qtdMensalCru: qtdMensalCruStr,
                    custoSemanal: custoSemanalEst,
                    custoMensal: custoMensalEst,
                    custoSemanalFormatado: `R$ ${custoSemanalEst.toFixed(2).replace('.', ',')}`,
                    custoMensalFormatado: `R$ ${custoMensalEst.toFixed(2).replace('.', ',')}`,
                    infoPreparo: r.infoPreparo || '',
                    comprado: Boolean(checados[item.nomeMercado])
                });
            });

            this.listaCompras = itensProcessados;
            this.resumoCalculado = {
                totalItens: itensProcessados.length,
                totalCustoSemanal: totalCustoSemanalGeral,
                totalCustoMensal: totalCustoMensalGeral,
                totalCustoSemanalFormatado: `R$ ${totalCustoSemanalGeral.toFixed(2).replace('.', ',')}`,
                totalCustoMensalFormatado: `R$ ${totalCustoMensalGeral.toFixed(2).replace('.', ',')}`
            };

            return itensProcessados;
        },

        alternarModoPeriodo(modo) {
            this.periodoAtivo = modo === 'mensal' ? 'mensal' : 'semanal';
            this.renderModalListaCompras(this.lastContainerId);
        },

        toggleComprado(nome, checked) {
            const item = this.listaCompras.find(i => i.nomeMercado === nome || i.nome === nome);
            if (item) {
                item.comprado = checked;
                try {
                    let checados = JSON.parse(localStorage.getItem('rfh_lista_compras_check') || '{}');
                    checados[item.nomeMercado] = checked;
                    localStorage.setItem('rfh_lista_compras_check', JSON.stringify(checados));
                } catch (e) { }
            }
            this.renderModalListaCompras(this.lastContainerId);
        },

        // ----------------------------------------------------------------------
        // RENDERIZAÇÃO DO MODAL COM UI/UX FLUIDA & TOGGLE SEMANAL / MENSAL
        // ----------------------------------------------------------------------
        renderModalListaCompras(containerId) {
            const targetId = containerId || this.lastContainerId || 'modal-lista-compras-conteudo';
            this.lastContainerId = targetId;
            const container = document.getElementById(targetId);
            if (!container) return;

            if (!this.listaCompras || !this.listaCompras.length) {
                container.innerHTML = `
                    <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
                        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                            <i data-lucide="shopping-cart" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-lg font-bold text-white">Nenhum plano alimentar carregado</h3>
                        <p class="text-xs text-slate-400 max-w-sm mx-auto">Cadastre refeições na dieta para que a lista de compras crua semanal e mensal seja gerada automaticamente.</p>
                        <button type="button" onclick="fecharListaCompras()" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer">Fechar</button>
                    </div>`;
                if (window.lucide) window.lucide.createIcons();
                return;
            }

            const isMensal = this.periodoAtivo === 'mensal';
            const categorias = {};
            this.listaCompras.forEach(item => {
                categorias[item.categoria] = categorias[item.categoria] || [];
                categorias[item.categoria].push(item);
            });

            const total = this.listaCompras.length;
            const comprados = this.listaCompras.filter(i => i.comprado).length;
            const resumo = this.resumoCalculado || {
                totalCustoSemanalFormatado: 'R$ 0,00',
                totalCustoMensalFormatado: 'R$ 0,00'
            };

            const nomeNutri = window.nomeProfissionalVinculado || 'Dra. Camila Siqueira';
            const crnNutri = window.registroProfissionalVinculado || 'CRN-6 12345/PE';

            container.innerHTML = `
                <div class="glass-panel p-4 sm:p-6 md:p-7 rounded-3xl border border-lime-500/25 space-y-4 sm:space-y-5 shadow-2xl relative bg-[#090d16]/95 backdrop-blur-2xl">
                    <!-- Topo do Modal com Fechar e Ações -->
                    <div class="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-800/90 gap-2 sm:gap-3">
                        <div class="min-w-0 flex-1">
                            <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5 mb-1">
                                <i data-lucide="shopping-cart" class="w-3.5 h-3.5 shrink-0"></i>ORGANIZAÇÃO & ECONOMIA
                            </span>
                            <h2 class="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                <span>Lista de Compras Inteligente</span> 🛒
                            </h2>
                            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                                Quantidade de alimentos a comprar em estado <strong class="text-lime-300">CRU</strong> no mercado com base no rendimento da sua dieta.
                            </p>
                        </div>
                        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <button type="button" onclick="fecharListaCompras()" class="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer active:scale-95" title="Fechar" aria-label="Fechar">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Card com Dados do Nutricionista Responsável -->
                    <div class="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-lime-500/20 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center shrink-0 text-lime-400">
                                <i data-lucide="stethoscope" class="w-5 h-5"></i>
                            </div>
                            <div class="min-w-0">
                                <span class="text-[10px] uppercase font-bold text-slate-400 block truncate">Nutricionista Responsável</span>
                                <h4 class="text-xs sm:text-sm font-black text-white truncate">${nomeNutri}</h4>
                                <span class="text-[10px] text-lime-400 font-bold block truncate">${crnNutri}</span>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-[9px] uppercase font-bold text-slate-400 block">Emissão do Plano</span>
                            <span class="text-xs font-extrabold text-slate-200">${new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>

                    <!-- Seletor de Período: Semanal (7 dias) vs Mensal (30 dias) -->
                    <div class="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5">
                        <button type="button" onclick="ApexAlimentos.alternarModoPeriodo('semanal')"
                            class="flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${!isMensal ? 'bg-gradient-to-r from-lime-500 to-emerald-400 text-slate-950 font-black shadow-md shadow-lime-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            <span>Semanal (7 Dias)</span>
                        </button>
                        <button type="button" onclick="ApexAlimentos.alternarModoPeriodo('mensal')"
                            class="flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${isMensal ? 'bg-gradient-to-r from-lime-500 to-emerald-400 text-slate-950 font-black shadow-md shadow-lime-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}">
                            <i data-lucide="calendar-range" class="w-3.5 h-3.5"></i>
                            <span>Mensal (30 Dias)</span>
                        </button>
                    </div>

                    <!-- Métricas de Custo e Progresso de Compras -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                        <div class="bg-slate-950/90 p-3 rounded-xl border border-slate-800/90 text-center">
                            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Estimativa Semanal</span>
                            <strong class="text-sm sm:text-base font-black text-lime-400 mt-0.5 block">${resumo.totalCustoSemanalFormatado}</strong>
                            <span class="text-[9px] text-slate-500 block">7 dias de dieta</span>
                        </div>
                        <div class="bg-slate-950/90 p-3 rounded-xl border border-slate-800/90 text-center">
                            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Estimativa Mensal</span>
                            <strong class="text-sm sm:text-base font-black text-emerald-400 mt-0.5 block">${resumo.totalCustoMensalFormatado}</strong>
                            <span class="text-[9px] text-slate-500 block">30 dias de dieta</span>
                        </div>
                        <div class="col-span-2 sm:col-span-1 bg-slate-950/90 p-3 rounded-xl border border-slate-800/90 text-center flex flex-col justify-center">
                            <span class="text-[10px] text-slate-400 font-semibold uppercase block">Progresso no Mercado</span>
                            <strong class="text-sm sm:text-base font-black text-amber-300 mt-0.5 block">${comprados} / ${total} itens</strong>
                            <span class="text-[9px] text-slate-500 block">${total > 0 ? Math.round((comprados / total) * 100) : 0}% no carrinho</span>
                        </div>
                    </div>

                    <!-- Botões de Ação para Exportação PDF e Envio WhatsApp -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <button type="button" onclick="ApexAlimentos.gerarPdfListaCompras()" id="btn-compras-pdf"
                            class="w-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                            <i data-lucide="file-text" class="w-4 h-4"></i>
                            <span>Gerar PDF com Logo & Nutricionista 📄</span>
                        </button>
                        <button type="button" onclick="ApexAlimentos.enviarPdfWhatsApp()" id="btn-compras-whatsapp"
                            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                            <i data-lucide="share-2" class="w-4 h-4"></i>
                            <span>Enviar PDF via WhatsApp 📲</span>
                        </button>
                    </div>

                    <!-- Alerta explicativo sobre o cálculo de peso cru -->
                    <div class="p-2.5 sm:p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-[11px] text-lime-300 flex items-start gap-2">
                        <i data-lucide="info" class="w-4 h-4 text-lime-400 shrink-0 mt-0.5"></i>
                        <span class="leading-relaxed">
                            <strong>Dica do Nutri:</strong> Carnes perdem ~25% de água ao grelhar (ex: 150g pronto precisa de ~200g cru). Já grãos como arroz e feijão absorvem água e expandem 2.5x ao cozinhar (ex: 150g arroz cozido precisa de apenas ~60g arroz cru). Os valores abaixo já estão calculados para compra in natura!
                        </span>
                    </div>

                    <!-- Categorias de Alimentos em Grid Fluido -->
                    <div class="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
                        ${Object.keys(categorias).map(cat => {
                            const itensCat = categorias[cat];
                            return `
                                <div class="bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800/90 space-y-2.5">
                                    <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                        <span class="text-xs font-black uppercase text-lime-400 tracking-wider flex items-center gap-1.5">
                                            <span>${cat}</span>
                                        </span>
                                        <span class="text-[10px] text-slate-400 font-semibold">${itensCat.length} itens</span>
                                    </div>
                                    <div class="space-y-2">
                                        ${itensCat.map((item) => {
                                            const qtdCru = isMensal ? item.qtdMensalCru : item.qtdSemanalCru;
                                            const custo = isMensal ? item.custoMensalFormatado : item.custoSemanalFormatado;
                                            return `
                                                <div class="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 flex items-start justify-between gap-3 transition-colors">
                                                    <label class="flex items-start gap-2.5 cursor-pointer min-w-0 flex-1 select-none">
                                                        <input type="checkbox" ${item.comprado ? 'checked' : ''} onchange="ApexAlimentos.toggleComprado('${item.nomeMercado.replace(/'/g, "\\'")}', this.checked)" class="mt-1 w-4 h-4 rounded accent-lime-500 shrink-0 cursor-pointer">
                                                        <div class="min-w-0 flex-1">
                                                            <div class="text-xs font-bold ${item.comprado ? 'line-through text-slate-500' : 'text-slate-100'} break-words">
                                                                ${item.nomeMercado}
                                                            </div>
                                                            <div class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                                                <span>Prescrito: <strong class="text-slate-300">${item.prescricaoDiaria}</strong></span>
                                                                ${item.infoPreparo ? `<span class="text-slate-500">• ${item.infoPreparo}</span>` : ''}
                                                            </div>
                                                        </div>
                                                    </label>
                                                    <div class="text-right shrink-0">
                                                        <span class="inline-block text-[11px] sm:text-xs font-black text-lime-400 bg-lime-500/10 border border-lime-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                            ${qtdCru}
                                                        </span>
                                                        <span class="block text-[10px] text-slate-400 font-bold mt-1">
                                                            ~${custo}
                                                        </span>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        },

        // ----------------------------------------------------------------------
        // GERAÇÃO DE PDF PROFISSIONAL COM LOGO DO SITE & DADOS DO NUTRICIONISTA
        // ----------------------------------------------------------------------
        montarHtmlPdfListaCompras(listaParam, nomeAlunoParam) {
            const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            const nomeAluno = nomeAlunoParam || window.nomeAlunoAtual || 'Aluno Real Fit Hub';
            const nomeNutri = window.nomeProfissionalVinculado || 'Dra. Camila Siqueira';
            const crnNutri = window.registroProfissionalVinculado || 'CRN-6 12345/PE';
            const espNutri = window.especialidadeProfissionalVinculado || 'Nutrição Clínica & Esportiva de Alta Performance';
            const resumo = this.resumoCalculado || {
                totalCustoSemanalFormatado: 'R$ 0,00',
                totalCustoMensalFormatado: 'R$ 0,00'
            };

            const itens = (listaParam && Array.isArray(listaParam) ? listaParam : this.listaCompras) || [];
            const categorias = {};
            itens.forEach(item => {
                categorias[item.categoria] = categorias[item.categoria] || [];
                categorias[item.categoria].push(item);
            });

            let linhasTabelaHtml = '';
            for (const cat in categorias) {
                linhasTabelaHtml += `
                    <tr style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;border-bottom:1.5px solid #cbd5e1;">
                        <td colspan="5" style="padding:6px 10px;font-size:11px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">
                            📂 ${cat} (${categorias[cat].length} itens)
                        </td>
                    </tr>
                `;

                categorias[cat].forEach(item => {
                    linhasTabelaHtml += `
                        <tr style="border-bottom:1px solid #e2e8f0;font-size:10px;">
                            <td style="padding:6px 8px;color:#0f172a;font-weight:700;">
                                ${item.nomeMercado}
                                ${item.infoPreparo ? `<div style="font-size:8.5px;color:#64748b;font-weight:400;">(${item.infoPreparo})</div>` : ''}
                            </td>
                            <td style="padding:6px 8px;text-align:center;color:#475569;white-space:nowrap;">
                                ${item.prescricaoDiaria}
                            </td>
                            <td style="padding:6px 8px;text-align:center;font-weight:800;color:#166534;background:#f0fdf4;white-space:nowrap;">
                                ${item.qtdSemanalCru}
                            </td>
                            <td style="padding:6px 8px;text-align:center;font-weight:800;color:#0369a1;background:#f0f9ff;white-space:nowrap;">
                                ${item.qtdMensalCru}
                            </td>
                            <td style="padding:6px 8px;text-align:right;font-weight:800;color:#0f172a;white-space:nowrap;">
                                Sem: ${item.custoSemanalFormatado}<br>
                                <span style="font-size:9px;color:#059669;">Mês: ${item.custoMensalFormatado}</span>
                            </td>
                        </tr>
                    `;
                });
            }

            return `
                <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#0f172a;max-width:800px;margin:0 auto;background:#ffffff;padding:24px;box-sizing:border-box;">
                    <!-- Cabeçalho Oficial com Logo e Metadados -->
                    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #10b981;padding-bottom:14px;margin-bottom:14px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <img src="assets/icon-192.png" alt="Real Fit Hub" style="width:52px;height:52px;border-radius:12px;object-fit:cover;">
                            <div>
                                <div style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.03em;">
                                    REAL FIT<span style="color:#eab308;"> HUB</span>
                                </div>
                                <div style="font-size:10px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:0.05em;">
                                    Nutrição Clínica & Alta Performance • Lista de Compras Inteligente
                                </div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#047857;font-size:9.5px;font-weight:800;padding:3px 10px;border-radius:999px;display:inline-block;text-transform:uppercase;">
                                Supermercado & Hortifrúti
                            </div>
                            <div style="font-size:10px;color:#64748b;margin-top:4px;">Emissão: <strong>${dataHoje}</strong></div>
                        </div>
                    </div>

                    <!-- Dados do Aluno e do Nutricionista Responsável -->
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;margin-bottom:14px;display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;">
                        <div>
                            <div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:700;">Aluno(a) / Paciente:</div>
                            <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:2px;">${nomeAluno}</div>
                        </div>
                        <div>
                            <div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:700;">Nutricionista Responsável:</div>
                            <div style="font-size:12px;font-weight:800;color:#059669;margin-top:2px;">${nomeNutri}</div>
                            <div style="font-size:9px;color:#64748b;">${crnNutri} • ${espNutri}</div>
                        </div>
                        <div>
                            <div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:700;">Objetivo da Lista:</div>
                            <div style="font-size:11px;font-weight:700;color:#0284c7;margin-top:2px;">Planejamento Semanal e Mensal em Estado Cru</div>
                        </div>
                    </div>

                    <!-- Resumo Financeiro Estimado -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
                        <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);border:1.5px solid #86efac;border-radius:10px;padding:10px 14px;text-align:center;">
                            <div style="font-size:9.5px;font-weight:800;color:#166534;text-transform:uppercase;">Estimativa Total de Compra Semanal (7 dias)</div>
                            <div style="font-size:18px;font-weight:900;color:#15803d;margin-top:2px;">${resumo.totalCustoSemanalFormatado}</div>
                            <div style="font-size:8.5px;color:#166534;">Rendimento exato para as porções prescritas na semana</div>
                        </div>
                        <div style="background:linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);border:1.5px solid #a5f3fc;border-radius:10px;padding:10px 14px;text-align:center;">
                            <div style="font-size:9.5px;font-weight:800;color:#0e7490;text-transform:uppercase;">Estimativa Total de Compra Mensal (30 dias)</div>
                            <div style="font-size:18px;font-weight:900;color:#0891b2;margin-top:2px;">${resumo.totalCustoMensalFormatado}</div>
                            <div style="font-size:8.5px;color:#0e7490;">Ideal para compras em atacado / feiras mensais</div>
                        </div>
                    </div>

                    <!-- Nota técnica sobre o peso cru -->
                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:9.5px;color:#92400e;line-height:1.4;">
                        <strong>⚠️ Como utilizar esta lista:</strong> Os valores de peso informados abaixo referem-se à quantidade de alimento <strong>CRU / BRUTO</strong> a comprar no supermercado, açougue ou feira. O nutricionista calculou o fator de rendimento após o cozimento para que seu prato final tenha a gramatura exata prescrita.
                    </div>

                    <!-- Tabela de Alimentos -->
                    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                        <thead>
                            <tr style="background:#0f172a;color:#ffffff;font-size:9.5px;text-transform:uppercase;">
                                <th style="padding:8px;text-align:left;border-top-left-radius:6px;">Alimento a Comprar no Mercado</th>
                                <th style="padding:8px;text-align:center;">Prescrição Diária</th>
                                <th style="padding:8px;text-align:center;">Compra Semanal (Cru)</th>
                                <th style="padding:8px;text-align:center;">Compra Mensal (Cru)</th>
                                <th style="padding:8px;text-align:right;border-top-right-radius:6px;">Estimativa (R$)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasTabelaHtml}
                        </tbody>
                    </table>

                    <!-- Rodapé com Assinatura e Validação -->
                    <div style="border-top:1.5px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#94a3b8;">
                        <div>
                            <strong>Real Fit Hub Digital Platform</strong> • Documento emitido digitalmente para uso exclusivo do paciente.
                        </div>
                        <div style="text-align:right;color:#059669;font-weight:700;">
                            Prescrição: ${nomeNutri} (${crnNutri})
                        </div>
                    </div>
                </div>
            `;
        },

        async gerarPdfListaCompras() {
            if (!this.listaCompras || !this.listaCompras.length) {
                if (window.showToast) window.showToast('Aviso', 'Nenhum item na lista para gerar PDF.', 'info');
                return;
            }

            const btn = document.getElementById('btn-compras-pdf');
            const textoOriginal = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Gerando PDF da Lista...';
            }

            // Cria container temporário fora da tela mas no fluxo de renderização para o html2canvas
            let containerPdf = document.getElementById('area-impressao-pdf-compras');
            if (!containerPdf) {
                containerPdf = document.createElement('div');
                containerPdf.id = 'area-impressao-pdf-compras';
                document.body.appendChild(containerPdf);
            }

            containerPdf.innerHTML = this.montarHtmlPdfListaCompras();
            containerPdf.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#ffffff;z-index:-999;display:block;';

            const nomeAluno = (window.nomeAlunoAtual || 'Aluno').replace(/[^a-zA-Z0-9]/g, '_');
            const nomeArquivo = `Lista_Compras_Inteligente_${nomeAluno}_RealFitHub.pdf`;

            const restaurar = () => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = textoOriginal;
                }
                containerPdf.style.display = 'none';
                containerPdf.innerHTML = '';
            };

            if (typeof html2pdf !== 'undefined') {
                try {
                    const opt = {
                        margin: [6, 6, 6, 6],
                        filename: nomeArquivo,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                    };

                    await html2pdf().set(opt).from(containerPdf.firstElementChild).save();
                    restaurar();
                    if (window.showToast) {
                        window.showToast('PDF Gerado com Sucesso! 📄', 'Lista de compras com logo e dados do nutri baixada.', 'success');
                    }
                } catch (e) {
                    console.error('Erro ao gerar PDF da lista de compras:', e);
                    restaurar();
                    window.print();
                }
            } else {
                restaurar();
                window.print();
            }
        },

        // ----------------------------------------------------------------------
        // ENVIAR PDF VIA WHATSAPP (WEB SHARE API COM ARQUIVO PDF + LINK)
        // ----------------------------------------------------------------------
        async enviarPdfWhatsApp() {
            if (!this.listaCompras || !this.listaCompras.length) {
                if (window.showToast) window.showToast('Aviso', 'Nenhum item na lista para compartilhar.', 'info');
                return;
            }

            const btn = document.getElementById('btn-compras-whatsapp');
            const textoOriginal = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Preparando Envio...';
            }

            const nomeAluno = window.nomeAlunoAtual || 'Aluno Real Fit Hub';
            const nomeNutri = window.nomeProfissionalVinculado || 'Dra. Camila Siqueira';
            const crnNutri = window.registroProfissionalVinculado || 'CRN-6 12345/PE';
            const resumo = this.resumoCalculado || {
                totalCustoSemanalFormatado: 'R$ 0,00',
                totalCustoMensalFormatado: 'R$ 0,00'
            };

            // Monta texto formatado e elegante para a mensagem de WhatsApp
            let textoMsg = `*🛒 REAL FIT HUB - LISTA DE COMPRAS INTELIGENTE*\n`;
            textoMsg += `👤 *Aluno(a):* ${nomeAluno}\n`;
            textoMsg += `🥗 *Nutricionista:* ${nomeNutri} (${crnNutri})\n`;
            textoMsg += `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;

            textoMsg += `*💰 ESTIMATIVA DE CUSTOS DE MERCADO (CRU):*\n`;
            textoMsg += `• Total Semanal (7 dias): *${resumo.totalCustoSemanalFormatado}*\n`;
            textoMsg += `• Total Mensal (30 dias): *${resumo.totalCustoMensalFormatado}*\n\n`;

            textoMsg += `*📋 ITENS A COMPRAR NO MERCADO (ESTADO CRU):*\n`;
            this.listaCompras.slice(0, 15).forEach(i => {
                textoMsg += `• *${i.nomeMercado}* [${i.categoria}]\n`;
                textoMsg += `   - Prescrito: ${i.prescricaoDiaria}\n`;
                textoMsg += `   - Semanal: ${i.qtdSemanalCru} (~${i.custoSemanalFormatado})\n`;
                textoMsg += `   - Mensal: ${i.qtdMensalCru} (~${i.custoMensalFormatado})\n`;
            });

            if (this.listaCompras.length > 15) {
                textoMsg += `\n_... e mais ${this.listaCompras.length - 15} itens calculados no documento._\n`;
            }

            textoMsg += `\n📄 *O PDF oficial detalhado com logomarca e dados do nutricionista foi gerado e baixado no dispositivo!*`;

            const restaurar = () => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = textoOriginal;
                }
            };

            try {
                // Tenta gerar o blob do PDF para compartilhamento nativo de arquivo
                let containerPdf = document.getElementById('area-impressao-pdf-compras');
                if (!containerPdf) {
                    containerPdf = document.createElement('div');
                    containerPdf.id = 'area-impressao-pdf-compras';
                    document.body.appendChild(containerPdf);
                }
                containerPdf.innerHTML = this.montarHtmlPdfListaCompras();
                containerPdf.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#ffffff;z-index:-999;display:block;';

                const nomeArquivo = `Lista_Compras_${nomeAluno.replace(/[^a-zA-Z0-9]/g, '_')}_RealFitHub.pdf`;

                if (typeof html2pdf !== 'undefined') {
                    const opt = {
                        margin: [6, 6, 6, 6],
                        filename: nomeArquivo,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    const pdfBlob = await html2pdf().set(opt).from(containerPdf.firstElementChild).output('blob');
                    containerPdf.style.display = 'none';
                    containerPdf.innerHTML = '';

                    const pdfFile = new File([pdfBlob], nomeArquivo, { type: 'application/pdf' });

                    // Se o navegador móvel suportar envio nativo de arquivos (Android/iOS)
                    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                        await navigator.share({
                            files: [pdfFile],
                            title: 'Lista de Compras Real Fit Hub',
                            text: `Olá! Segue a Lista de Compras Inteligente do Real Fit Hub de ${nomeAluno}.\nNutricionista: ${nomeNutri} (${crnNutri})`
                        });
                        restaurar();
                        if (window.showToast) window.showToast('Enviado com Sucesso! 📲', 'PDF compartilhado no WhatsApp.', 'success');
                        return;
                    }

                    // Fallback: faz download do arquivo e abre WhatsApp com mensagem preenchida
                    const urlBlob = URL.createObjectURL(pdfBlob);
                    const linkDownload = document.createElement('a');
                    linkDownload.href = urlBlob;
                    linkDownload.download = nomeArquivo;
                    linkDownload.click();
                    setTimeout(() => URL.revokeObjectURL(urlBlob), 5000);
                }

                restaurar();
                const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMsg)}`;
                window.open(zapUrl, '_blank');

                if (window.showToast) {
                    window.showToast('PDF Baixado & WhatsApp Aberto! 📲', 'Anexe o PDF que foi salvo no seu dispositivo.', 'success');
                }
            } catch (err) {
                console.error('Erro no compartilhamento:', err);
                restaurar();
                const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMsg)}`;
                window.open(zapUrl, '_blank');
            }
        },

        // Atalho de compatibilidade com versões legadas
        compartilharWhatsApp() {
            this.enviarPdfWhatsApp();
        }
    };

    window.ApexAlimentos = GroceryFoods;
    GroceryFoods.init();
})(window);
