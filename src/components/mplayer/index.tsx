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
import Icon, { ConfigIcon } from "../icon/index";
import { getFormattedTime } from "../../utils";
import { formatMenuContent } from "./utils";
import Loading from "../loading/index";

interface PlayerProps {
  src: string;
  width?: number;
}

interface VideoInfoProps {
  current: number;
  duration: number;
}

export enum ConfigMenuType {
  Speed = "speed",
  Resolution = "resolution",
}
export interface ConfigMenuItem {
  title: string;
  value: number;
  type?: ConfigMenuType;
  selected?: Boolean;
  children?: ConfigMenuItem[];
}

function Player({ src, width }: PlayerProps, ref: any) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(true);
  const [showSetting, setShowSetting] = useState(true);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const video = videoRef?.current;
  console.log("video: ", video);

  const [menus, setMenus] = useState<ConfigMenuItem[]>([
    {
      title: "速度",
      value: 1,
      type: ConfigMenuType.Speed,
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
          selected: true,
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
    {
      title: "分辨率",
      value: 0,
      type: ConfigMenuType.Resolution,
      children: [
        {
          title: "1080P",
          value: 1080,
        },
        { title: "720P", value: 720 },
        { title: "480P", value: 480 },
        { title: "自动", value: 0, selected: true },
      ],
    },
  ]);

  const [videoInfo, setVideoInfo] = useState<VideoInfoProps>({
    current: 0,
    duration: 0,
  });

  const onTimeUpdateListener = () => {
    const { currentTime, duration } = video;
    setVideoInfo({ current: currentTime, duration });
  };

  const changeSubMenu = (menu: ConfigMenuItem) => {
    setCurrentMenu(menu);
  };

  const onMouseDown = ({
    nativeEvent: { offsetX },
    target: { clientWidth },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const seekTime = (offsetX / clientWidth) * video.duration;
    setVideoInfo({ current: seekTime, duration: video.duration });
  };

  const onMouseUp = ({
    nativeEvent: { offsetX },
    target: { clientWidth },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const seekTime = (offsetX / clientWidth) * video.duration;
    video.currentTime = seekTime;
    // sync history
    // this.player.syncWatchHistory(true)
  };

  const onContextMenu = (e: any) => {
    e.preventDefault();
  };

  const changeMenu = (type: ConfigMenuType, value: number) => {
    const updatedMenu = menus.map((menu) => {
      if (menu.type === type) {
        return {
          ...menu,
          children: menu.children.map((subMenuItem) => {
            if (subMenuItem.value === value) {
              return {
                ...subMenuItem,
                selected: true,
              };
            }
            return {
              ...subMenuItem,
              selected: false,
            };
          }),
          value,
        };
      }
      return menu;
    });

    switch (type) {
      case ConfigMenuType.Speed:
        video.playbackRate = value;
        break;
      case ConfigMenuType.Resolution:
        if (value === 0) {
          const config = { abr: { enabled: true } };
          player?.configure(config);
        } else {
          const config = { abr: { enabled: false } };
          player?.configure(config);

          const allTracks = player?.getVariantTracks();
          console.log("allTracks: ", allTracks);
          const selectedTrack = allTracks?.filter(
            (track: any) => track.height === value
          );
          console.log("selectedTrack: ", selectedTrack);
          player.selectVariantTrack(selectedTrack, true);
        }

        break;
      default:
        break;
    }
    setMenus(updatedMenu);
    // 返回顶层菜单
    setCurrentMenu(null);
  };

  const toggerPlay = () => {
    if (paused) {
      video?.play();
    } else {
      video?.pause();
    }
    setPaused(!paused);
  };

  useEffect(() => {
    const initPlayer = async () => {
      shaka.polyfill.installAll();
      const player = new shaka.Player(videoRef?.current);

      try {
        await player.load(src);
        console.log("player.getVariantTracks: ", player?.getVariantTracks());

        setPlayer(player);

        player.addEventListener("buffering", (event: any) => {
          setIsBuffering(event.buffering);
        });
      } catch (err) {
        console.error("Error code", err.code, "object", err);
      }
    };

    initPlayer();

    if (video) {
      console.log("video: ", video);
      video.addEventListener("timeupdate", onTimeUpdateListener);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    // get player() {
    //   return controller.current.player;
    // },
    get video() {
      return video;
    },
  }));

  return (
    <div className={styles.mplayer} onContextMenu={onContextMenu}>
      <video ref={videoRef} className={styles.video} />

      <div className={styles.controls}>
        <div className={styles.left}>
          <ConfigIcon name={paused ? "play" : "pause"} onClick={toggerPlay} />

          <div className={styles.timeDisplay}>
            <span>{getFormattedTime(videoInfo?.current)}</span>
            <span>{` / `}</span>
            <span>{getFormattedTime(videoInfo?.duration)}</span>
          </div>
        </div>

        <div className={styles.right}>
          <ConfigIcon
            name="settings"
            onClick={() => {
              setShowSetting(!showSetting);
            }}
          />

          <ConfigIcon
            name={isFullScreen ? "minimize-2" : "maximize-2"}
            onClick={() => {
              // setShowSetting(!showSetting);
              let func;
              let elem;
              if (isFullScreen) {
                elem = document;
                func =
                  document?.exitFullscreen ||
                  document?.webkitExitFullscreen ||
                  document?.mozCancelFullScreen ||
                  document?.msExitFullscreen;
              } else {
                elem = videoRef.current;
                func =
                  elem.requestFullscreen ||
                  elem.webkitRequestFullscreen ||
                  elem.mozRequestFullScreen ||
                  elem.msRequestFullscreen;
              }
              if (func) {
                func.call(elem);
              }
              setIsFullScreen(!isFullScreen);
            }}
          />

          {showSetting && (
            <div className={styles.playSettings}>
              <div className={styles.menu}>
                {currentMenu ? (
                  <>
                    <div
                      className={styles.menuBack}
                      onClick={() => changeSubMenu(null)}
                    >
                      <Icon
                        name="chevron-left"
                        className={styles.menuBackIcon}
                      />
                      <span className={styles.menuBackTitle}>
                        {currentMenu?.title}
                      </span>
                    </div>

                    {(currentMenu?.children ?? []).map(
                      (menu: ConfigMenuItem) => (
                        <div className={styles.menuItem}>
                          <div
                            className={styles.menuOption}
                            onClick={() =>
                              changeMenu(currentMenu.type, menu.value)
                            }
                          >
                            {menu.selected && (
                              <Icon
                                name="check"
                                className={styles.selectedIcon}
                              />
                            )}
                            <span>
                              {formatMenuContent(menu.value, currentMenu.type)}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </>
                ) : (
                  menus.map((menu) => (
                    <div
                      className={styles.menuItem}
                      onClick={() => changeSubMenu(menu)}
                    >
                      <span className={styles.menuTitle}>{menu.title}</span>
                      <span className={styles.menuContent}>
                        {formatMenuContent(menu.value, menu.type)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={styles.seekArea}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
      <div className={styles.progressBar}>
        <span
          className={styles.played}
          style={{
            width: `${(videoInfo?.current / videoInfo?.duration) * 100}%`,
          }}
        />
        <span className={styles.buffered} />
      </div>

      {isBuffering && <Loading className={styles.loading} />}
    </div>
  );
}

export default forwardRef(Player);
