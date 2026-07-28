// Reusable ERP Report Export Utilities

export const exportCSV = (data, filename = 'report') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row)
      .map(val => {
        let str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportExcel = (data, filename = 'report') => {
  // Mock Excel file download trigger since standard web app client libraries like XLSX might not be installed,
  // we download a structured XML/CSV format or open a download trigger.
  exportCSV(data, `${filename}_excel`);
};

export const exportPDF = (title = 'Report') => {
  // Triggers print view optimized for PDF layout save
  window.print();
};

export const printReport = () => {
  window.print();
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // Event handler callbacks can capture this, or just trigger window toast
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
};

export const emailReport = (subject = 'Himalaya ERP Report', body = 'Please find the attached data reports.') => {
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
};
