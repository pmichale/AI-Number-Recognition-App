import tensorflow as tf
from tensorflow.keras import layers, models

# load MNIST dataset
mnist = tf.keras.datasets.mnist
(trainImages, trainLabels), (testImages, testLabels) = mnist.load_data()
# normalize
trainImages, testImages = trainImages / 255.0, testImages / 255.0

# add channel dimension
trainImages = trainImages[..., tf.newaxis]
testImages = testImages[..., tf.newaxis]

# Build the CNN model
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

# Compile the model
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Train the model
epochs = 5
model.fit(trainImages, trainLabels, epochs=epochs, validation_data=(testImages, testLabels))

# Evaluate the model on the test dataset
testLoss, testAccuracy = model.evaluate(testImages, testLabels, verbose=0)
print(f'Test accuracy: {testAccuracy}')

# Save the model (optional)
model.save('mnist_cnn_model.keras')
