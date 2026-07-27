const fs = require('fs');
const path = 'd:/prototype-next/modules/store/pages/StorePortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// The file got corrupted - need to fix by finding the broken region and patching it back.
// The issue is between the showIndentModal line and the getMappedInventory function.

const badStart = "  const [showIndentModal, setShowIndentModal] = useState(false);\r\n        'OPC Cement Clinker'";
const badEnd = "      };\r\n      const def = defaults[item.material]";

const goodReplacement = `  const [showIndentModal, setShowIndentModal] = useState(false);
  const [indentTargetMaterial, setIndentTargetMaterial] = useState(null);
  const [indentRequiredQty, setIndentRequiredQty] = useState('');
  const [indentPriority, setIndentPriority] = useState('Medium');
  const [indentRemarks, setIndentRemarks] = useState('');
  const [indentTargetDate, setIndentTargetDate] = useState('');
  const [indentSubmitting, setIndentSubmitting] = useState(false);
  const [submittedIndents, setSubmittedIndents] = useState({});
  const [selectedDepartments, setSelectedDepartments] = useState({});

  // PO Workspace — Create Indent form state
  const [reqMaterial, setReqMaterial] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqPriority, setReqPriority] = useState('Normal');
  const [reqReason, setReqReason] = useState('');

  // PO Workspace — GRN / Verify Delivery form state
  const [selectedPO, setSelectedPO] = useState(null);
  const [delReceived, setDelReceived] = useState('');
  const [delAccepted, setDelAccepted] = useState('');
  const [delRejected, setDelRejected] = useState('0');
  const [delInvoice, setDelInvoice] = useState('');
  const [delChallan, setDelChallan] = useState('');
  const [delBatch, setDelBatch] = useState('');
  const [delRemarks, setDelRemarks] = useState('');

  const getMappedInventory = (rawInventoryList) => {
    return (rawInventoryList || []).map((item, idx) => {
      const defaults = {
        'OPC Cement Clinker': { code: 'RM001', category: 'Cement', rate: 150, reorderLevel: 1000, description: 'High grade cement clinker.' },
        'Gypsum Raw': { code: 'RM002', category: 'Additive', rate: 220, reorderLevel: 200, description: 'Raw gypsum additive.' },
        'River Sand': { code: 'RM003', category: 'Aggregate', rate: 800, reorderLevel: 100, description: 'Fine-grain clean river sand.' },
        'Coarse Aggregate 20mm': { code: 'RM004', category: 'Aggregate', rate: 1200, reorderLevel: 120, description: 'Coarse aggregate 20mm.' },
        'Fine Aggregate 10mm': { code: 'RM005', category: 'Aggregate', rate: 1000, reorderLevel: 150, description: 'Fine aggregate 10mm.' },
        'Superplasticizer Admixture': { code: 'RM006', category: 'Chemical', rate: 1500, reorderLevel: 500, description: 'Liquid chemical concrete admixture.' },
        'Waterproofing Compound': { code: 'RM007', category: 'Chemical', rate: 2500, reorderLevel: 100, description: 'Liquid waterproofing chemical.' }
      };
      const def = defaults[item.material]`;

if (content.includes(badStart)) {
  content = content.replace(badStart, goodReplacement.split(badEnd.split('\n')[0])[0] + "defaults[item.material]");
  console.log('Fixed using string replacement');
} else {
  // Alternative: find the broken region
  const idx1 = content.indexOf("const [showIndentModal, setShowIndentModal] = useState(false);");
  const idx2 = content.indexOf("const getMappedInventory");
  if (idx1 !== -1 && idx2 !== -1) {
    const before = content.substring(0, idx1);
    const after = content.substring(idx2);
    content = before + goodReplacement + '\n' + after;
    console.log('Fixed using index replacement');
  } else {
    console.log('Could not find markers');
    process.exit(1);
  }
}

fs.writeFileSync(path, content);
console.log('StorePortal state declarations fixed!');
