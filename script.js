/* GSAP Animations for UI */
gsap.from('header', { opacity: 0, y: -50, duration: 1, ease: 'power3.out' });
gsap.from('main', { opacity: 0, scale: 0.95, duration: 1, delay: 0.3, ease: 'power3.out' });
gsap.from('#sidebar', { x: -250, duration: 1, ease: 'power3.out' });

/* Theme Toggle */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}

/* Sidebar Toggle */
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
sidebarToggle.addEventListener('click', toggleSidebar);
mobileSidebarToggle.addEventListener('click', toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    gsap.to(sidebar, {
        x: sidebar.classList.contains('hidden') ? -250 : 0,
        duration: 0.5,
        ease: 'power3.inOut'
    });
}

/* Section Navigation */
const sections = {
    imageToPdf: document.getElementById('imageToPdfSection'),
    pdfToImage: document.getElementById('pdfToImageSection'),
    excelToPdf: document.getElementById('excelToPdfSection'),
    pdfToExcel: document.getElementById('pdfToExcelSection'),
    pdfToWord: document.getElementById('pdfToWordSection'),
    wordToPdf: document.getElementById('wordToPdfSection'),
    pdfToPpt: document.getElementById('pdfToPptSection'),
    pptToPdf: document.getElementById('pptToPdfSection'),
    pdfToJpg: document.getElementById('pdfToJpgSection'),
    jpgToPdf: document.getElementById('jpgToPdfSection')
};
const navButtons = {
    imageToPdf: document.getElementById('imageToPdfNav'),
    pdfToImage: document.getElementById('pdfToImageNav'),
    excelToPdf: document.getElementById('excelToPdfNav'),
    pdfToExcel: document.getElementById('pdfToExcelNav'),
    pdfToWord: document.getElementById('pdfToWordNav'),
    wordToPdf: document.getElementById('wordToPdfNav'),
    pdfToPpt: document.getElementById('pdfToPptNav'),
    pptToPdf: document.getElementById('pptToPdfNav'),
    pdfToJpg: document.getElementById('pdfToJpgNav'),
    jpgToPdf: document.getElementById('jpgToPdfNav')
};

Object.keys(navButtons).forEach(key => {
    navButtons[key].addEventListener('click', () => {
        Object.values(sections).forEach(section => section.classList.add('hidden'));
        sections[key].classList.remove('hidden');
        Object.values(navButtons).forEach(btn => btn.classList.remove('active-nav'));
        navButtons[key].classList.add('active-nav');
        gsap.from(sections[key], { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
        if (window.innerWidth < 768) toggleSidebar();
    });
});

/* Utility Functions */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast error';
    gsap.to(toast, { opacity: 1, duration: 0.3, onComplete: () => {
        setTimeout(() => gsap.to(toast, { opacity: 0, duration: 0.3 }), 3000);
    }});
}

function clearError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
}

function showSuccess(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast success';
    gsap.to(toast, { opacity: 1, duration: 0.3, onComplete: () => {
        setTimeout(() => gsap.to(toast, { opacity: 0, duration: 0.3 }), 3000);
    }});
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
    });
}

/* Configure pdf.js */
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
} else {
    console.error('pdfjsLib is not loaded. Please check CDN.');
}

/* Image to PDF Logic */
const imageInput = document.getElementById('imageInput');
const dropZone = document.getElementById('dropZone');
const imagePreview = document.getElementById('imagePreview');
let images = [];

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleImageFiles(e.dataTransfer.files);
});

dropZone.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', () => handleImageFiles(imageInput.files));

function handleImageFiles(files) {
    clearError();
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let file of files) {
        if (!validTypes.includes(file.type)) {
            showError('Please upload only JPEG or PNG images.');
            return;
        }
        if (file.size > maxSize) {
            showError('File size should be less than 10MB.');
            return;
        }

        new Compressor(file, {
            quality: parseFloat(document.getElementById('quality').value),
            maxWidth: 1920,
            maxHeight: 1920,
            success(compressedFile) {
                const imgData = URL.createObjectURL(compressedFile);
                images.push({ file: compressedFile, data: imgData });
                renderImages();
            },
            error() {
                showError('Error compressing image.');
            }
        });
    }
}

function renderImages() {
    imagePreview.innerHTML = '';
    images.forEach((img, index) => {
        const imgElement = document.createElement('div');
        imgElement.className = 'relative';
        imgElement.setAttribute('role', 'listitem');
        imgElement.innerHTML = `
            <img src="${img.data}" alt="Image preview ${index + 1}" class="cursor-move">
            <button onclick="removeImage(${index})" class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center remove-btn" aria-label="Remove image">×</button>
        `;
        imagePreview.appendChild(imgElement);
        gsap.from(imgElement, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
    });

    new Sortable(imagePreview, {
        animation: 200,
        handle: 'img',
        onEnd: (evt) => {
            const movedImage = images.splice(evt.oldIndex, 1)[0];
            images.splice(evt.newIndex, 0, movedImage);
        }
    });
}

function removeImage(index) {
    images.splice(index, 1);
    renderImages();
}

async function generatePDF() {
    if (images.length === 0) {
        showError('Please upload at least one image.');
        return;
    }

    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('progressBar');
    const progressBarFill = document.getElementById('progressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!window.jspdf) {
        showError('jsPDF library not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    const { jsPDF } = window.jspdf;
    const margin = parseInt(document.getElementById('margin').value) || 10;
    const fileName = document.getElementById('fileName').value || 'converted';
    const doc = new jsPDF({
        orientation: document.getElementById('orientation').value,
        unit: 'mm',
        format: document.getElementById('pageSize').value
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - 2 * margin;
    const usableHeight = pageHeight - 2 * margin;

    try {
        for (let i = 0; i < images.length; i++) {
            if (i > 0) doc.addPage();
            const imgData = await readFileAsDataURL(images[i].file);
            const imgProps = doc.getImageProperties(imgData);
            let imgWidth = usableWidth;
            let imgHeight = (imgProps.height * usableWidth) / imgProps.width;

            if (imgHeight > usableHeight) {
                imgHeight = usableHeight;
                imgWidth = (imgProps.width * usableHeight) / imgProps.height;
            }

            doc.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            progressBarFill.style.width = `${((i + 1) / images.length) * 100}%`;
        }

        doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('PDF generated successfully!');
    } catch (error) {
        showError('Error generating PDF: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* PDF to Image Logic */
const pdfInput = document.getElementById('pdfInput');
const pdfDropZone = document.getElementById('pdfDropZone');
const pdfPreview = document.getElementById('pdfPreview');

pdfDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfDropZone.classList.add('dragover');
});

pdfDropZone.addEventListener('dragleave', () => {
    pdfDropZone.classList.remove('dragover');
});

pdfDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfDropZone.classList.remove('dragover');
    handlePdfFile(e.dataTransfer.files[0]);
});

pdfDropZone.addEventListener('click', () => pdfInput.click());

pdfInput.addEventListener('change', () => handlePdfFile(pdfInput.files[0]));

async function handlePdfFile(file) {
    clearError();
    if (!file || file.type !== 'application/pdf') {
        showError('Please upload a valid PDF file.');
        return;
    }
    if (file.size > 20 * 1024 * 1024) {
        showError('PDF size should be less than 20MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const pdfData = new Uint8Array(fileReader.result);
        await convertPdfToImages(pdfData, file.name);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertPdfToImages(pdfData, originalFileName) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('pdfProgressBar');
    const progressBarFill = document.getElementById('pdfProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!pdfjsLib) {
        showError('PDF.js library not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    try {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        const images = [];
        const zip = new JSZip();
        const fileNamePrefix = document.getElementById('pdfFileName').value || 'extracted';

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            const imgData = canvas.toDataURL('image/png');
            images.push({ data: imgData, page: pageNum });

            const imgElement = document.createElement('div');
            imgElement.className = 'relative';
            imgElement.setAttribute('role', 'listitem');
            imgElement.innerHTML = `
                <img src="${imgData}" alt="Page ${pageNum} preview" class="cursor-pointer">
                <button onclick="downloadSingleImage('${imgData}', '${fileNamePrefix}_page${pageNum}.png')" class="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center remove-btn" aria-label="Download image">↓</button>
            `;
            pdfPreview.appendChild(imgElement);
            gsap.from(imgElement, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });

            zip.file(`${fileNamePrefix}_page${pageNum}.png`, imgData.split(',')[1], { base64: true });
            progressBarFill.style.width = `${(pageNum / numPages) * 100}%`;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${fileNamePrefix}_images.zip`;
        link.click();
        URL.revokeObjectURL(zipUrl);

        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('Images extracted successfully!');
    } catch (error) {
        showError('Error converting PDF to images: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

function downloadSingleImage(imgData, fileName) {
    const link = document.createElement('a');
    link.href = imgData;
    link.download = fileName;
    link.click();
}

/* Excel to PDF Logic */
const excelInput = document.getElementById('excelInput');
const excelDropZone = document.getElementById('excelDropZone');

excelDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    excelDropZone.classList.add('dragover');
});

excelDropZone.addEventListener('dragleave', () => {
    excelDropZone.classList.remove('dragover');
});

excelDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    excelDropZone.classList.remove('dragover');
    handleExcelFile(e.dataTransfer.files[0]);
});

excelDropZone.addEventListener('click', () => excelInput.click());

excelInput.addEventListener('change', () => handleExcelFile(excelInput.files[0]));

async function handleExcelFile(file) {
    clearError();
    if (!file || !file.name.match(/\.(xls|xlsx)$/)) {
        showError('Please upload a valid Excel file (.xls or .xlsx).');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showError('Excel file size should be less than 10MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const data = new Uint8Array(fileReader.result);
        await convertExcelToPdf(data);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertExcelToPdf(data) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('excelProgressBar');
    const progressBarFill = document.getElementById('excelProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!XLSX || !window.jspdf) {
        showError('Required libraries (XLSX or jsPDF) not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    try {
        const workbook = XLSX.read(data, { type: 'array' });
        const { jsPDF } = window.jspdf;
        const margin = parseInt(document.getElementById('excelMargin').value) || 10;
        const fileName = document.getElementById('excelFileName').value || 'excel_converted';
        const doc = new jsPDF({
            orientation: document.getElementById('excelOrientation').value,
            unit: 'mm',
            format: document.getElementById('excelPageSize').value
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - 2 * margin;
        let y = margin;

        workbook.SheetNames.forEach((sheetName, index) => {
            if (index > 0) doc.addPage();
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            doc.setFontSize(12);
            doc.text(sheetName, margin, y);
            y += 10;

            rows.forEach((row, rowIndex) => {
                if (y > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    y = margin;
                }
                row.forEach((cell, colIndex) => {
                    const x = margin + colIndex * (usableWidth / 4);
                    doc.text(String(cell || ''), x, y);
                });
                y += 8;
                progressBarFill.style.width = `${((rowIndex + 1) / rows.length) * 100}%`;
            });
        });

        doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('Excel converted to PDF successfully!');
    } catch (error) {
        showError('Error converting Excel to PDF: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* PDF to Excel Logic */
const pdfExcelInput = document.getElementById('pdfExcelInput');
const pdfExcelDropZone = document.getElementById('pdfExcelDropZone');

pdfExcelDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfExcelDropZone.classList.add('dragover');
});

pdfExcelDropZone.addEventListener('dragleave', () => {
    pdfExcelDropZone.classList.remove('dragover');
});

pdfExcelDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfExcelDropZone.classList.remove('dragover');
    handlePdfExcelFile(e.dataTransfer.files[0]);
});

pdfExcelDropZone.addEventListener('click', () => pdfExcelInput.click());

pdfExcelInput.addEventListener('change', () => handlePdfExcelFile(pdfExcelInput.files[0]));

async function handlePdfExcelFile(file) {
    clearError();
    if (!file || file.type !== 'application/pdf') {
        showError('Please upload a valid PDF file.');
        return;
    }
    if (file.size > 20 * 1024 * 1024) {
        showError('PDF size should be less than 20MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const pdfData = new Uint8Array(fileReader.result);
        await convertPdfToExcel(pdfData);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertPdfToExcel(pdfData) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('pdfExcelProgressBar');
    const progressBarFill = document.getElementById('pdfExcelProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!pdfjsLib || !XLSX) {
        showError('Required libraries (PDF.js or XLSX) not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    try {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        const workbook = XLSX.utils.book_new();
        const rows = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageRows = textContent.items.map(item => [item.str]);
            rows.push(...pageRows);
            progressBarFill.style.width = `${(pageNum / numPages) * 100}%`;
        }

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const fileName = document.getElementById('pdfExcelFileName').value || 'pdf_to_excel';
        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);

        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('PDF converted to Excel successfully!');
    } catch (error) {
        showError('Error converting PDF to Excel: Works best with text-based PDFs. ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* PDF to Word Logic */
const pdfWordInput = document.getElementById('pdfWordInput');
const pdfWordDropZone = document.getElementById('pdfWordDropZone');

pdfWordDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfWordDropZone.classList.add('dragover');
});

pdfWordDropZone.addEventListener('dragleave', () => {
    pdfWordDropZone.classList.remove('dragover');
});

pdfWordDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfWordDropZone.classList.remove('dragover');
    handlePdfWordFile(e.dataTransfer.files[0]);
});

pdfWordDropZone.addEventListener('click', () => pdfWordInput.click());

pdfWordInput.addEventListener('change', () => handlePdfWordFile(pdfWordInput.files[0]));

async function handlePdfWordFile(file) {
    clearError();
    if (!file || file.type !== 'application/pdf') {
        showError('Please upload a valid PDF file.');
        return;
    }
    if (file.size > 20 * 1024 * 1024) {
        showError('PDF size should be less than 20MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const pdfData = new Uint8Array(fileReader.result);
        await convertPdfToWord(pdfData);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertPdfToWord(pdfData) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('pdfWordProgressBar');
    const progressBarFill = document.getElementById('pdfWordProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!pdfjsLib || !docx) {
        showError('Required libraries (PDF.js or docx) not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    try {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        const doc = new docx.Document({
            sections: []
        });

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');

            doc.addSection({
                children: [
                    new docx.Paragraph({
                        text: textItems || ' ',
                        spacing: { after: 200 }
                    })
                ]
            });
            progressBarFill.style.width = `${(pageNum / numPages) * 100}%`;
        }

        const fileName = document.getElementById('pdfWordFileName').value || 'pdf_to_word';
        const blob = await docx.Packer.toBlob(doc);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.docx`;
        link.click();
        URL.revokeObjectURL(link.href);

        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('PDF converted to Word successfully!');
    } catch (error) {
        showError('Error converting PDF to Word: Works best with text-based PDFs. ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* Word to PDF Logic */
const wordInput = document.getElementById('wordInput');
const wordDropZone = document.getElementById('wordDropZone');

wordDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    wordDropZone.classList.add('dragover');
});

wordDropZone.addEventListener('dragleave', () => {
    wordDropZone.classList.remove('dragover');
});

wordDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    wordDropZone.classList.remove('dragover');
    handleWordFile(e.dataTransfer.files[0]);
});

wordDropZone.addEventListener('click', () => wordInput.click());

wordInput.addEventListener('change', () => handleWordFile(wordInput.files[0]));

async function handleWordFile(file) {
    clearError();
    if (!file || !file.name.match(/\.(doc|docx)$/)) {
        showError('Please upload a valid Word file (.doc or .docx).');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showError('Word file size should be less than 10MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const arrayBuffer = fileReader.result;
        await convertWordToPdf(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertWordToPdf(arrayBuffer) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('wordProgressBar');
    const progressBarFill = document.getElementById('wordProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    try {
        showError('Word to PDF conversion requires server-side processing. Please use tools like Smallpdf or iLovePDF for now.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        // Suggestion: Implement server-side processing with Node.js and libraries like 'libreoffice-convert'
        return;
    } catch (error) {
        showError('Error converting Word to PDF: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* PDF to PPT Logic */
const pdfPptInput = document.getElementById('pdfPptInput');
const pdfPptDropZone = document.getElementById('pdfPptDropZone');

pdfPptDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfPptDropZone.classList.add('dragover');
});

pdfPptDropZone.addEventListener('dragleave', () => {
    pdfPptDropZone.classList.remove('dragover');
});

pdfPptDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfPptDropZone.classList.remove('dragover');
    handlePdfPptFile(e.dataTransfer.files[0]);
});

pdfPptDropZone.addEventListener('click', () => pdfPptInput.click());

pdfPptInput.addEventListener('change', () => handlePdfPptFile(pdfPptInput.files[0]));

async function handlePdfPptFile(file) {
    clearError();
    if (!file || file.type !== 'application/pdf') {
        showError('Please upload a valid PDF file.');
        return;
    }
    if (file.size > 20 * 1024 * 1024) {
        showError('PDF size should be less than 20MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const pdfData = new Uint8Array(fileReader.result);
        await convertPdfToPpt(pdfData);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertPdfToPpt(pdfData) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('pdfPptProgressBar');
    const progressBarFill = document.getElementById('pdfPptProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    try {
        showError('PDF to PPT conversion requires server-side processing. Please use tools like Smallpdf or Adobe Acrobat for now.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        // Suggestion: Use server-side tools like 'unoconv' or APIs like Adobe Document Cloud
        return;
    } catch (error) {
        showError('Error converting PDF to PPT: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* PPT to PDF Logic */
const pptInput = document.getElementById('pptInput');
const pptDropZone = document.getElementById('pptDropZone');

pptDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pptDropZone.classList.add('dragover');
});

pptDropZone.addEventListener('dragleave', () => {
    pptDropZone.classList.remove('dragover');
});

pptDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    pptDropZone.classList.remove('dragover');
    handlePptFile(e.dataTransfer.files[0]);
});

pptDropZone.addEventListener('click', () => pptInput.click());

pptInput.addEventListener('change', () => handlePptFile(pptInput.files[0]));

async function handlePptFile(file) {
    clearError();
    if (!file || !file.name.match(/\.(ppt|pptx)$/)) {
        showError('Please upload a valid PPT file (.ppt or .pptx).');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showError('PPT file size should be less than 10MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const arrayBuffer = fileReader.result;
        await convertPptToPdf(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertPptToPdf(arrayBuffer) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('pptProgressBar');
    const progressBarFill = document.getElementById('pptProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    try {
        showError('PPT to PDF conversion requires server-side processing. Please use tools like Smallpdf or Adobe Acrobat for now.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        // Suggestion: Use server-side tools like 'unoconv' or APIs like Microsoft Graph
        return;
    } catch (error) {
        showError('Error converting PPT to PDF: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* PDF to JPG Logic */
const pdfJpgInput = document.getElementById('pdfJpgInput');
const pdfJpgDropZone = document.getElementById('pdfJpgDropZone');
const pdfJpgPreview = document.getElementById('pdfPreview'); // Reuse pdfPreview for simplicity

pdfJpgDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfJpgDropZone.classList.add('dragover');
});

pdfJpgDropZone.addEventListener('dragleave', () => {
    pdfJpgDropZone.classList.remove('dragover');
});

pdfJpgDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfJpgDropZone.classList.remove('dragover');
    handlePdfJpgFile(e.dataTransfer.files[0]);
});

pdfJpgDropZone.addEventListener('click', () => pdfJpgInput.click());

pdfJpgInput.addEventListener('change', () => handlePdfJpgFile(pdfJpgInput.files[0]));

async function handlePdfJpgFile(file) {
    clearError();
    if (!file || file.type !== 'application/pdf') {
        showError('Please upload a valid PDF file.');
        return;
    }
    if (file.size > 20 * 1024 * 1024) {
        showError('PDF size should be less than 20MB.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const pdfData = new Uint8Array(fileReader.result);
        await convertPdfToJpg(pdfData);
    };
    fileReader.readAsArrayBuffer(file);
}

async function convertPdfToJpg(pdfData) {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('pdfJpgProgressBar');
    const progressBarFill = document.getElementById('pdfJpgProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!pdfjsLib || !JSZip) {
        showError('Required libraries (PDF.js or JSZip) not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    try {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const numPages = pdf.numPages;
        const images = [];
        const zip = new JSZip();
        const fileNamePrefix = document.getElementById('pdfJpgFileName').value || 'pdf_to_jpg';

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            const imgData = canvas.toDataURL('image/jpeg', 0.9); // JPEG with high quality
            images.push({ data: imgData, page: pageNum });

            const imgElement = document.createElement('div');
            imgElement.className = 'relative';
            imgElement.setAttribute('role', 'listitem');
            imgElement.innerHTML = `
                <img src="${imgData}" alt="Page ${pageNum} preview" class="cursor-pointer">
                <button onclick="downloadSingleImage('${imgData}', '${fileNamePrefix}_page${pageNum}.jpg')" class="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center remove-btn" aria-label="Download image">↓</button>
            `;
            pdfJpgPreview.appendChild(imgElement);
            gsap.from(imgElement, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });

            zip.file(`${fileNamePrefix}_page${pageNum}.jpg`, imgData.split(',')[1], { base64: true });
            progressBarFill.style.width = `${(pageNum / numPages) * 100}%`;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${fileNamePrefix}_images.zip`;
        link.click();
        URL.revokeObjectURL(zipUrl);

        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('PDF converted to JPG successfully!');
    } catch (error) {
        showError('Error converting PDF to JPG: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}

/* JPG to PDF Logic */
const jpgInput = document.getElementById('jpgInput');
const jpgDropZone = document.getElementById('jpgDropZone');
const jpgPreview = document.getElementById('jpgPreview');
let jpgImages = [];

jpgDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    jpgDropZone.classList.add('dragover');
});

jpgDropZone.addEventListener('dragleave', () => {
    jpgDropZone.classList.remove('dragover');
});

jpgDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    jpgDropZone.classList.remove('dragover');
    handleJpgFiles(e.dataTransfer.files);
});

jpgDropZone.addEventListener('click', () => jpgInput.click());

jpgInput.addEventListener('change', () => handleJpgFiles(jpgInput.files));

function handleJpgFiles(files) {
    clearError();
    const validTypes = ['image/jpeg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let file of files) {
        if (!validTypes.includes(file.type)) {
            showError('Please upload only JPEG images.');
            return;
        }
        if (file.size > maxSize) {
            showError('File size should be less than 10MB.');
            return;
        }

        new Compressor(file, {
            quality: 0.9,
            maxWidth: 1920,
            maxHeight: 1920,
            success(compressedFile) {
                const imgData = URL.createObjectURL(compressedFile);
                jpgImages.push({ file: compressedFile, data: imgData });
                renderJpgImages();
            },
            error() {
                showError('Error compressing JPG image.');
            }
        });
    }
}

function renderJpgImages() {
    jpgPreview.innerHTML = '';
    jpgImages.forEach((img, index) => {
        const imgElement = document.createElement('div');
        imgElement.className = 'relative';
        imgElement.setAttribute('role', 'listitem');
        imgElement.innerHTML = `
            <img src="${img.data}" alt="JPG preview ${index + 1}" class="cursor-move">
            <button onclick="removeJpgImage(${index})" class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center remove-btn" aria-label="Remove image">×</button>
        `;
        jpgPreview.appendChild(imgElement);
        gsap.from(imgElement, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
    });

    new Sortable(jpgPreview, {
        animation: 200,
        handle: 'img',
        onEnd: (evt) => {
            const movedImage = jpgImages.splice(evt.oldIndex, 1)[0];
            jpgImages.splice(evt.newIndex, 0, movedImage);
        }
    });
}

function removeJpgImage(index) {
    jpgImages.splice(index, 1);
    renderJpgImages();
}

async function convertJpgToPdf() {
    if (jpgImages.length === 0) {
        showError('Please upload at least one JPG image.');
        return;
    }

    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('jpgProgressBar');
    const progressBarFill = document.getElementById('jpgProgressBarFill');
    loader.style.display = 'block';
    progressBar.style.display = 'block';
    clearError();

    if (!window.jspdf) {
        showError('jsPDF library not loaded. Please check CDN.');
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        return;
    }

    const { jsPDF } = window.jspdf;
    const fileName = document.getElementById('jpgFileName').value || 'jpg_to_pdf';
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - 2 * margin;
    const usableHeight = pageHeight - 2 * margin;

    try {
        for (let i = 0; i < jpgImages.length; i++) {
            if (i > 0) doc.addPage();
            const imgData = await readFileAsDataURL(jpgImages[i].file);
            const imgProps = doc.getImageProperties(imgData);
            let imgWidth = usableWidth;
            let imgHeight = (imgProps.height * usableWidth) / imgProps.width;

            if (imgHeight > usableHeight) {
                imgHeight = usableHeight;
                imgWidth = (imgProps.width * usableHeight) / imgProps.height;
            }

            doc.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            progressBarFill.style.width = `${((i + 1) / jpgImages.length) * 100}%`;
        }

        doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
        showSuccess('JPG converted to PDF successfully!');
    } catch (error) {
        showError('Error converting JPG to PDF: ' + error.message);
        loader.style.display = 'none';
        progressBar.style.display = 'none';
    }
}
