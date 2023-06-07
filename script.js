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

    blobToBase64(blob).then(
      (blobtry)=>{		 
       let xhr = new XMLHttpRequest();
      //  var baseUrl = (window.location).href; // You can also use document.URL
      //  var koopId = baseUrl.substring(baseUrl.lastIndexOf('=') + 1, baseUrl.indexOf('&'));
      //  var kooptbl = baseUrl.substring(baseUrl.lastIndexOf('&') + 1);
       var baseUrl = '1'
       var koopId = '2'
       var kooptbl = '3'
       xhr.open("POST", "https://prod-60.southeastasia.logic.azure.com:443/workflows/f4698ff8f7584080bc2abe9fb7efbf09/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=smIe_NUVgekY5xEJ-RcNRA-CKf1hnZNBKHEdDvqp6Ac");
       xhr.setRequestHeader("Accept", "application/json");
       xhr.setRequestHeader("Content-Type", "application/json");
       xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
           console.log(xhr.status);
           console.log(xhr.responseText);
         }};
 
       let data = `{
         "imageUrl": "${blobtry}",
         "mobile": "${koopId}",
         "table" : "${kooptbl}",
         "status": "DONE",
         "ext": "mp4"
       }`;
 
       xhr.send(data);
     }
   )    

  };
  reader.readAsDataURL(blob);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}


function showMessage(text) {
  const message = document.getElementById('message');
  message.textContent = text;
}
