import styles from "./Instructions.module.css";
const Instructions = ({ isloaded, facedetected, right, left, top }) => {
  return (
    <h3
      className={
        isloaded
          ? facedetected
            ? `${styles.headerwithface}`
            : `${styles.header}`
          : `${styles.none}`
      }
    >
      {facedetected
        ? right
          ? left
            ? top
              ? "lower your face alittle"
              : "raise your face alittle to the top"
            : "turn your face alittle to the left"
          : "turn your face alittle to the right"
        : "put your face in the frame"}
    </h3>
  );
};

export default Instructions;
