import { createSignal } from "solid-js";
import "./App.css";
import { createEffect } from "solid-js";

function App() {
  const [recording, setRecording] = createSignal(false);
  const [sec, setSec] = createSignal(0);
  const [min, setMin] = createSignal(0);
  const [audioURL, setAudioUrl] = createSignal("");
  let mediaRecorder: MediaRecorder;
  let chunks: BlobPart[] = [];
  let timerInterval: number;
  let stream;

  createEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported.");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((str) => {
          stream = str;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
          };
        })
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    }
  });

  const startTimer = () => {
    timerInterval = setInterval(() => {
      setSec((prev) => (prev === 59 ? 0 : prev + 1));
      if (sec() === 59) {
        setMin((prev) => prev + 1);
      }
    }, 1000);
  };

  return (
    <div class="bg-grey-400 flex flex-col items-center mx-auto w-[96%] md:w-[60%] my-[2%] py-[1rem]">
      <button
        class="cursor-pointer my-2"
        onClick={() => {
          const isRecording = !recording();
          setRecording(isRecording);
          if (isRecording) {
            if (!mediaRecorder) {
              console.error("MediaRecorder is not initialized yet.");
              return;
            }
            chunks = [];
            mediaRecorder.start();
            startTimer();
          } else {
            mediaRecorder.stop();
            clearInterval(timerInterval);
            setSec(0);
            setMin(0);
            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
              chunks = [];
              const audioUrl = window.URL.createObjectURL(blob);
              console.log("url", audioUrl);
              setAudioUrl(audioUrl);
            };
          }
        }}
      >
        {recording() ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
          >
            <path
              fill="red"
              d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.514 2 12 2m0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8s8 3.589 8 8s-3.589 8-8 8"
            />
            <path fill="red" d="M13 9h2v6h-2zM9 9h2v6H9z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 56 56"
          >
            <path
              fill="green"
              d="M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906m0-3.984C16.937 47.922 8.1 39.062 8.1 28c0-11.04 8.813-19.922 19.876-19.922c11.039 0 19.921 8.883 19.945 19.922c.023 11.063-8.883 19.922-19.922 19.922m-4.125-11.297l12.539-7.406c.914-.563.89-1.852 0-2.367l-12.54-7.454c-.96-.562-2.226-.117-2.226.938v15.352c0 1.078 1.196 1.546 2.227.937"
            />
          </svg>
        )}
      </button>
      <p>{`${min()}:${sec()}`}</p>
      {audioURL() && <audio src={`${audioURL()}`} controls></audio>}
    </div>
  );
}

export default App;
