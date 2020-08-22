const dropArea = document.getElementById('drop-area');
const selectFile = document.getElementById('select-file');

// drop-area以外のドラッグ＆ドロップ禁止
window.addEventListener('dragover', function(ev){
    ev.preventDefault();
}, false);
window.addEventListener('drop', function(ev){
    ev.preventDefault();
    ev.stopPropagation();
}, false);

dropArea.addEventListener('dragover', function(e){
	e.preventDefault();
	e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    dropArea.className = 'drag-over';
}, false);
dropArea.addEventListener('dragleave', function(e){
    dropArea.className = 'drag-leave';
}, false);

dropArea.addEventListener('drop', {isDrop: true, handleEvent: postFile}, false);
selectFile.addEventListener('change', {isDrop: false, handleEvent: postFile}, false);

function postFile(e){
    const files = this.isDrop? e.dataTransfer.files : e.target.files;
    e.stopPropagation();
    e.preventDefault();
    const reader = new FileReader();
    
    if(files.length === 1){
        if(files[0].type.indexOf('image/') === 0){
            reader.readAsDataURL(files[0]);
        }else{
            dropArea.className = 'drag-leave';
            alert('画像以外はぴえんです。');
            return;
        }
    }else{
        dropArea.className = 'drag-leave';
        alert('ファイルはひとつだけにしてあげぽよ。');
        return;
    }

	reader.onload = function(e){
        // loading表示
        const loader = document.getElementById('loader');
        loader.style.display = 'block';
        // loadingにかぶらないようにラベル非表示
        const dropAreaLabel = document.getElementById('drop-area-label');
        dropAreaLabel.style.display = 'none';

        resizeBase64Image(e.target.result, 640, function(data){
            const url = '/';
            const json = {image: data};
            
            return fetch(url, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                redirect: 'follow',
                referrer: 'no-referrer',
                body: JSON.stringify(json)
            })
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                } else {
                    console.warn('Something went wrong on api server!');
                }
            })
            .then(json => {
                // ドラッグエリアを非表示
                const dragArea = document.getElementById('image-form');
                dragArea.style.display = 'none';

                const uploadImage = document.getElementById('upload-image');
                const resultArea = document.getElementById('result-area');
                const faces = document.getElementById('faces');

                for(let key in json){
                    if(key !== 'original'){
                        const resultImage = document.createElement('div');
                        resultImage.className = 'result-image';

                        const img = document.createElement('img');
                        img.src = json[key]['data'];
                        img.alt = key;

                        const ul = document.createElement('ul');
                        for (let i in json[key]['score']){
                            const li = document.createElement('li');
                            ul.appendChild(li);
                            li.textContent = json[key]['score'][i];
                            li.className = 'predict-result';
                        }

                        faces.appendChild(resultImage);
                        resultImage.appendChild(img);
                        resultImage.appendChild(ul);
                    }
                }
                loader.classList.add('fade-out');
                resultArea.style.display = 'flex';
                uploadImage.src = json.original;
                loader.style.display = 'none';
            })
            .catch(error => {
                console.error(error);
            })
        });
    }
}


function resizeBase64Image(base64Image, width, callback) {
    // Image Type
    let imgType = base64Image.substring(5, base64Image.indexOf(";"));

    let img = new Image();
    img.onload = function(){
        // New Canvas
        let canvas = document.createElement('canvas');
        canvas.width = width;
        let height = (img.naturalHeight * width) / img.naturalWidth;
        canvas.height = height;
        // Draw (Resize)
        let context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);
        // Destination Image
        let imgB64Dst = canvas.toDataURL(imgType);
        callback(imgB64Dst);
    };
    img.src = base64Image;
}