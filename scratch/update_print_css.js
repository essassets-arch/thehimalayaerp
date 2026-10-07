const fs = require('fs');
const filePath = 'd:\\prototype-next-main\\frontend\\modules\\plant-head\\pages\\PlantHeadProductionAnalytics.jsx';

let content = fs.readFileSync(filePath, 'utf8');

const oldStyleRegex = /<style>\{`[\s\S]*?`\}<\/style>/;

const newStyle = `<style>{\`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 6mm 8mm 6mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 8.5px !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          /* Hide non-printable application navigation, header, and buttons */
          .no-print,
          .no-capture,
          nav,
          aside,
          header.hero-banner,
          .hero-banner,
          .sidebar,
          .toast-container,
          div[class*="ToastContainer"],
          div[class*="HeroBanner"],
          div[class*="Sidebar"],
          .report-filter-bar,
          .modal-overlay:not(.active) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            border: none !important;
          }
          /* Reset parent containers so multi-page printing is never clipped */
          .app-container,
          .main-viewport,
          main {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #ffffff !important;
          }
          .report-root-container {
            display: block !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            overflow: visible !important;
          }
          .report-main-header {
            display: flex !important;
            margin-bottom: 6px !important;
            padding: 6px 12px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .report-kpi-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 4px !important;
            margin-bottom: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .report-tables-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 5px !important;
            margin-bottom: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .report-charts-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 5px !important;
            margin-bottom: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .report-products-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 5px !important;
            margin-bottom: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          div[style*="maxHeight"],
          div[style*="max-height"] {
            max-height: none !important;
            overflow: visible !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          footer,
          .report-signoff-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      \`}</style>`;

if (oldStyleRegex.test(content)) {
  content = content.replace(oldStyleRegex, newStyle);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated print CSS in PlantHeadProductionAnalytics.jsx');
} else {
  console.error('oldStyleRegex did not match!');
  process.exit(1);
}
