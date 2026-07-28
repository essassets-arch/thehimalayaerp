const fs = require("fs");
let rm = fs.readFileSync("modules/procurement/finance/RejectionManagement.jsx", "utf8");
rm = rm.replace(/\\Stock disposition recorded as \\\\/, "`Stock disposition recorded as ${disposition}`");
fs.writeFileSync("modules/procurement/finance/RejectionManagement.jsx", rm);
console.log("Fixed");
