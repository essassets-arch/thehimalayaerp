const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');

const code = fs.readFileSync('frontend/modules/production/components/DailyReportEntryView.jsx', 'utf8');
const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });

const standardGlobals = new Set([
  'window', 'document', 'console', 'Math', 'Number', 'String', 'Boolean', 'Array', 'Object', 'Date',
  'RegExp', 'Error', 'TypeError', 'Promise', 'Set', 'Map', 'JSON', 'isNaN', 'isFinite',
  'parseFloat', 'parseInt', 'encodeURIComponent', 'decodeURIComponent', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'fetch', 'alert', 'confirm',
  'Intl', 'navigator', 'localStorage', 'sessionStorage', 'location'
]);

const undeclared = new Set();

traverse(ast, {
  Program(path) {
    path.traverse({
      ReferencedIdentifier(identPath) {
        const name = identPath.node.name;
        if (standardGlobals.has(name)) return;
        if (!identPath.scope.hasBinding(name)) {
          undeclared.add(name);
        }
      }
    });
  }
});

console.log('Undeclared identifiers:', Array.from(undeclared));
