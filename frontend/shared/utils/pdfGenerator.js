/**
 * Client-side PDF Generator Utility
 * Uses html2canvas and jsPDF to render DOM elements to clean, high-resolution A4 PDFs
 */

export async function downloadElementAsPdf(element, filename = 'Purchase_Order.pdf') {
  if (typeof window === 'undefined') return false;

  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) {
    console.error('Target element not found for PDF export:', element);
    return false;
  }

  try {
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const { jsPDF } = await import('jspdf');

    // Create a high-res rendering of the element
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Ensure all images and styles in cloned doc are visible
        const el = typeof element === 'string' 
          ? clonedDoc.querySelector(element) 
          : (target.id ? clonedDoc.getElementById(target.id) : clonedDoc.body.firstChild);
        if (el) {
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
          el.style.width = '800px';
          el.style.margin = '0 auto';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margins
    const printableWidth = pageWidth - (margin * 2);
    const printableHeight = pageHeight - (margin * 2);

    const imgHeight = (canvas.height * printableWidth) / canvas.width;

    if (imgHeight <= printableHeight) {
      // Single page document
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, imgHeight);
    } else {
      // Multi-page document slicing
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, imgHeight);
      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position + margin, printableWidth, imgHeight);
        heightLeft -= printableHeight;
      }
    }

    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF via html2canvas:', error);
    // Fallback: trigger print
    window.print();
    return false;
  }
}
