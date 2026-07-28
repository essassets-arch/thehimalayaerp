const fs = require('fs');
const path = 'd:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// The corruption: inside the finally {} of fetchMaterialIndents, there's a duplicate block injected.
// Find and remove the duplicated section inside finally
const bad = `    } finally {\r\n  const rejectPurchaseIndent = useERPStore(s => s.rejectPurchaseIndent);\n\n  const fetchMaterialIndents = async () => {\n    setIndentsLoading(true);\n    try {\n      const res = await apiClient.get('/plant-head/material-indents');\n      setMaterialIndents(res.data || []);\n    } catch (err) {\n      console.error('Failed to fetch material indents', err);\n      showToast?.('Failed to load material indents.');\n    } finally {\n      setIndentsLoading(false);\n    }\n  };\n\n  useEffect(() => {\n    if (currentView === 'material-indents') fetchMaterialIndents();\n  }, [currentView]);`;

const good = `    } finally {\n      setIndentsLoading(false);\n    }\n  };\n\n  useEffect(() => {\n    if (currentView === 'material-indents') fetchMaterialIndents();\n  }, [currentView]);`;

if (content.includes(bad)) {
  content = content.replace(bad, good);
  fs.writeFileSync(path, content);
  console.log('Duplication fixed!');
} else {
  // Try with \n instead of \r\n in the start
  const altBad = `    } finally {\n  const rejectPurchaseIndent = useERPStore(s => s.rejectPurchaseIndent);\n\n  const fetchMaterialIndents = async () => {\n    setIndentsLoading(true);\n    try {\n      const res = await apiClient.get('/plant-head/material-indents');\n      setMaterialIndents(res.data || []);\n    } catch (err) {\n      console.error('Failed to fetch material indents', err);\n      showToast?.('Failed to load material indents.');\n    } finally {\n      setIndentsLoading(false);\n    }\n  };\n\n  useEffect(() => {\n    if (currentView === 'material-indents') fetchMaterialIndents();\n  }, [currentView]);`;
  
  if (content.includes(altBad)) {
    content = content.replace(altBad, good);
    fs.writeFileSync(path, content);
    console.log('Fixed with alt match!');
  } else {
    // Find by line markers
    const lines = content.split('\n');
    const corruptLine = lines.findIndex(l => l.includes('} finally {') && lines[parseInt(lines.indexOf(l)) + 1]?.includes('const rejectPurchaseIndent = useERPStore'));
    if (corruptLine !== -1) {
      console.log('Found corrupt line at:', corruptLine + 1);
    } else {
      // Show area around line 204
      console.log('Showing area:');
      lines.slice(200, 235).forEach((l, i) => console.log(i + 201, JSON.stringify(l)));
    }
  }
}
