const fs = require('fs');

// 1. LeadsView.jsx
let lv = fs.readFileSync('components/LeadsView.jsx', 'utf8');
const startMatch = lv.indexOf('const handleConvertToSampleClick = (lead) => {');
const endMatch = lv.indexOf('const handleMarkLostClick = (lead) => {');

if (startMatch !== -1 && endMatch !== -1) {
  // We need to keep a couple of newlines before handleMarkLostClick
  const newHandler = "const handleConvertToSampleClick = (lead) => {\\n    onConvertToSample(lead);\\n  };\\n\\n\\n  ";
  lv = lv.substring(0, startMatch) + newHandler + lv.substring(endMatch);
  fs.writeFileSync('components/LeadsView.jsx', lv);
  console.log('Fixed LeadsView.jsx');
}

// 2. useLeads.js
let ul = fs.readFileSync('modules/sales/hooks/useLeads.js', 'utf8');
const oldHookStart = ul.indexOf('  const convertToSample = useCallback(');
const oldHookEnd = ul.indexOf('  );', ul.indexOf('[showToast, router, syncData]', oldHookStart)) + 4;

if (oldHookStart !== -1) {
  const newHook = \`  const convertToSample = useCallback(
    async (lead, customDetails) => {
      if (!customDetails) {
        router.push(\\\`/sales/create-sample?leadId=\\\${lead.id}\\\`);
        return { success: true };
      }
      showToast('Sales: Creating sample dispatch request…');
      const res = await leadsService.convertToSample(lead, customDetails);

      if (res.success) {
        showToast(\\\`Sample dispatch request created for \\\${lead.companyName}!\\\`);
        await syncData();
        router.push('/sales/samples');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sample Request Failed',
          text: res.error?.message || res.error,
        });
      }
      return res;
    },
    [showToast, router, syncData]
  );\`;
  ul = ul.substring(0, oldHookStart) + newHook + ul.substring(oldHookEnd);
  fs.writeFileSync('modules/sales/hooks/useLeads.js', ul);
  console.log('Fixed useLeads.js');
}

// 3. CreateSample.jsx
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

// 4. SalesPortal.jsx
let sp = fs.readFileSync('modules/sales/pages/SalesPortal.jsx', 'utf8');
if (!sp.includes("import CreateSample")) {
  sp = sp.replace(
    "import EditSample                 from '../../../components/EditSample.jsx';",
    "import EditSample                 from '../../../components/EditSample.jsx';\\nimport CreateSample               from '../../../components/CreateSample.jsx';"
  );
}

const spCaseStart = sp.indexOf("    case 'edit-sample': {");
if (spCaseStart !== -1 && !sp.includes("case 'create-sample':")) {
  const newCases = \`    case 'create-sample': {
      let leadIdFromUrl = null;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        leadIdFromUrl = urlParams.get('leadId');
      }
      return (
        <CreateSample 
           leads={leads}
           defaultLeadId={leadIdFromUrl}
           onAddSample={async (data) => {
               const targetLead = leads.find(l => String(l.id) === String(data.leadId));
               if(targetLead) convertToSample(targetLead, data);
           }}
           onCancel={() => navigate.push('/sales/leads')}
        />
      );
    }

    case 'edit-sample': {\`;
  sp = sp.substring(0, spCaseStart) + newCases + sp.substring(spCaseStart + 25);
  fs.writeFileSync('modules/sales/pages/SalesPortal.jsx', sp);
  console.log('Fixed SalesPortal.jsx');
}
