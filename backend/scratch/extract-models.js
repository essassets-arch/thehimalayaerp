const fs = require('fs');
const path = require('path');

const schemaPath = 'd:/prototype-next-main/backend/prisma/schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf8');

const targetModels = [
  'SalesOrder',
  'SalesOrderItem',
  'SalesOrderAllocation',
  'Dispatch',
  'DispatchItem',
  'SampleRequest',
  'SampleItem',
  'SampleHistory',
  'ReplacementRequest',
  'ReplacementRequestItem',
  'SalesReturn',
  'SalesReturnItem',
  'FinishedGoods',
  'StockHistory',
  'Product',
  'Customer',
  'Employee',
  'User'
];

let output = '';

function extractModel(modelName) {
  const regex = new RegExp(`model\\s+${modelName}\\s+\\{([^}]+)\\}`, 'g');
  const match = regex.exec(content);
  if (match) {
    output += `=== MODEL: ${modelName} ===\n`;
    output += match[0] + '\n\n';
  } else {
    output += `=== MODEL: ${modelName} NOT FOUND ===\n\n`;
  }
}

targetModels.forEach(extractModel);

fs.writeFileSync('d:/prototype-next-main/backend/scratch/extracted_models.txt', output, 'utf8');
console.log('Extracted models written to scratch/extracted_models.txt');
