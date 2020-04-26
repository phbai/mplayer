// import ShakaPlayer from "shaka-player";
import shaka from "shaka-player/dist/shaka-player.compiled";
import React, {
  useEffect,
  createRef,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import styles from "./styles.less";
import Icon from "../icon/index";
import { getFormattedTime } from "../../utils";

interface PlayerProps {
  src: string;
  width?: number;
}

function Player({ src, width }: PlayerProps, ref: any) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);

  const onTimeUpdateListener = () => {
    const { currentTime, duration } = videoRef?.current;
    console.log("currentTime: ", currentTime, "duration: ", duration);
    // this.$refs.timeDisplayCurrentTime.innerHTML = getFormattedTime(currentTime);
    // this.$refs.timeDisplayDuration.innerHTML = getFormattedTime(duration);
    setProgress((currentTime / duration) * 100);
  };

  useEffect(() => {
    const initPlayer = async () => {
      shaka.polyfill.installAll();
      var player = new shaka.Player(videoRef.current);

      try {
        await player.load(src);
      } catch (err) {
        console.error("Error code", err.code, "object", err);
      }
    };

    initPlayer();

    if (videoRef?.current) {
      console.log("videoRef?.current: ", videoRef?.current);
      videoRef?.current.addEventListener("timeupdate", onTimeUpdateListener);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    // get player() {
    //   return controller.current.player;
    // },
    // get ui() {
    //   return controller.current.ui;
    // },
    get video() {
      return videoRef.current;
    },
  }));

  // return <ShakaPlayer autoPlay src={src} width={width} />;
  return (
    <div className={styles.mplayer}>
      <video ref={videoRef} className={styles.video} />

      <div className={styles.controls}>
        <div className={styles.left}>
          <Icon
            name={paused ? "play" : "pause"}
            onClick={() => {
              console.log("toggle");
              if (paused) {
                videoRef?.current?.play();
              } else {
                videoRef?.current?.pause();
              }
              setPaused(!paused);
            }}
          />
        </div>
      </div>

      <div className={styles.progressBar}>
        <span className={styles.played} style={{ width: `${progress}%` }} />
        <span className={styles.buffered} />
      </div>
    </div>
  );
}

export default forwardRef(Player);
