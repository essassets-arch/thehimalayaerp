const fs = require('fs');

// 1. useLeads.js
let ul = fs.readFileSync('modules/sales/hooks/useLeads.js', 'utf8');
const oldHookStart = ul.indexOf('  const convertToSample = useCallback(');
const oldHookEnd = ul.indexOf('  );', ul.indexOf('[showToast, router, syncData]', oldHookStart)) + 4;

if (oldHookStart !== -1) {
  const newHook = "  const convertToSample = useCallback(\\n" +
    "    async (lead, customDetails) => {\\n" +
    "      if (!customDetails) {\\n" +
    "        router.push('/sales/create-sample?leadId=' + lead.id);\\n" +
    "        return { success: true };\\n" +
    "      }\\n" +
    "      showToast('Sales: Creating sample dispatch request…');\\n" +
    "      const res = await leadsService.convertToSample(lead, customDetails);\\n\\n" +
    "      if (res.success) {\\n" +
    "        showToast('Sample dispatch request created for ' + lead.companyName + '!');\\n" +
    "        await syncData();\\n" +
    "        router.push('/sales/samples');\\n" +
    "      } else {\\n" +
    "        Swal.fire({\\n" +
    "          icon: 'error',\\n" +
    "          title: 'Sample Request Failed',\\n" +
    "          text: res.error?.message || res.error,\\n" +
    "        });\\n" +
    "      }\\n" +
    "      return res;\\n" +
    "    },\\n" +
    "    [showToast, router, syncData]\\n" +
    "  );";
  ul = ul.substring(0, oldHookStart) + newHook + ul.substring(oldHookEnd);
  fs.writeFileSync('modules/sales/hooks/useLeads.js', ul);
  console.log('Fixed useLeads.js');
}

// 2. CreateSample.jsx
let cs = fs.readFileSync('components/CreateSample.jsx', 'utf8');
cs = cs.replace(
  "export default function CreateSample({ leads, onAddSample, onCancel }) {",
  "export default function CreateSample({ leads, defaultLeadId, onAddSample, onCancel }) {"
);
cs = cs.replace(
  "const [selectedLeadId, setSelectedLeadId] = useState(activeLeads[0]?.id || '');",
  "const [selectedLeadId, setSelectedLeadId] = useState(defaultLeadId || activeLeads[0]?.id || '');"
);
fs.writeFileSync('components/CreateSample.jsx', cs);
console.log('Fixed CreateSample.jsx');

// 3. SalesPortal.jsx
let sp = fs.readFileSync('modules/sales/pages/SalesPortal.jsx', 'utf8');
if (!sp.includes("import CreateSample")) {
  sp = sp.replace(
    "import EditSample                 from '../../../components/EditSample.jsx';",
    "import EditSample                 from '../../../components/EditSample.jsx';\\nimport CreateSample               from '../../../components/CreateSample.jsx';"
  );
}

const spCaseStart = sp.indexOf("    case 'edit-sample': {");
if (spCaseStart !== -1 && !sp.includes("case 'create-sample':")) {
  const newCases = "    case 'create-sample': {\\n" +
    "      let leadIdFromUrl = null;\\n" +
    "      if (typeof window !== 'undefined') {\\n" +
    "        const urlParams = new URLSearchParams(window.location.search);\\n" +
    "        leadIdFromUrl = urlParams.get('leadId');\\n" +
    "      }\\n" +
    "      return (\\n" +
    "        <CreateSample \\n" +
    "           leads={leads}\\n" +
    "           defaultLeadId={leadIdFromUrl}\\n" +
    "           onAddSample={async (data) => {\\n" +
    "               const targetLead = leads.find(l => String(l.id) === String(data.leadId));\\n" +
    "               if(targetLead) convertToSample(targetLead, data);\\n" +
    "           }}\\n" +
    "           onCancel={() => navigate.push('/sales/leads')}\\n" +
    "        />\\n" +
    "      );\\n" +
    "    }\\n\\n" +
    "    case 'edit-sample': {";
  sp = sp.substring(0, spCaseStart) + newCases + sp.substring(spCaseStart + 25);
  fs.writeFileSync('modules/sales/pages/SalesPortal.jsx', sp);
  console.log('Fixed SalesPortal.jsx');
}
