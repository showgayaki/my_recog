from pathlib import Path
import numpy as np
import cv2
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision


class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout2d()

        self.conv1 = nn.Conv2d(3, 6, 5)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 29 * 29, 120)

        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x.float())))
        x = self.pool(self.relu(self.conv2(x)))
        x = self.dropout(x)
        # print(x.shape)
        x = x.view(x.shape[0], -1)
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x


def round_probability(_prob):
    return round(_prob * 100, 2)


def predict_image(image_ndarray):
    current_dir = Path(__file__).resolve().parent
    model_path = Path(current_dir).joinpath('model', 'michopa_yukipoyo.pth')

    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    net = Net()
    net.eval()
    net.to(device)
    net.load_state_dict(torch.load(model_path, map_location=device))    

    face_ndarray = cv2.cvtColor(image_ndarray, cv2.COLOR_BGR2RGB)
    transform = torchvision.transforms.Compose(
        [
            torchvision.transforms.ToTensor()
            , torchvision.transforms.Normalize((0.5,), (0.5,))
            ]
    )
    img = transform(Image.fromarray(face_ndarray)).unsqueeze(0)
    
    y = net(img)
    probs = F.softmax(y, dim=1)[0].tolist()
    probs = list(map(round_probability, probs))

    result = ['みちょぱ度：{}%'.format(probs[0]), 'ゆきぽよ度：{}%'.format(probs[1])]
    return result
