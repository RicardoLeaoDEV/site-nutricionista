const fs = require('fs');

// We simulate the environment and load the relevant calculator code
const html = fs.readFileSync('admin.html', 'utf8');

// Extract the script
const scriptStart = html.indexOf('<script>');
// Get the main script (the second one)
const parts = html.split('<script>');
const mainScript = parts[2].split('</script>')[0];

// Let's create a minimal DOM environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const window = dom.window;
const document = window.document;

console.log('DOM loaded');
console.log('calc-bf element:', !!document.getElementById('calc-bf'));
console.log('calc-objetivo element:', !!document.getElementById('calc-objetivo'));
console.log('calc-diag-tmb element:', !!document.getElementById('calc-diag-tmb'));
console.log('calc-diag-formula-nome element:', !!document.getElementById('calc-diag-formula-nome'));

// Call setupCalculadoraListeners if it exists on window
if (typeof window.setupCalculadoraListeners === 'function') {
    window.setupCalculadoraListeners();
    console.log('setupCalculadoraListeners called successfully');
} else {
    console.log('window.setupCalculadoraListeners is NOT on window');
}
