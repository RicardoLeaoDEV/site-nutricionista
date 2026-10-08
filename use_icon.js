const fs = require('fs');

function updateToIcon(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Change nova-logo.png to icon-192.png and add rounded-[22%] for iOS-like app icon curve, plus a subtle border to separate from background
    content = content.replace(/<img src="assets\/nova-logo\.png"([^>]*)class="([^"]*)"/g, '<img src="assets/icon-192.png"$1class="$2 rounded-[22%] shadow-lg border border-white/5"');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated " + file);
    }
}

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(updateToIcon);
