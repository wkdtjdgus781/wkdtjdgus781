let imageCounter = 1;

document.getElementById('addImageBtn').addEventListener('click', function() {
    if (imageCounter >= 5) {
        alert('사진은 최대 5개까지 업로드할 수 있습니다.');
        return;
    }

    const imageUploadSection = document.getElementById('imageUploadSection');

    const label = document.createElement('label');
    label.setAttribute('for', `images${imageCounter}`);
    label.textContent = `사진 ${imageCounter + 1}:`;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = `images${imageCounter}`;
    fileInput.name = 'images';
    fileInput.accept = '.jpg';
    fileInput.required = true;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.name = `imageName${imageCounter}`;
    textInput.placeholder = '사진 이름';
    textInput.required = true;

    imageUploadSection.appendChild(label);
    imageUploadSection.appendChild(fileInput);
    imageUploadSection.appendChild(textInput);

    imageCounter++;
});

document.getElementById('docForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const files = document.querySelectorAll('input[type="file"]');
    const imageNames = document.querySelectorAll('input[type="text"]');

    const content = [{ type: "title", text: title }];

    files.forEach((fileInput, index) => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const imageName = imageNames[index].value;

            content.push({ type: "image", name: imageName, image: file });
        }
    });

    const zip = new PizZip();
    const doc = new window.docxtemplater(zip);

    const docContent = generateDocxContent(content);

    doc.loadZip(zip);
    doc.setData(docContent);
    
    try {
        doc.render();
    } catch (error) {
        console.error('docxtemplater error:', error);
    }

    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, `${title}.docx`);
});

function generateDocxContent(content) {
    const docContent = {};

    content.forEach((item, index) => {
        if (item.type === "title") {
            docContent[`title`] = item.text;
        } else if (item.type === "image") {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result.split(',')[1];
                docContent[`image${index + 1}`] = {
                    data: base64Data,
                    extension: 'jpg'
                };
            };
            reader.readAsDataURL(item.image);
        }
    });

    return docContent;
}
