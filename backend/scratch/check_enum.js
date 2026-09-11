const P = require('@prisma/client');
console.log(Object.keys(P).filter(k => k.toLowerCase().includes('stock')));
if (P.StockHistoryEvent) {
  console.log('StockHistoryEvent values:', Object.values(P.StockHistoryEvent));
}
