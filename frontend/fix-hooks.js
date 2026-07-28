const fs = require('fs');
const path = require('path');

function replaceHooks(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (content.includes('useOutletContext')) {
    content = content.replace(/import\s+{\s*useOutletContext.*?}?\s+from\s+['"]react-router-dom['"];?/, '');
    content = content.replace(/const\s+{\s*showToast\s*,\s*globalSearch\s*,\s*setGlobalSearch\s*}\s*=\s*useOutletContext\(\);/, 
      "const showToast = require('@/store/notificationStore').useNotificationStore(s => s.showToast);\n" +
      "  const globalSearch = require('@/store/searchStore').useSearchStore(s => s.globalSearch);\n" +
      "  const setGlobalSearch = require('@/store/searchStore').useSearchStore(s => s.setGlobalSearch);"
    );
    changed = true;
  }

  if (content.includes('useParams(')) {
    if (!content.includes('next/navigation')) {
        content = "import { useParams } from 'next/navigation';\n" + content;
    } else if (!content.includes('useParams')) {
        content = content.replace(/import\s+{(.*?)}\s+from\s+['"]next\/navigation['"];?/, "import { , useParams } from 'next/navigation';");
    }
    
    // next/navigation useParams returns an object with the dynamic segments
    // AppRouter: app/(dashboard)/sales/[...slug]/page.tsx will have params.slug
    // Let's just pass view, leadId, sampleId safely.
    content = content.replace(/const\s+{\s*view,\s*leadId,\s*sampleId\s*}\s*=\s*useParams\(\);/, "const params = useParams(); const view = params?.slug?.[0]; const leadId = params?.slug?.[1]; const sampleId = params?.slug?.[1];");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated hooks in', fullPath);
  }
}

replaceHooks(path.join(__dirname, 'modules/sales/pages/SalesPortal.jsx'));
