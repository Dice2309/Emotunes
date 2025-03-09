import sys
import cv2
import numpy as np
from tensorflow.keras.models import model_from_json

try:
    json_file = open('F:\\Documents\\Assignment\\5\\Emotunes\\fer2013_master\\fer.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    model = model_from_json(loaded_model_json)
    model.load_weights('F:\\Documents\\Assignment\\5\\Emotunes\\fer2013_master\\fer.h5')
    print("Model loaded successfully!")
    model.summary()
except Exception as e:
    print(f"Error loading model: {e}")
    sys.exit(1)

emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
image_path = sys.argv[1]

image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
if image is None:
    print("Error: Could not load image")
    sys.exit(1)

roi_gray = cv2.resize(image, (48, 48))
cropped_img = np.expand_dims(np.expand_dims(roi_gray, -1), 0)
cv2.normalize(cropped_img, cropped_img, alpha=0, beta=1, norm_type=cv2.NORM_L2, dtype=cv2.CV_32F)

prediction = model.predict(cropped_img)
emotion_idx = np.argmax(prediction)
detected_emotion = emotions[emotion_idx]

print(f"Detected emotion from image: {detected_emotion}")