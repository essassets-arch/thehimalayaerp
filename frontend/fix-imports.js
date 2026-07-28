const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    try {
        fs.readdirSync(dir).forEach(function(file) {
            const full = path.join(dir, file);
            try {
                const stat = fs.statSync(full);
                if (stat.isDirectory()) {
                    results = results.concat(walk(full));
                } else if (full.match(/\.(tsx?|jsx?)$/)) {
                    results.push(full);
                }
            } catch(e) {}
        });
    } catch(e) {}
    return results;
}

const root = process.cwd();
const appDir = path.join(root, 'app');
const files = walk(appDir);
let totalFixed = 0;

files.forEach(function(file) {
    const content = fs.readFileSync(file, 'utf8');
    // Replace any import path that contains a backslash with forward slashes
    const fixed = content.replace(/from ('|")((?:\.\.(?:\/|\\))+[^'"]+)('|")/g, function(match, q1, importPath, q2) {
        if (importPath.indexOf('\\') === -1) return match;
        return 'from ' + q1 + importPath.replace(/\\/g, '/') + q2;
    });

    if (fixed !== content) {
        fs.writeFileSync(file, fixed, 'utf8');
        totalFixed++;
        console.log('Fixed: ' + path.relative(root, file));
    }
});
console.log('Done. Total files fixed: ' + totalFixed);

