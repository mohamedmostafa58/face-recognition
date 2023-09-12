import { useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import * as faceapi from "face-api.js";
function App() {
  const videoref = useRef(null);
  const canvasRef = useRef(null);
  const [facedetected, setfacedetected] = useState(false);
  const [right, setright] = useState(false);
  const [left, setleft] = useState(false);
  const [top, settop] = useState(false);
  const [nosepoint, setnosepoint] = useState([0, 0, 0]);
  const [nose, setnose] = useState(null);
  const [verified, setverified] = useState(false);
  const [stream, setstream] = useState(null);
  const [isloaded, setisloaded] = useState(false);
  const [image, setimage] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [timeoutid, settimeoutid] = useState(null);
  useEffect(() => {
    let interval;
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.load("/models");
      await faceapi.loadFaceLandmarkModel("/models");
    };

    const startVideo = async () => {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoref.current) {
        videoref.current.srcObject = userMedia;
        setstream(userMedia);
      }
    };
    const capturePhoto = () => {
      if (videoref.current) {
        const canvas = canvasRef.current;
        const video = videoref.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        setimage(canvas.toDataURL("image/png"));
      }
    };
    const facedetect = async () => {
      await loadModels();
      await startVideo();
      setisloaded(true);
      interval = setInterval(async () => {
        if (videoref.current) {
          const detections = await faceapi
            .detectAllFaces(
              videoref.current,
              new faceapi.SsdMobilenetv1Options()
            )
            .withFaceLandmarks();
          if (detections.length > 0) {
            if (!facedetected) {
              capturePhoto();
            }
            setfacedetected(true);
            setnose(detections[0].landmarks.getNose());
          } else {
            setfacedetected(false);
            setnosepoint([0, 0, 0]);
            setright(false);
            setleft(false);
            settop(false);
            setimage(null);
            clearTimeout(timeoutid);
            settimeoutid(null);
          }
        }
      }, 100);
    };
    setIntervalId(interval);
    facedetect();
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    let timeout;
    if (nose) {
      if (nosepoint[2] !== 0) {
        if (!right) {
          if (Number(nose[3].x) - nosepoint[0] < -60) {
            setright(true);
          }
        } else {
          if (!timeoutid) {
            timeout = setTimeout(() => {
              if (Number(nose[3].x) - nosepoint[0] > 60) {
                setleft(true);
              }
            }, 3000);
            settimeoutid(timeout);
          } else {
            if (!timeout) {
              if (Number(nose[3].x) - nosepoint[0] > 60) {
                setleft(true);
              }
            }
          }
        }
        if (right && left) {
          if (Number(nose[3].y) - nosepoint[1] < -60) {
            settop(true);
          }
        }
      } else {
        setnosepoint([Number(nose[3].x), Number(nose[3].y), 1]);
      }
      if (right && left && top) {
        clearInterval(intervalId);
        videoref.current = null;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        if (videoref.current) {
          videoref.current.srcObject = null;
        }
        setverified(true);
      }
    }
  }, [intervalId, left, nose, nosepoint, right, stream, timeoutid, top]);

  if (verified) {
    return (
      <div className={styles.circle}>
        <span>&#10003;</span>
      </div>
    );
  }
  return (
    <>
      <canvas ref={canvasRef} className={styles.hiddenCanvas}></canvas>
      <div
        className={
          isloaded
            ? !facedetected
              ? `${styles.container}`
              : `${styles.containerwithface}`
            : `${styles.none}`
        }
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={!facedetected ? `${styles.child}` : `${styles.none}`}
          ></div>
        ))}
        <video
          ref={videoref}
          autoPlay
          className={
            !facedetected ? `${styles.video}` : `${styles.videowithface}`
          }
        ></video>
      </div>
      <h3 className={isloaded ? `${styles.header}` : `${styles.none}`}>
        {facedetected
          ? right
            ? left
              ? "raise your face alittle to the top"
              : "turn your face alittle to the left"
            : "turn your face alittle to the right"
          : "put your face in the frame"}
      </h3>
      <div className={isloaded ? `${styles.none}` : `${styles.loading}`}>
        <div className={styles.spinner}></div>
        <h1>Loading...</h1>
      </div>
    </>
  );
}
export default App;
