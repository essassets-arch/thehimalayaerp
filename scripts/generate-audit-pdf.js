const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generateMasterAuditPdf() {
  console.log('[AUDIT] Initializing Himalaya ERP Master Forensic Report Generator...');
  
  const templatePath = path.resolve(__dirname, 'audit-report-template.html');
  const outputPath = path.resolve('D:/prototype-next-main/HIMALAYA_ERP_MASTER_AUDIT_REPORT.pdf');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error('Template file not found at: ' + templatePath);
  }

  const htmlContent = fs.readFileSync(templatePath, 'utf8');

  console.log('[AUDIT] Launching Playwright Chromium headless browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[AUDIT] Setting HTML report content and rendering...');
  await page.setContent(htmlContent, { waitUntil: 'load' });

  // Brief pause for font rendering
  await page.waitForTimeout(1000);

  console.log('[AUDIT] Printing to Master PDF:', outputPath);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '10mm',
      right: '10mm'
    }
  });

  await browser.close();
  const stats = fs.statSync(outputPath);
  console.log(`[AUDIT] SUCCESS! Master PDF generated at: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

generateMasterAuditPdf().catch(err => {
  console.error('[AUDIT] FATAL ERROR:', err);
  process.exit(1);
});
