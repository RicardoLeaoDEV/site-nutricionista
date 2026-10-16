const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');

console.log('--- 1. CHECK CORRUPTED STRINGS ---');
const corruptedBroken = [...html.matchAll(/(?:^|[^t])(a-lucide=["'][^"']+["'])/g)];
console.log('Broken "a-lucide" found:', corruptedBroken.length);
if (corruptedBroken.length > 0) {
    throw new Error('Corrupted a-lucide string found: ' + JSON.stringify(corruptedBroken));
}

console.log('--- 2. CHECK SECTION PLACEMENT ---');
const idxPainelStart = html.indexOf('id="conteudo-tab-nutri-painel"');
const idxMontarStart = html.indexOf('id="conteudo-tab-nutri-montar"');
const idxEvolucaoStart = html.indexOf('id="conteudo-tab-nutri-evolucao"');

const idxCalc = html.indexOf('id="secao-calculadora-macros"');
const idxCadastrarRef = html.indexOf('id="secao-cadastrar-refeicao"');
const idxRefAtuais = html.indexOf('id="secao-refeicoes-atuais"');

console.log('Painel tab start:', idxPainelStart);
console.log('Montar tab start:', idxMontarStart);
console.log('Evolução tab start:', idxEvolucaoStart);

console.log('secao-calculadora-macros index:', idxCalc);
console.log('secao-cadastrar-refeicao index:', idxCadastrarRef);
console.log('secao-refeicoes-atuais index:', idxRefAtuais);

if (idxCalc < idxMontarStart || idxCalc > idxEvolucaoStart) {
    throw new Error('secao-calculadora-macros is not inside conteudo-tab-nutri-montar!');
}
if (idxCadastrarRef < idxMontarStart || idxCadastrarRef > idxEvolucaoStart) {
    throw new Error('secao-cadastrar-refeicao is not inside conteudo-tab-nutri-montar!');
}
if (idxRefAtuais < idxMontarStart || idxRefAtuais > idxEvolucaoStart) {
    throw new Error('secao-refeicoes-atuais is not inside conteudo-tab-nutri-montar!');
}

console.log('All 3 sections (calculadora, cadastrar refeicao, refeicoes atuais) are strictly inside conteudo-tab-nutri-montar!');

console.log('--- 3. CHECK CLOSING DIVS BEFORE EVOLUÇÃO ---');
const montarContent = html.substring(idxMontarStart, idxEvolucaoStart);
const divOpen = (montarContent.match(/<div(\s|>)/gi) || []).length;
const divClose = (montarContent.match(/<\/div>/gi) || []).length;
console.log('Montar tab: <div opened:', divOpen, '| </div> closed:', divClose);
if (divOpen !== divClose) {
    throw new Error(`Unbalanced divs in Montar tab! opened: ${divOpen}, closed: ${divClose}`);
}

console.log('Divs inside Montar tab are 100% balanced!');
console.log('ALL DOM CHECKS PASSED!');
