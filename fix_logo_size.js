const fs = require('fs');

function fixLogo(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/<img src="assets\/nova-logo\.png"([^>]*)class="h-full w-auto object-contain group-hover:scale-105/g, '<img src="assets/nova-logo.png"$1class="h-10 sm:h-12 w-auto object-contain group-hover:scale-105');
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Fixed " + file);
    }
}

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(fixLogo);
