const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');

// Find all script tags without src
const regex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
    count++;
    try {
        new Function(match[1]);
        console.log(`Script ${count}: Syntax OK (${match[1].length} chars)`);
    } catch (e) {
        console.error(`Script ${count} Syntax Error:`, e.message);
        // Find line in file
        const upToMatch = html.substring(0, match.index);
        const lineNum = upToMatch.split('\n').length;
        console.error(`Starts around line ${lineNum}`);
    }
}
