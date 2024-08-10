document.getElementById('images').addEventListener('change', function(event) {
    const fileInput = event.target;
    const imageNamesContainer = document.getElementById('imageNames');
    imageNamesContainer.innerHTML = '';

    const files = fileInput.files;
    if (files.length > 5) {
        alert('사진은 최대 5개까지 업로드할 수 있습니다.');
        fileInput.value = ''; // 파일 입력 초기화
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const label = document.createElement('label');
        label.textContent = `사진 ${i + 1} 이름:`;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = `imageName${i + 1}`;
        input.required = true;

        imageNamesContainer.appendChild(label);
        imageNamesContainer.appendChild(input);
    }
});

document.getElementById('docForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const files = document.getElementById('images').files;
    const imageNames = Array.from(document.querySelectorAll('#imageNames input')).map(input => input.value);

    if (files.length === 0 || imageNames.length !== files.length) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    const zip = new PizZip();
    const doc = new window.docxtemplater(zip);

    const content = [
        {type: "title", text: title},
        ...imageNames.map((name, index) => ({
            type: "image",
            name: name,
            image: files[index]
        }))
    ];

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
