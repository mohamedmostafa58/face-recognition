import styles from "./Video.module.css";
const Video = ({ isloaded, facedetected, videoref }) => {
  return (
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
  );
};

export default Video;
