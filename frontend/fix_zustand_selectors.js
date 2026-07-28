const fs = require("fs");
const files = [
  "modules/super-admin/pages/PurchaseIndentsView.jsx",
  "modules/plant-head/pages/PlantHeadPortal.jsx",
  "modules/finance/pages/FinancePortal.jsx"
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, "utf8");
    let newContent = content.replace(/useERPStore\(s => s\.state\.([a-zA-Z0-9_]+) \|\| \[\]\)/g, "useERPStore(s => s.state.$1) || []");
    if (content !== newContent) {
      fs.writeFileSync(f, newContent);
      console.log("Fixed: " + f);
    }
  }
});
