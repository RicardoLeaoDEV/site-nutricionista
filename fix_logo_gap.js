const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Decrease the gap between logo and text because the new icon has padding
    content = content.replace(/class="inline-flex items-center gap-[^"]* group([^"]*)"/g, 'class="inline-flex items-center gap-1.5 sm:gap-2 group$1"');
    
    // Add h-10 sm:h-12 to the a tag if not present
    content = content.replace(/class="inline-flex items-center gap-1\.5 sm:gap-2 group"(?![^>]*h-10)/g, 'class="inline-flex items-center gap-1.5 sm:gap-2 group h-10 sm:h-12"');
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Fixed gap and height in " + file);
    }
});
