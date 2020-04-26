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

interface VideoInfoProps {
  current: number;
  duration: number;
}

function Player({ src, width }: PlayerProps, ref: any) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(true);
  const [showSetting, setShowSetting] = useState(true);
  const [menus, setMenus] = useState([
    {
      title: "速度",
      value: 1,
      children: [
        {
          title: "0.25x",
          value: 0.25,
        },
        {
          title: "0.5x",
          value: 0.5,
        },
        {
          title: "0.75x",
          value: 0.75,
        },
        {
          title: "1x",
          value: 1,
        },
        {
          title: "1.25x",
          value: 1.25,
        },
        {
          title: "1.5x",
          value: 1.5,
        },
        {
          title: "2x",
          value: 2,
        },
      ],
    },
  ]);
  const [videoInfo, setVideoInfo] = useState<VideoInfoProps>({
    current: 0,
    duration: 0,
  });

  const onTimeUpdateListener = () => {
    const { currentTime, duration } = videoRef?.current;
    console.log("currentTime: ", currentTime, "duration: ", duration);
    setVideoInfo({ current: currentTime, duration });
  };

  useEffect(() => {
    const initPlayer = async () => {
      shaka.polyfill.installAll();
      var player = new shaka.Player(videoRef.current);

      try {
        await player.load(src);
        console.log("player.getVariantTracks: ", player?.getVariantTracks());
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
    get video() {
      return videoRef.current;
    },
  }));

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

          <div className={styles.timeDisplay}>
            <span>{getFormattedTime(videoInfo?.current)}</span>
            <span>{` / `}</span>
            <span>{getFormattedTime(videoInfo?.duration)}</span>
          </div>
        </div>

        <div className={styles.right}>
          <Icon
            name="settings"
            onClick={() => {
              setShowSetting(!showSetting);
            }}
          />

          <div className={styles.playSettings}>
            {menus.map((menu) => (
              <div className={styles.menu}>{menu.title}</div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <span
          className={styles.played}
          style={{
            width: `${(videoInfo?.current / videoInfo?.duration) * 100}%`,
          }}
        />
        <span className={styles.buffered} />
      </div>
    </div>
  );
}

export default forwardRef(Player);
