const fs = require('fs');
const path = require('path');

const directoryPath = process.cwd();

const newLogoHTML = `<img src="assets/nova-logo.png" alt="Real Fit Hub" class="h-full w-auto object-contain group-hover:scale-105 transition-transform">
                <span class="text-xl font-bold tracking-tight text-white whitespace-nowrap font-clash hidden sm:block">
                    <strong class="font-extrabold">REAL FIT</strong><span class="text-amber-400 font-extrabold"> HUB</span>
                </span>
            </a>`;

const regexDivBg = /<div[^>]*bg-gradient-to-tr[^>]*>[\s\S]*?<img src="assets\/icon-192\.png"[\s\S]*?<\/div>[\s\S]*?<\/a>/g;

const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let originalContent = content;
    
    // Replace the old logo block pattern with the new one
    content = content.replace(regexDivBg, newLogoHTML);
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
