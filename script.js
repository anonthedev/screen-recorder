let stream = null,
  audio = null,
  mixedStream = null,
  chunks = [],
  recorder = null;
(startButton = null),
  (stopButton = null),
  (downloadButton = null),
  (recordedVideo = null);

async function setupStream() {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    setupVideoFeedback();
  } catch (err) {
    console.log(err);
  }
}

function setupVideoFeedback() {
  if (stream) {
    const video = document.querySelector(".video-feedback");
    video.srcObject = stream;
    video.play();
  } else {
    console.warn("No stream available");
  }
}

async function startRecording() {
  await setupStream();

  if (stream) {
    mixedStream = new MediaStream([...stream.getTracks()]);
    recorder = new MediaRecorder(mixedStream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.start(1000);

    startButton.disabled = true;
    stopButton.disabled = false;

    recordingStatus.innerText = "Recording..."
  } else {
    console.warn("No stream available.");
  }
}

function stopRecording() {
  recorder.stop();

  startButton.disabled = false;
  stopButton.disabled = true;
}

function handleDataAvailable(e) {
  chunks.push(e.data);
}

function handleStop(e) {
  const blob = new Blob(chunks, { type: "video/mp4" });
  chunks = [];

  downloadButton.addEventListener("click", () => {
    downloadButton.href = URL.createObjectURL(blob);
    downloadButton.download = "stream.mp4";
  });

  recordedVideo.src = URL.createObjectURL(blob);
  recordedVideo.load();
  recordedVideo.onloadeddata = function () {
    const rc = document.querySelector(".after-recording");
    rc.style.display = "flex";
    rc.scrollIntoView({ behavior: "smooth", block: "start" });

    recordedVideo.play();
  };

  stream.getTracks().forEach((track) => track.stop());

  recordingStatus.innerText = "Recording Stopped"
}

window.addEventListener("load", () => {
  startButton = document.querySelector(".start-recording");
  stopButton = document.querySelector(".stop-recording");
  downloadButton = document.querySelector(".download-video");
  recordedVideo = document.querySelector(".recorded-video");
  recordingStatus = document.querySelector(".recording-status");

  startButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
});
