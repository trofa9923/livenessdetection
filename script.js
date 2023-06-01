const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const message = document.getElementById('message');

// Get user media for video stream
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  .then((stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      startLivenessDetection();
    };
  })
  .catch((error) => {
    console.error('Error accessing webcam:', error);
  });

// Load face detection and expression models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models') // Add this line
])
  .then(startLivenessDetection)
  .catch((error) => {
    console.error('Error loading face detection models:', error);
  });

// Start liveness detection
function startLivenessDetection() {
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks().withFaceExpressions();
    const isLivenessDetected = isRealPerson(detections);

    // Clear canvas
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    // Draw face landmarks on canvas
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(detections, displaySize));
    faceapi.draw.drawFaceLandmarks(canvas, faceapi.resizeResults(detections, displaySize));

    // Perform liveness detection
    if (isLivenessDetected) {
      message.textContent = 'Liveness Detected: Real Person';
      message.style.color = 'green';
    } else {
      message.textContent = 'Liveness Not Detected: Possible Spoof';
      message.style.color = 'red';
    }
  }, 100);
}

// Perform liveness detection based on face expressions and eye landmarks
function isRealPerson(detections) {
  if (detections.length === 0) return false;

  const face = detections[0];
  const leftEye = face.landmarks.getLeftEye();
  const rightEye = face.landmarks.getRightEye();

  // Detect if the person is looking left
  const lookingLeft = leftEye[0].x > rightEye[rightEye.length - 1].x;

  // Detect if the person is looking right
  const lookingRight = rightEye[0].x > leftEye[leftEye.length - 1].x;

  // Detect if the person is blinking their eyes
  const eyeAspectRatio = calculateEyeAspectRatio(leftEye) + calculateEyeAspectRatio(rightEye);
  const blinking = eyeAspectRatio < 0.2;

  return lookingLeft || lookingRight || blinking;
}

// Calculate eye aspect ratio
function calculateEyeAspectRatio(eye) {
  const verticalDist1 = Math.sqrt(
    Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2)
  );
  const verticalDist2 = Math.sqrt(
    Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2)
  );
  const horizontalDist = Math.sqrt(
    Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2)
  );

  return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
}
