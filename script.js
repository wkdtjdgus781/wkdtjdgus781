let imageCounter = 1;

// 첫 번째 이미지에 대한 미리보기 처리
document.getElementById('images0').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const previewImage = document.getElementById('preview0');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('addImageBtn').addEventListener('click', function() {
    if (imageCounter >= 5) {
        alert('사진은 최대 5개까지 업로드할 수 있습니다.');
        return;
    }

    const imageUploadSection = document.getElementById('imageUploadSection');

    const imageUploadDiv = document.createElement('div');
    imageUploadDiv.className = 'image-upload';

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

    const previewImage = document.createElement('img');
    previewImage.id = `preview${imageCounter}`;
    previewImage.className = 'preview';
    previewImage.style.display = 'none';
    previewImage.alt = '미리보기';

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    imageUploadDiv.appendChild(label);
    imageUploadDiv.appendChild(fileInput);
    imageUploadDiv.appendChild(textInput);
    imageUploadDiv.appendChild(previewImage);

    imageUploadSection.appendChild(imageUploadDiv);

    imageCounter++;
});

document.getElementById('docForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const files = document.querySelectorAll('input[type="file"]');
    const imageNames = document.querySelectorAll('input[name^="imageName"]');

    const content = [{ type: "title", text: title }];

    const fileReaders = [];

    files.forEach((fileInput, index) => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const imageName = imageNames[index].value;

            const reader = new FileReader();
            fileReaders.push(new Promise((resolve) => {
                reader.onload = function(event) {
                    const base64Data = event.target.result.split(',')[1];
                    content.push({ type: "image", name: imageName, image: base64Data });
                    resolve();
                };
                reader.readAsDataURL(file);
            }));
        }
    });

    Promise.all(fileReaders).then(() => {
        generateDocxFile(content, title);
    });
});

function generateDocxFile(content, title) {
    const zip = new PizZip();
    const doc = new window.docxtemplater(zip, { nullGetter: () => "" });

    const docContent = {};

    content.forEach((item, index) => {
        if (item.type === "title") {
            docContent[`title`] = item.text;
        } else if (item.type === "image") {
            docContent[`image${index}`] = {
                data: item.image,
                extension: 'jpg'
            };
        }
    });

    doc.setData(docContent);

    try {
        doc.render();
    } catch (error) {
        console.error('docxtemplater error:', error);
        return;
    }

    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, `${title}.docx`);
}
