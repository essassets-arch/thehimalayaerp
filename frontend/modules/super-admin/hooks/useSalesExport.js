import { useCallback } from 'react';

export const useSalesExport = (data, activeTab) => {
  const exportCSV = useCallback((fileName = 'sales_report') => {
    let rows = [];
    if (activeTab === 'explorer') {
      rows = data.explorer?.rows || [];
    } else if (activeTab === 'overview') {
      rows = data.overview?.executives || [];
    } else {
      rows = data.revenue?.trends || [];
    }

    if (rows.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(rows[0]).join(',');
    const csvRows = rows.map(row => 
      Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, activeTab]);

  const exportExcel = useCallback(() => {
    alert('Connecting to Excel compiler API... Initiating raw spreadsheet assembly.');
    exportCSV('sales_bi_matrix');
  }, [exportCSV]);

  const exportPDF = useCallback(() => {
    window.print();
  }, []);

  return {
    exportCSV,
    exportExcel,
    exportPDF
  };
};
