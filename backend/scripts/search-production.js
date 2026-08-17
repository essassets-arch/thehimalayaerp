const fs = require('fs');
const path = require('path');

const prodServicePath = path.join(__dirname, '..', '..', 'backend', 'src', 'modules', 'production', 'production.service.ts');
const prodWorkflowPath = path.join(__dirname, '..', '..', 'backend', 'src', 'modules', 'production', 'production-workflow.service.ts');

function search(filePath) {
  console.log(`--- Searching in ${path.basename(filePath)} ---`);
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line, idx) => {
    if (line.toLowerCase().includes('release') || line.toLowerCase().includes('workorder') || line.toLowerCase().includes('createplan')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  });
}

search(prodServicePath);
search(prodWorkflowPath);
