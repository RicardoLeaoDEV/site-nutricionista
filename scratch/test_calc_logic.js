// Test calculation logic for sports nutrition calculator

function calcularMetabolismo({ peso, idade, alturaCm, sexo, atividade, objetivo, bf }) {
    let tmb = 0;
    let formulaUsada = 'mifflin';
    let lbmKg = null;

    const temBf = !isNaN(bf) && bf !== null && bf >= 3 && bf <= 60;
    if (temBf) {
        lbmKg = peso * (1 - (bf / 100));
        tmb = Math.round(370 + (21.6 * lbmKg));
        formulaUsada = 'katch_mcardle';
    } else {
        if (sexo === 'masculino') {
            tmb = Math.round((10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5);
        } else {
            tmb = Math.round((10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161);
        }
        formulaUsada = 'mifflin';
    }

    const fatoresAtividade = {
        sedentario: 1.20,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725,
        extremo: 1.90
    };
    const fator = fatoresAtividade[atividade] || 1.55;
    const tdee = Math.round(tmb * fator);

    const deltas = {
        deficit_moderado: { mult: 0.80, desc: 'Déficit planejado (-20%)' },
        deficit_agressivo: { mult: 0.75, desc: 'Cutting agressivo (-25%)' },
        manutencao: { mult: 1.00, desc: 'Manutenção (0%)' },
        superavit_moderado: { mult: 1.12, desc: 'Hipertrofia (+12%)' },
        superavit_agressivo: { mult: 1.20, desc: 'Bulking (+20%)' }
    };
    const objInfo = deltas[objetivo] || { mult: 0.80, desc: 'Déficit planejado (-20%)' };
    const vetAlvo = Math.round(tdee * objInfo.mult);
    const deltaKcal = vetAlvo - tdee;

    return { tmb, tdee, vetAlvo, deltaKcal, formulaUsada, lbmKg, objDesc: objInfo.desc };
}

// Test Case 1: Roger with Mifflin (No BF), Emagrecimento (-20%)
const res1 = calcularMetabolismo({ peso: 75, idade: 25, alturaCm: 175, sexo: 'masculino', atividade: 'moderado', objetivo: 'deficit_moderado', bf: null });
console.log('Test 1 (Mifflin -20%):', res1);

// Test Case 2: Roger with BF 14% -> Katch-McArdle, Bulking (+20%)
const res2 = calcularMetabolismo({ peso: 75, idade: 25, alturaCm: 175, sexo: 'masculino', atividade: 'moderado', objetivo: 'superavit_agressivo', bf: 14 });
console.log('Test 2 (Katch-McArdle +20%):', res2);

// Verification:
// LBM = 75 * 0.86 = 64.5 kg
// TMB = 370 + 21.6 * 64.5 = 1763 kcal
// TDEE = 1763 * 1.55 = 2733 kcal
// VET = 2733 * 1.20 = 3280 kcal
// Delta = +547 kcal
if (res2.formulaUsada !== 'katch_mcardle' || res2.tmb !== 1763 || res2.deltaKcal <= 0) {
    throw new Error('Test 2 calculation failed!');
}
console.log('Math logic is 100% correct!');
