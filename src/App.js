import Verified from "./Components/Verified";
import Instructions from "./Components/Instructions";
import Loading from "./Components/Loading";
import Video from "./Components/Video";
import useFacedetect from "./hooks/useFacedetect";
function App() {
  const { isloaded, facedetected, right, left, top, verified, videoref } =
    useFacedetect();

  if (verified) {
    return <Verified />;
  }
  return (
    <>
      <Video
        isloaded={isloaded}
        facedetected={facedetected}
        videoref={videoref}
      />
      <Instructions
        isloaded={isloaded}
        facedetected={facedetected}
        right={right}
        left={left}
        top={top}
      />
      <Loading isloaded={isloaded} />
    </>
  );
}
export default App;
