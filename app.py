from flask import Flask, render_template, request, jsonify
import base64
from io import BytesIO
from PIL import Image, ImageOps
import tensorflow as tf
import numpy as np

app = Flask(__name__)


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


def preprocessImage(image):

    imageArray = np.array(image)

    if len(imageArray.shape) == 3 and imageArray.shape[2] == 4:  # Check if it's an RGBA image
        alpha = imageArray[:, :, 3][:, :, np.newaxis] / 255.0
        imageArray[:, :, :3] = imageArray[:, :, :3] * alpha + 255 * (1 - alpha)

    image = Image.fromarray(imageArray).convert('L')

    invertedImage = ImageOps.invert(image)

    image = invertedImage.resize((28, 28))

    imageArray = np.array(image)

    imageArray = imageArray / 255.0

    imageArray = imageArray[np.newaxis, ..., np.newaxis]

    return imageArray


def base64ToPng(base64String, outputPath):
    try:
        decodedData = base64.b64decode(base64String)

        image = Image.open(BytesIO(decodedData))

        image.save(outputPath, 'PNG')

        print("Image saved successfully as PNG.")
        return True
    except Exception as e:
        print("Error converting base64 to PNG:", e)
        return False


def base64ToArray(base64String):
    try:

        decodedData = base64.b64decode(base64String)

        image = Image.open(BytesIO(decodedData))
        print("Image successfully converted.")
        return image
    except Exception as e:
        print("Error converting base64:", e)
        return False


@app.route('/uploadImage', methods=['POST'])
def uploadImage():
    data = request.get_json()
    canvasDataUrl = data.get('canvasDataUrl')
    baseImg = canvasDataUrl.split('base64,')[1]

    receivedImg = base64ToArray(baseImg)
    preprocessedImage = preprocessImage(receivedImg)
    loadedModel = tf.keras.models.load_model('mnist_cnn_model.keras')
    prediction = loadedModel.predict(preprocessedImage)
    predictedLabel = np.argmax(prediction[0])

    return jsonify({'message': 'Image received successfully.', 'predicted_label': str(predictedLabel)})


if __name__ == '__main__':
    app.run(debug=True)