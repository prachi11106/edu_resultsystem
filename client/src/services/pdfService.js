import html2pdf from 'html2pdf.js';

export const printResultCard = () => {
  window.print();
};

export const downloadResultPDF = async (elementId, filename = 'Student_Result_Card.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF generation`);
    window.print();
    return;
  }

  const opt = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('[PDF Download Error]', err);
    // Fallback to print
    window.print();
  }
};
