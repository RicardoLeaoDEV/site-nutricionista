const fs = require('fs');

function fixFile(file) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/<span class="sm:hidden">.*?<\/span>\s*<\/span>/s, '');
    c = c.replace(/<span\s*class="bg-gold-500 text-navy-950 text-\[10px\] font-black px-1\.5 py-0\.5 rounded uppercase tracking-widest hidden sm:inline-block">PRO<\/span>\s*<\/span>/s, '');
    fs.writeFileSync(file, c);
}

fixFile('index.html');
fixFile('pro.html');
console.log('Fixed trailing spans');
