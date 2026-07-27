const fs = require('fs');
const filePath = 'd:/prototype-next/components/PaymentFollowupERPView.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

const hookOld = `  const pendingRows = useMemo(() => {
    const apiRows = pendingCollection || [];`;

const hookNew = `  const pendingRows = useMemo(() => {
    const apiRows = pendingCollection || [];
    console.log("== pendingCollection ==", pendingCollection);
    console.log("== orders ==", orders);`;

content = content.replace(hookOld, hookNew);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Injected console.log');
