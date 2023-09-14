import styles from "./Loading.module.css";
const Loading = ({ isloaded }) => {
  return (
    <div className={isloaded ? `${styles.none}` : `${styles.loading}`}>
      <div className={styles.spinner}></div>
      <h1>Loading...</h1>
    </div>
  );
};

export default Loading;
