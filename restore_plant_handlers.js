const fs = require('fs');
const path = 'd:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// The preConfirm section has CRLF line endings — fix the search to use \r\n
const bad = `preConfirm: () => {\r\n    try {\r\n      const res = await apiClient.get('/plant-head/replacements');\r\n      setReplacementRequests(res.data || []);\r\n    } catch (err) {\r\n      console.error('Failed to fetch replacement requests', err);\r\n      showToast?.('Failed to load replacement requests.');\r\n    } finally {\r\n      setReplacementLoading(false);\r\n    }\r\n  };\r\n\r\n  useEffect(() => {\r\n    if (currentView === 'replacements') fetchReplacementRequests();\r\n  }, [currentView]);`;

const good = `preConfirm: () => {
        const approvedItems = (indent.items || []).map((item, i) => ({
          ...item,
          quantity_ordered: Number(document.getElementById(\`item-qty-\${i}\`)?.value) || item.quantity_ordered || item.quantity || 0
        }));
        const remarks = document.getElementById('indent-approve-remarks')?.value?.trim();
        return { approvedItems, remarks };
      }
    });
    if (!value) return;
    approvePurchaseIndent(indent.id, value.remarks || 'Approved by Plant Head');
    apiClient.patch(\`/plant-head/material-indents/\${indent.id}/approve\`, {
      items: value.approvedItems, remarks: value.remarks
    }).catch(() => {});
    showToast?.('Indent approved and sent to Finance.');
    fetchMaterialIndents();
  };

  const handleRejectIndent = async (indent) => {
    const { value: remarks } = await Swal.fire({
      title: \`Reject Indent \u2014 \${indent.id}\`,
      input: 'textarea',
      inputLabel: 'Reason for rejection *',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#ef4444',
      inputValidator: (v) => !v?.trim() ? 'A reason is required.' : undefined
    });
    if (!remarks) return;
    rejectPurchaseIndent(indent.id, remarks);
    apiClient.patch(\`/plant-head/material-indents/\${indent.id}/reject\`, { remarks }).catch(() => {});
    showToast?.('Indent rejected.');
    fetchMaterialIndents();
  };

  const fetchReplacementRequests = async () => {
    setReplacementLoading(true);
    try {
      const res = await apiClient.get('/plant-head/replacements');
      setReplacementRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch replacement requests', err);
      showToast?.('Failed to load replacement requests.');
    } finally {
      setReplacementLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'replacements') fetchReplacementRequests();
  }, [currentView]);`;

if (content.includes(bad)) {
  content = content.replace(bad, good);
  fs.writeFileSync(path, content);
  console.log('PlantHeadPortal handlers restored!');
} else {
  // fallback: try to find by just the unique corrupted preConfirm + try block
  const idx = content.indexOf("preConfirm: () => {\r\n    try {\r\n      const res = await apiClient.get('/plant-head/replacements')");
  if (idx !== -1) {
    const end = content.indexOf("}, [currentView]);", idx) + "}, [currentView]);".length;
    content = content.substring(0, idx) + good + content.substring(end);
    fs.writeFileSync(path, content);
    console.log('Fixed via index fallback!');
  } else {
    console.log('Could not find the corrupted block!');
  }
}
