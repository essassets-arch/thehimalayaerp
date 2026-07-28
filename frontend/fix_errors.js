const fs = require("fs");

let rm = fs.readFileSync("modules/procurement/finance/RejectionManagement.jsx", "utf8");
rm = rm.replace(/\\Cannot approve more than remaining resolution quantity \(\\\)\\/, "`Cannot approve more than remaining resolution quantity (${selectedRejection.remainingResolutionQty})`");
fs.writeFileSync("modules/procurement/finance/RejectionManagement.jsx", rm);

let rr = fs.readFileSync("modules/procurement/store/ReceiveReplacement.jsx", "utf8");
rr = rr.replace(/\\Cannot receive more than scheduled quantity \(\\\)\\/, "`Cannot receive more than scheduled quantity (${remainingScheduled})`");
fs.writeFileSync("modules/procurement/store/ReceiveReplacement.jsx", rr);

let es = fs.readFileSync("store/erpStore.ts", "utf8");
es = es.replace(/createAuditEntry/g, "createProcurementAuditEntry");
fs.writeFileSync("store/erpStore.ts", es);

let nss = fs.readFileSync("store/new_sales_store.ts", "utf8");
nss = nss.replace(/createAuditEntry/g, "createProcurementAuditEntry");
fs.writeFileSync("store/new_sales_store.ts", nss);
console.log("Fixed errors");
