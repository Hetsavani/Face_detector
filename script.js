var div = document.getElementById("myc");
// import "./face-api.min"
// import { tinyFaceDetector } from './face-api.js-master/face-api.js-master/src/globalApi/nets';
// import { FaceLandmark68Net } from './face-api.js-master/face-api.js-master/src/faceLandmarkNet/FaceLandmark68Net';
// import { FaceRecognitionNet } from './face-api.js-master/face-api.js-master/src/faceRecognitionNet/FaceRecognitionNet';
// import { FaceExpressionNet } from './face-api.js-master/face-api.js-master/src/faceExpressionNet/FaceExpressionNet';
// varimport { extendWithFaceLandmarks } from './face-api.js-master/face-api.js-master/src/factories/WithFaceLandmarks';
// var viimport { resizeResults } from './face-api.js-master/face-api.js-master/src/resizeResults';
// deo = import { getContext2dOrThrow } from './face-api.js-master/face-api.js-master/src/dom/getContext2dOrThrow';
// import { matchDimensions } from './face-api.js-master/face-api.js-master/src/dom/matchDimensions';

function start(temp){
  if(!temp){
    return;
  }
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]).then(startVideo());
}
var video = document.getElementById("video");
function startVideo() {
  // const iriunStream = new MediaStream();
  // console.log(iriunStream)
  // console.log(video.srcObject)
  // const iriunVideoTrack = iriunStream.addTrack(video.srcObject.getVideoTracks()[0]);
  // video.srcObject = iriunStream;
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  );
}
video.addEventListener("play", () => {
  const siren = new Audio("./ballhit.wav");
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  function areEyesClosed(landmarks) {
    const leftEye = landmarks.getLeftEye();
    // console.log(leftEye)
    const rightEye = landmarks.getRightEye();
    function euclideanDistance(point1, point2) {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    // Calculate eye aspect ratio for both eyes
    function eyeAspectRatio(eye) {
      const vertical1 = euclideanDistance(eye[1], eye[5]);
      //   console.log(vertical1)
      const vertical2 = euclideanDistance(eye[2], eye[4]);
      //   console.log(vertical2)
      const horizontal = euclideanDistance(eye[0], eye[3]);
      //   console.log(horizontal)
      return (vertical1 + vertical2) / (2.0 * horizontal);
    }

    const leftEAR = eyeAspectRatio(leftEye);
    const rightEAR = eyeAspectRatio(rightEye);
    // console.log(leftEAR, rightEAR);
    // Threshold for eye aspect ratio to consider eyes as closed
    const EAR_THRESHOLD = 0.28;
    return (leftEAR + rightEAR) / 2.0 < EAR_THRESHOLD;
  }
  function onEyesClosed() {
    console.log("onEyesClosed");
    if (siren.paused) {
      siren.play();
    }
  }
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //   const landmarks = resizedDetections[0].landmarks;
    //   console.log(resizedDetections[0].landmarks)
    // if(!resizedDetections[0].landmarks){

    // }
    // const landmark = resizedDetections[0].landmarks
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    if (resizedDetections.length > 0) {
      const landmarks = resizedDetections[0].landmarks;
      // console.log(landmarks.getLeftEye())
      if (areEyesClosed(landmarks)) {
        onEyesClosed();
        video.style.border = "5px solid red"
      }else{
        video.style.border = "0px solid red"
      }
    }
  }, 500);
});

// video.addEventListener('play',()=>{
//     const canvas = faceapi.createCanvasFromMedia(video)
//     document.body.append(canvas)
//     const displaySize = {with:video.width, height : video.height}
//     faceapi.matchDimensions(canvas, displaySize)
//     setInterval(async ()=>{
//         const detection = await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
//         console.log(detection)
//         const resizedDetections = faceapi.resizeResults(detection,displaySize)
//         canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
//         faceapi.draw.drawDetections(canvas,resizedDetections)
//         faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
//     },100)

// })
// startVideo();
