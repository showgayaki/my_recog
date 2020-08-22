import sys
import cv2
import numpy as np
import base64
from pathlib import Path
import json
import predict


def base64_to_ndarray(uri):
    base64_data = uri.split(',')[1]
    ndarray = np.frombuffer(base64.b64decode(base64_data), np.uint8)
    img = cv2.imdecode(ndarray, cv2.IMREAD_COLOR)
    return img


def ndarray_to_base64(ndarray):
    _, data = cv2.imencode('.jpg', ndarray)
    base64_str = base64.b64encode(data).decode(encoding='utf-8')
    base64_data = 'data:image/jpeg;base64,{}'.format(base64_str)
    return base64_data


def main():
    current_dir = Path(__file__).resolve().parent
    cascade_path = Path(current_dir).joinpath('cascade', 'haarcascade_frontalface_default.xml')

    # 画像データがbase64形式で標準出力に来る
    upload_data = sys.stdin.readline()
    img = base64_to_ndarray(upload_data)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(str(cascade_path))
    faces = face_cascade.detectMultiScale(gray, 1.3, 3)
    
    images_dict = {}
    for i, (x, y, w, h) in enumerate(faces):
        images_dict[i] = {}
        face_ndarray = img[y:y + h, x:x + w]

        # リサイズしてbase64に変換
        face_ndarray = cv2.resize(face_ndarray, (128, 128))
        face_base64 = ndarray_to_base64(face_ndarray)

        images_dict[i]['data'] = face_base64
        images_dict[i]['score'] = predict.predict_image(face_ndarray)
        img = cv2.rectangle(img, (x, y), (x + w, y + h), (147, 112, 216), 3)

    images_dict['original'] = ndarray_to_base64(img)
    print(json.dumps(images_dict))
    

if __name__ == '__main__':
    main()
