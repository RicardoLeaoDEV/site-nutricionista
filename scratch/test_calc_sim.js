// Test full calculator engine in Node.js
function extrairNumero(val, padrao = 0) {
    if (val === null || val === undefined || val === '') return padrao;
    const str = String(val).replace(',', '.').trim();
    const num = parseFloat(str);
    return isNaN(num) ? padrao : num;
}

const PRESETS_MACROS = {
    cutting_agressivo: { nome: '🔥 Cutting', p_gkg: 2.3, g_gkg: 0.7, objetivo: 'deficit_agressivo', btnId: 'preset-btn-cutting' },
    emagrecimento_saudavel: { nome: '⚖️ Emagrecer', p_gkg: 2.0, g_gkg: 0.8, objetivo: 'deficit_moderado', btnId: 'preset-btn-emagrecimento' },
    bulking_hipertrofia: { nome: '💪 Hipertrofia', p_gkg: 1.8, g_gkg: 1.0, objetivo: 'superavit_moderado', btnId: 'preset-btn-bulking' },
    manutencao: { nome: '⚡ Manutenção', p_gkg: 1.6, g_gkg: 0.9, objetivo: 'manutencao', btnId: 'preset-btn-manutencao' }
};

const deltas = {
    deficit_moderado: { mult: 0.80, desc: 'Déficit planejado (-20%)', presetKey: 'emagrecimento_saudavel' },
    deficit_agressivo: { mult: 0.75, desc: 'Cutting agressivo (-25%)', presetKey: 'cutting_agressivo' },
    manutencao: { mult: 1.00, desc: 'Manutenção (0%)', presetKey: 'manutencao' },
    superavit_moderado: { mult: 1.12, desc: 'Hipertrofia (+12%)', presetKey: 'bulking_hipertrofia' },
    superavit_agressivo: { mult: 1.20, desc: 'Bulking (+20%)', presetKey: null }
};

function calcularTMB(peso, alturaCm, idade, sexo, bf) {
    const temBf = bf !== null && !isNaN(bf) && bf >= 3 && bf <= 60;
    if (temBf) {
        const lbm = peso * (1 - (bf / 100));
        const tmb = Math.round(370 + (21.6 * lbm));
        return { tmb, formula: 'katch_mcardle', lbm: parseFloat(lbm.toFixed(1)) };
    }
    const tmb = sexo === 'masculino'
        ? Math.round((10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5)
        : Math.round((10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161);
    return { tmb, formula: 'mifflin', lbm: null };
}

// Scenario 1: User enters 14 BF, male 25yo 75kg 175cm, Bulking Intenso (+20%)
const resTMB = calcularTMB(75, 175, 25, 'masculino', 14);
console.log('TMB with 14% BF:', resTMB);

const tdee = Math.round(resTMB.tmb * 1.55);
const objInfo = deltas.superavit_agressivo;
const vetAlvo = Math.round(tdee * objInfo.mult);
const deltaKcal = vetAlvo - tdee;

console.log('TDEE:', tdee);
console.log('VET Alvo:', vetAlvo);
console.log('Delta Kcal:', deltaKcal > 0 ? `+${deltaKcal}` : deltaKcal, objInfo.desc);

// Macros allocation for Bulking
const P = Math.round(75 * 2.0);
const G = Math.round(75 * 0.85);
const C = Math.round((vetAlvo - (P*4 + G*9)) / 4);
const total = (P*4) + (C*4) + (G*9);

console.log(`Macros: P=${P}g (${P*4}kcal), C=${C}g (${C*4}kcal), G=${G}g (${G*9}kcal), Total=${total}kcal`);
console.log('Balance match:', total === vetAlvo);
