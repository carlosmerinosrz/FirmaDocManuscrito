// Cargar PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

const fileInput = document.getElementById('file-input');
const pdfCanvas = document.getElementById('pdf-canvas');
const ctx = pdfCanvas.getContext('2d');
let pdfDoc = null;

// Inicializar el SignaturePad
const signaturePadCanvas = document.querySelector("#signature-pad canvas");
const signaturePad = new SignaturePad(signaturePadCanvas);

// Cargar y mostrar el PDF
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
                pdfDoc = pdf;
                renderPage(1);
            });
        };
        fileReader.readAsArrayBuffer(file);
    } else {
        alert('Por favor, sube un archivo PDF.');
    }
});

// Renderizar la página del PDF en el canvas
function renderPage(pageNumber) {
    pdfDoc.getPage(pageNumber).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        page.render(renderContext);
    });
}

// Ajustar el tamaño del canvas de firma
function resizeSignaturePad() {
    signaturePadCanvas.width = 200;
    signaturePadCanvas.height = 100;
    signaturePad.clear();
}

resizeSignaturePad();

// Borrar la firma
document.getElementById('clear-signature').addEventListener('click', () => {
    signaturePad.clear();
});

// Guardar el PDF con la firma
document.getElementById('save-pdf').addEventListener('click', () => {
    if (!signaturePad.isEmpty()) {
        const { jsPDF } = window.jspdf;

        // Crear una nueva instancia de jsPDF
        const doc = new jsPDF();

        // Convertir el canvas del PDF a imagen
        const pdfImageData = pdfCanvas.toDataURL('image/png');

        // Añadir la imagen del PDF al documento jsPDF
        doc.addImage(pdfImageData, 'PNG', 0, 0, pdfCanvas.width * 0.264583, pdfCanvas.height * 0.264583); // Convertir px a mm

        // Añadir el texto "Firmado por:" y la firma
        const signatureImage = signaturePad.toDataURL('image/png');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(12);
        doc.text('Firmado por:', pageWidth - 70, pageHeight - 30);  // Posición del texto
        doc.addImage(signatureImage, 'PNG', pageWidth - 60, pageHeight - 25, 40, 20);  // Posición de la firma

        // Descargar el PDF
        doc.save('documento_firmado.pdf');
    } else {
        alert('Por favor, proporciona tu firma.');
    }
});
