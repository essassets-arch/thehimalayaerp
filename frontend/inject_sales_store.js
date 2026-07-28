const fs = require('fs');

const STORE_PATH = 'store/erpStore.ts';
let code = fs.readFileSync(STORE_PATH, 'utf8');

if (!code.includes('salesAndProductionSlice')) {
  // Inject import
  code = code.replace(
    "import { assertTransition, createId, calculatePOLineTotals, createAuditEntry } from '../constants/procurement';",
    "import { assertTransition, createId, calculatePOLineTotals, createAuditEntry } from '../constants/procurement';\nimport { salesAndProductionSlice } from './new_sales_store';"
  );

  // Inject slice
  const injectionPoint = "      return { state: newState };\n    });\n  }";
  if (code.includes(injectionPoint)) {
    code = code.replace(
      injectionPoint,
      "      return { state: newState };\n    });\n  },\n\n  // --- STRICT SALES & PRODUCTION FLOW ACTIONS ---\n  ...salesAndProductionSlice(set, get, safePersist, persistToStorage)"
    );
    fs.writeFileSync(STORE_PATH, code);
    console.log("Successfully injected salesAndProductionSlice into erpStore.ts");
  } else {
    console.error("Could not find the injection point in erpStore.ts");
  }
} else {
  console.log("salesAndProductionSlice already injected.");
}
