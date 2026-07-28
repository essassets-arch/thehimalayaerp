const fs = require("fs");
const files = [
  "modules/procurement/finance/DeliveryAudit.jsx",
  "modules/procurement/super-admin/PurchaseOrderApproval.jsx",
  "modules/procurement/components/PurchaseOrderDetails.jsx",
  "modules/procurement/plant-head/MaterialIndentApproval.jsx",
  "modules/procurement/components/ProcurementAuditTimeline.jsx",
  "modules/procurement/finance/CreatePurchaseOrder.jsx"
];

const helper = `const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};\n`;

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, "utf8");
  if (content.includes("date-fns")) {
    content = content.replace(/import\s+\{\s*format\s*\}\s+from\s+[\x27"]date-fns[\x27"];?\r?\n/g, helper);
    // Replace format(new Date(...), "...") or format(..., "...")
    content = content.replace(/format\((.+?),\s*[\x27"][^\x27"]+[\x27"]\)/g, "formatDate($1)");
    fs.writeFileSync(f, content);
    console.log("Fixed", f);
  }
});
