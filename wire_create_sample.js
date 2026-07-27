const fs = require('fs');

// 1. Patch LeadsView.jsx
let leadsView = fs.readFileSync('components/LeadsView.jsx', 'utf8');
const handleConvertStart = leadsView.indexOf('const handleConvertToSampleClick = (lead) => {');
const handleConvertEnd = leadsView.indexOf('};', handleConvertStart) + 2;

if (handleConvertStart !== -1) {
  const newHandler = \`const handleConvertToSampleClick = (lead) => {
    onConvertToSample(lead);
  };\`;
  leadsView = leadsView.substring(0, handleConvertStart) + newHandler + leadsView.substring(handleConvertEnd);
  fs.writeFileSync('components/LeadsView.jsx', leadsView);
  console.log('Patched LeadsView.jsx');
} else {
  console.log('Could not find handleConvertToSampleClick in LeadsView.jsx');
}

// 2. Patch useLeads.js
let useLeads = fs.readFileSync('modules/sales/hooks/useLeads.js', 'utf8');
const oldConvert = \`  const convertToSample = useCallback(
    async (lead, customDetails) => {
      showToast('Sales: Creating sample dispatch request…');
      const res = await leadsService.convertToSample(lead, customDetails);

      if (res.success) {
        showToast(\\\`Sample dispatch request created for \${lead.companyName}!\\\`);
        await syncData();
        router.push('/sales/samples');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sample Request Failed',
          text: res.error?.message || res.error,
        });
      }
    },
    [showToast, router, syncData]
  );\`;

const newConvert = \`  const convertToSample = useCallback(
    async (lead, customDetails) => {
      if (!customDetails) {
        router.push(\\\`/sales/create-sample?leadId=\${lead.id}\\\`);
        return { success: true };
      }
      showToast('Sales: Creating sample dispatch request…');
      const res = await leadsService.convertToSample(lead, customDetails);

      if (res.success) {
        showToast(\\\`Sample dispatch request created for \${lead.companyName}!\\\`);
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

if (useLeads.includes("const convertToSample = useCallback(")) {
  useLeads = useLeads.replace(oldConvert, newConvert);
  fs.writeFileSync('modules/sales/hooks/useLeads.js', useLeads);
  console.log('Patched useLeads.js');
} else {
  console.log('Could not find convertToSample in useLeads.js');
}

// 3. Patch CreateSample.jsx
let createSample = fs.readFileSync('components/CreateSample.jsx', 'utf8');
if (createSample.includes("export default function CreateSample({ leads, onAddSample, onCancel }) {")) {
  createSample = createSample.replace(
    "export default function CreateSample({ leads, onAddSample, onCancel }) {",
    "export default function CreateSample({ leads, defaultLeadId, onAddSample, onCancel }) {"
  );
  createSample = createSample.replace(
    "const [selectedLeadId, setSelectedLeadId] = useState(activeLeads[0]?.id || '');",
    "const [selectedLeadId, setSelectedLeadId] = useState(defaultLeadId || activeLeads[0]?.id || '');"
  );
  fs.writeFileSync('components/CreateSample.jsx', createSample);
  console.log('Patched CreateSample.jsx');
} else {
  console.log('Could not find function signature in CreateSample.jsx');
}

// 4. Patch SalesPortal.jsx
let salesPortal = fs.readFileSync('modules/sales/pages/SalesPortal.jsx', 'utf8');

if (!salesPortal.includes("import CreateSample")) {
  salesPortal = salesPortal.replace(
    "import EditSample                 from '../../../components/EditSample.jsx';",
    "import EditSample                 from '../../../components/EditSample.jsx';\\nimport CreateSample               from '../../../components/CreateSample.jsx';"
  );
}

const editSampleCase = "    case 'edit-sample': {";
if (salesPortal.includes(editSampleCase) && !salesPortal.includes("case 'create-sample':")) {
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
               const targetLead = leads.find(l => l.id === data.leadId);
               if(targetLead) convertToSample(targetLead, data);
           }}
           onCancel={() => navigate.push('/sales/leads')}
        />
      );
    }

    case 'edit-sample': {\`;
  salesPortal = salesPortal.replace(editSampleCase, newCases);
  fs.writeFileSync('modules/sales/pages/SalesPortal.jsx', salesPortal);
  console.log('Patched SalesPortal.jsx');
} else {
  console.log('Could not find edit-sample case in SalesPortal.jsx');
}
