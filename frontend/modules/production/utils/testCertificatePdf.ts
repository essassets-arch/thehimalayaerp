import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export async function downloadTestCertificatePdf(report: any, targetElementId = 'test-certificate-document'): Promise<boolean> {
  const toastId = toast.loading('Generating Test Certificate PDF…');

  try {
    let element = document.getElementById(targetElementId);

    // If element is not rendered on screen, wait a tick or check
    if (!element) {
      throw new Error('Certificate preview container is not available. Please open the certificate first.');
    }

    // Wait for all images inside the element to load
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    let imgData = '';
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Strategy 1: html-to-image (full Tailwind v4 oklch & modern CSS support)
    try {
      imgData = await toPng(element, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
      });
      const tempImg = new Image();
      await new Promise((resolve, reject) => {
        tempImg.onload = resolve;
        tempImg.onerror = reject;
        tempImg.src = imgData;
      });
      canvasWidth = tempImg.naturalWidth;
      canvasHeight = tempImg.naturalHeight;
    } catch (h2iErr) {
      console.warn('html-to-image fallback to html2canvas:', h2iErr);
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('style').forEach((s) => {
            if (s.textContent?.includes('oklch')) {
              s.textContent = s.textContent.replace(/oklch\([^)]+\)/g, '#0b3c68');
            }
          });
          clonedDoc.querySelectorAll('*').forEach((el: any) => {
            if (el.style) {
              const style = el.getAttribute('style') || '';
              if (style.includes('oklch')) {
                el.setAttribute('style', style.replace(/oklch\([^)]+\)/g, '#0b3c68'));
              }
            }
          });
        },
      });
      imgData = canvas.toDataURL('image/png', 1.0);
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
    }

    if (!imgData || canvasWidth === 0 || canvasHeight === 0) {
      throw new Error('Failed to render certificate content.');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    const pixelsPerMm = canvasWidth / contentWidth;
    const sourcePageHeight = Math.floor(contentHeight * pixelsPerMm);
    const singlePageMaxHeightPx = contentHeight * pixelsPerMm;

    // If standard certificate height fits on 1 page (up to 8% margin tolerance), render as a seamless single page
    if (canvasHeight <= singlePageMaxHeightPx * 1.08) {
      const finalHeightMm = Math.min(contentHeight, (canvasHeight / canvasWidth) * contentWidth);
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, finalHeightMm, undefined, 'FAST');
    } else {
      const sourceCanvas = document.createElement('canvas');
      const sourceContext = sourceCanvas.getContext('2d');
      if (!sourceContext) throw new Error('Could not prepare certificate pages.');
      sourceCanvas.width = canvasWidth;
      const sourceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = imgData;
      });

      let sourceTop = 0;
      let pageIndex = 0;
      while (sourceTop < canvasHeight) {
        const sliceHeight = Math.min(sourcePageHeight, canvasHeight - sourceTop);
        sourceCanvas.height = sliceHeight;
        sourceContext.clearRect(0, 0, canvasWidth, sliceHeight);
        sourceContext.drawImage(sourceImage, 0, sourceTop, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);
        if (pageIndex > 0) pdf.addPage();
        const sliceData = sourceCanvas.toDataURL('image/png', 1);
        const sliceHeightMm = sliceHeight / pixelsPerMm;
        pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeightMm, undefined, 'FAST');
        sourceTop += sliceHeight;
        pageIndex += 1;
      }
    }

    const safeNumber = String(report.reportNumber || report.id || 'Report')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .trim();
    const filename = `Test-Certificate-${safeNumber}.pdf`;

    // Save directly to trigger browser download
    pdf.save(filename);

    // Also support APK / mobile Flutter bridge if present
    if (typeof window !== 'undefined' && (window as any).flutter_inappwebview?.callHandler) {
      try {
        const rawData = pdf.output('datauristring');
        const base64Clean = rawData.includes(',') ? rawData.split(',')[1] : rawData;
        (window as any).flutter_inappwebview.callHandler('downloadQuotationImage', base64Clean, filename).catch(() => {});
      } catch (e) {}
    }

    toast.success('Test Certificate PDF downloaded', { id: toastId });
    return true;
  } catch (err: any) {
    console.error('[downloadTestCertificatePdf Error]:', err);
    toast.error(err?.message || 'Failed to download certificate PDF. Please retry.', { id: toastId });
    return false;
  }
}
