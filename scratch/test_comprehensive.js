const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('admin.html', 'utf-8');

const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    url: "https://example.com/admin.html"
});

const { window } = dom;
const { document } = window;

// Mock localStorage
window.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Wait for scripts to initialize
setTimeout(() => {
    try {
        console.log('=== TEST 1: Initial Default Values ===');
        const tmbInit = document.getElementById('calc-diag-tmb')?.textContent;
        const tdeeInit = document.getElementById('calc-diag-tdee')?.textContent;
        const formulaInit = document.getElementById('calc-formula-header-text')?.textContent;
        const calInit = document.getElementById('calc-res-calorias')?.value;
        const protInit = document.getElementById('calc-res-proteinas')?.value;
        const carbInit = document.getElementById('calc-res-carboidratos')?.value;
        const gordInit = document.getElementById('calc-res-gorduras')?.value;
        console.log({ tmbInit, tdeeInit, formulaInit, calInit, protInit, carbInit, gordInit });

        console.log('\n=== TEST 2: Enter 14 in % BF (Katch-McArdle Trigger) ===');
        const bfInput = document.getElementById('calc-bf');
        bfInput.value = '14';
        bfInput.oninput();

        const tmbKatch = document.getElementById('calc-diag-tmb')?.textContent;
        const formulaKatch = document.getElementById('calc-formula-header-text')?.textContent;
        const lbmBadge = document.getElementById('calc-lbm-badge')?.textContent;
        console.log({ tmbKatch, formulaKatch, lbmBadge });

        console.log('\n=== TEST 3: Select Bulking Intenso (+20%) in calc-objetivo ===');
        const selObj = document.getElementById('calc-objetivo');
        selObj.value = 'superavit_agressivo';
        selObj.onchange();

        const tdeeBulking = document.getElementById('calc-diag-tdee')?.textContent;
        const deltaBulking = document.getElementById('calc-diag-delta')?.textContent;
        const deltaDescBulking = document.getElementById('calc-diag-delta-desc')?.textContent;
        const calBulking = document.getElementById('calc-res-calorias')?.value;
        const protBulking = document.getElementById('calc-res-proteinas')?.value;
        const carbBulking = document.getElementById('calc-res-carboidratos')?.value;
        const gordBulking = document.getElementById('calc-res-gorduras')?.value;
        const somaBulking = document.getElementById('calc-res-soma-valor')?.textContent;
        console.log({ tdeeBulking, deltaBulking, deltaDescBulking, calBulking, protBulking, carbBulking, gordBulking, somaBulking });

        console.log('\n=== TEST 4: Stepping Protein +5g (Lock & Fill) ===');
        window.alterarMacroStep('calc-res-proteinas', 5);
        const protStepped = document.getElementById('calc-res-proteinas')?.value;
        const carbStepped = document.getElementById('calc-res-carboidratos')?.value;
        const calStepped = document.getElementById('calc-res-calorias')?.value;
        const somaStepped = document.getElementById('calc-res-soma-valor')?.textContent;
        console.log({ protStepped, carbStepped, calStepped, somaStepped });

        console.log('\n=== TEST 5: Apply Preset Cutting Agressivo ===');
        window.aplicarPresetMacros('cutting_agressivo');
        const selObjCutting = document.getElementById('calc-objetivo')?.value;
        const deltaCutting = document.getElementById('calc-diag-delta')?.textContent;
        const calCutting = document.getElementById('calc-res-calorias')?.value;
        const protCutting = document.getElementById('calc-res-proteinas')?.value;
        const carbCutting = document.getElementById('calc-res-carboidratos')?.value;
        const gordCutting = document.getElementById('calc-res-gorduras')?.value;
        const btnCuttingRing = document.getElementById('preset-btn-cutting')?.classList.contains('ring-2');
        console.log({ selObjCutting, deltaCutting, calCutting, protCutting, carbCutting, gordCutting, btnCuttingRing });

        console.log('\n=== TEST 6: Tabs Visibility Check ===');
        window.alternarAbaNutri('painel');
        const painelTabHidden1 = document.getElementById('conteudo-tab-nutri-painel')?.classList.contains('hidden');
        const montarTabHidden1 = document.getElementById('conteudo-tab-nutri-montar')?.classList.contains('hidden');
        console.log('Painel tab active: painel is hidden?', painelTabHidden1, '| montar is hidden?', montarTabHidden1);

        window.alternarAbaNutri('montar');
        const painelTabHidden2 = document.getElementById('conteudo-tab-nutri-painel')?.classList.contains('hidden');
        const montarTabHidden2 = document.getElementById('conteudo-tab-nutri-montar')?.classList.contains('hidden');
        console.log('Montar tab active: painel is hidden?', painelTabHidden2, '| montar is hidden?', montarTabHidden2);

        console.log('\nALL TESTS EXECUTED PERFECTLY!');
    } catch (err) {
        console.error('Test error:', err);
    }
}, 500);
