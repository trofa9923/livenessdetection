const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const downloadButton = document.getElementById('downloadButton');
const video = document.getElementById('video');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let mediaRecorder = null;
let chunks = [];

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
downloadButton.addEventListener('click', downloadRecording);

function startRecording() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.start();
      downloadButton.disabled = true;
      showMessage('Recording started...');
    })
    .catch((error) => {
      console.error('Unable to access the webcam:', error);
    });
}

function handleDataAvailable(event) {
  chunks.push(event.data);
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();

    downloadButton.disabled = false;
    showMessage('Recording stopped');
  }
}

function downloadRecording() {
  if (chunks.length === 0) {
    showMessage('No recording available');
    return;
  }

  const blob = new Blob(chunks, { type: 'video/webm' });
  const reader = new FileReader();
  reader.onloadend = function () {
    const dataUrl = reader.result;
    console.log('Data URL:', dataUrl); // Log the Data URL to the console
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'recorded_video.webm';
    link.click();
    showMessage('Video downloaded');
  };
  reader.readAsDataURL(blob);
}


function showMessage(text) {
  const message = document.getElementById('message');
  message.textContent = text;
}
