import { useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import * as faceapi from "face-api.js";
function App() {
  const videoref = useRef(null);
  const [facedetected, setfacedetected] = useState(false);
  const [right, setright] = useState(false);
  const [left, setleft] = useState(false);
  const [top, settop] = useState(false);
  const [bottom, setbottom] = useState(false);
  const [nosepoint, setnosepoint] = useState([0, 0, 0]);
  const [verified, setverified] = useState(false);
  useEffect(() => {
    let interval;
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.load("/models");
      await faceapi.loadFaceLandmarkModel("/models");
    };

    const startVideo = async () => {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoref.current) {
          videoref.current.srcObject = stream;
        }
      });
    };
    const facedetect = async () => {
      await loadModels();
      await startVideo();

      interval = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoref.current, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks();
        if (detections.length > 0) {
          setfacedetected(true);
          console.log(nosepoint);
          const nose = detections[0].landmarks.getNose();
          if (nosepoint[2] !== 0) {
            if (Number(nose[3].x) - nosepoint[0] > 10) {
              setright(true);
            }
            if (Number(nose[3].x) - nosepoint[0] < -10) {
              setleft(true);
            }
            if (Number(nose[3].y) - nosepoint[1] > 10) {
              settop(true);
            }
            if (Number(nose[3].y) - nosepoint[1] < -10) {
              setbottom(true);
            }
          } else {
            setnosepoint([Number(nose[3].x), Number(nose[3].y), 1]);
          }
          if (right && left && top && bottom) {
            setverified(true);
            clearInterval(interval);
          }
        } else {
          setfacedetected(false);
          setnosepoint([0, 0, 0]);
          setright(false);
          setleft(false);
          settop(false);
          setbottom(false);
        }
      }, 100);
    };
    facedetect();
    return () => clearInterval(interval);
  }, [bottom, facedetected, left, nosepoint, right, top]);
  if (verified) {
    return <div className={styles.verified}>whattt</div>;
  }
  return (
    <>
      <div
        className={
          !facedetected ? `${styles.container}` : `${styles.containerwithface}`
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
      <h3>
        {facedetected
          ? "turn your face top, bottom right and left"
          : "put your face in the frame"}
      </h3>
    </>
  );
}
export default App;
