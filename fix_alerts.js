const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/qc/pending/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add import Swal from 'sweetalert2';
if (!content.includes("import Swal from 'sweetalert2'")) {
  content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport Swal from 'sweetalert2';");
}

// Replace alerts
content = content.replace(/alert\("Enter inspected quantity."\);/g, "Swal.fire('Error', 'Enter inspected quantity.', 'error');");
content = content.replace(/alert\("Inspected quantity cannot exceed produced quantity."\);/g, "Swal.fire('Error', 'Inspected quantity cannot exceed produced quantity.', 'error');");
content = content.replace(/alert\("Approved quantity must be greater than zero."\);/g, "Swal.fire('Error', 'Approved quantity must be greater than zero.', 'error');");
content = content.replace(/alert\([\s\S]*?"Approved quantity and rejected quantity must equal inspected quantity."[\s\S]*?\);/g, "Swal.fire('Error', 'Approved quantity and rejected quantity must equal inspected quantity.', 'error');");
content = content.replace(/alert\("QC approved and order sent to Dispatch."\);/g, "Swal.fire('Success', 'QC approved and order sent to Dispatch.', 'success');");
content = content.replace(/alert\("Order rejected and removed from pending."\);/g, "Swal.fire('Rejected!', 'Order rejected and removed from pending.', 'success');");

// Replace confirm logic in handleFail
const handleFailOrig = `  const handleFail = (id: string, workOrderNo: string) => {
    const confirmed = window.confirm(
      \`Mark \${workOrderNo} as failed and send it for rework?\`
    );

    if (confirmed) {
       const pendingQC = JSON.parse(localStorage.getItem("erp_qc_pending") || "[]");
       const updatedPendingQC = pendingQC.filter((item: any) => item.id !== id);
       localStorage.setItem("erp_qc_pending", JSON.stringify(updatedPendingQC));
       setPendingInspections(updatedPendingQC);
       alert("Order rejected and removed from pending.");
    }
  };`;

const handleFailNew = `  const handleFail = (id: string, workOrderNo: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: \`Mark \${workOrderNo} as failed and send it for rework?\`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, fail it!'
    }).then((result) => {
      if (result.isConfirmed) {
         const pendingQC = JSON.parse(localStorage.getItem("erp_qc_pending") || "[]");
         const updatedPendingQC = pendingQC.filter((item: any) => item.id !== id);
         localStorage.setItem("erp_qc_pending", JSON.stringify(updatedPendingQC));
         setPendingInspections(updatedPendingQC);
         Swal.fire('Rejected!', 'Order rejected and removed from pending.', 'success');
      }
    });
  };`;

// Replace handleFail block but account for the alert that we just replaced
const handleFailRegexOrig = `  const handleFail = \\(id: string, workOrderNo: string\\) => \\{
    const confirmed = window.confirm\\(
      \\\`Mark \\\\\\$\\{workOrderNo\\} as failed and send it for rework\\\?\\\`
    \\);

    if \\(confirmed\\) \\{
       const pendingQC = JSON.parse\\(localStorage.getItem\\("erp_qc_pending"\\) \\|\\| "\\[\\]"\\);
       const updatedPendingQC = pendingQC.filter\\(\\(item: any\\) => item.id !== id\\);
       localStorage.setItem\\("erp_qc_pending", JSON.stringify\\(updatedPendingQC\\)\\);
       setPendingInspections\\(updatedPendingQC\\);
       Swal\\.fire\\('Rejected!', 'Order rejected and removed from pending.', 'success'\\);
    \\}
  \\};`;

content = content.replace(new RegExp(handleFailRegexOrig), handleFailNew);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed sweet alerts');
