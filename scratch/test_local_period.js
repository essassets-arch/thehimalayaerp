const { resolveAnalyticsPeriod } = require('../backend/dist/modules/plant-head/material-analytics');

console.log('Today:', resolveAnalyticsPeriod('Today'));
console.log('This Week:', resolveAnalyticsPeriod('This Week'));
console.log('Quarter:', resolveAnalyticsPeriod('Quarter'));
console.log('Year:', resolveAnalyticsPeriod('Year'));
console.log('Last Month:', resolveAnalyticsPeriod('Last Month'));
