const fs = require('fs');
let content = fs.readFileSync('services/export.service.js', 'utf8');

// Replace import
content = content.replace(/import 'jspdf-autotable';/g, "import autoTable from 'jspdf-autotable';");

// Replace doc.autoTable( with autoTable(doc, 
content = content.replace(/doc\.autoTable\(/g, "autoTable(doc, ");

fs.writeFileSync('services/export.service.js', content);
