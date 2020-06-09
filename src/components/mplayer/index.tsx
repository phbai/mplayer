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
import classNames from "classnames";
import styles from "./styles.less";
import Icon, { ConfigIcon } from "../icon/index";
import { getFormattedTime } from "../../utils";
import { formatMenuContent } from "./utils";
import Loading from "../loading/index";
import { VolumeControl } from "./volumeControl";

interface PlayerProps {
  src: string;
  width?: number;
  autoPlay?: boolean;
}

interface VideoInfoProps {
  current: number;
  duration: number;
  buffered?: number;
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

function Player({ src, width, autoPlay }: PlayerProps, ref: any) {
  const videoRef = useRef(null);
  const mplayerRef = useRef(null);
  const [paused, setPaused] = useState(true);
  const [showSetting, setShowSetting] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);
  const [isContainerHovering, setIsContainerHovering] = useState(false);
  const playerRef = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const timer = useRef(null);
  const video = videoRef?.current;

  const [menus, setMenus] = useState<ConfigMenuItem[]>(
    [
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
      src.endsWith(".mpd") && {
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
    ].filter(Boolean)
  );

  const [videoInfo, setVideoInfo] = useState<VideoInfoProps>({
    current: 0,
    duration: 0,
    buffered: 0,
  });

  const onTimeUpdateListener = () => {
    if (video) {
      setVideoInfo({ current: video?.currentTime, duration: video?.duration });
    }
  };

  const onProgressListener = () => {
    const { buffered, currentTime, duration } = videoRef?.current;
    // https://developer.mozilla.org/en-US/docs/Web/Apps/Fundamentals/Audio_and_video_delivery/buffering_seeking_time_ranges
    // find the buffered block within current time
    let block = null;
    for (let i = 0; i < buffered.length; i += 1) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      if (start <= currentTime && currentTime <= end) {
        block = { start, end };
      }
    }
    if (!block) {
      return;
    }
    const { start: _, end } = block;
    const loaded = (end / duration) * 100;
    setVideoInfo({ current: currentTime, duration, buffered: loaded });
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

  const onFullscreenChangeListener = () => {
    const elem =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    if (elem) {
      // entered
      playerRef.current.isFullscreen = true;
      // player.$el.setAttribute("style", "width: 100vw; height: 100vh"); // necessary for safari
    } else {
      // exited
      playerRef.current.isFullscreen = false;
      // player.$el.removeAttribute("style");
    }
  };

  const onContainerMouseEnter = () => {
    setIsContainerHovering(true);
  };

  const onContainerMouseMove = () => {
    setIsContainerHovering(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setIsContainerHovering(false);
    }, 4000);
  };

  const onContainerMouseLeave = () => {
    setIsContainerHovering(false);
  };

  const onKeydownListener = (event: any) => {
    if (event.target.nodeName === "INPUT") {
      return;
    }
    const video = videoRef?.current;
    switch (event.which) {
      case 32: {
        // space
        console.log("按下了空格键");
        event.preventDefault();
        togglePlay();
        break;
      }
      case 37: {
        // arrow left
        event.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      }
      case 39: {
        // arrow right
        event.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
        break;
      }
      case 70: {
        // char f
        event.preventDefault();
        // this.$emit('signal-toggle-fullscreen')
        break;
      }
      case 77: {
        // char m
        event.preventDefault();
        // this.$emit('signal-toggle-mute')
        break;
      }
      default:
        break;
    }
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
          playerRef.current?.configure(config);
        } else {
          const config = { abr: { enabled: false } };
          playerRef.current?.configure(config);

          const allTracks = playerRef.current?.getVariantTracks();
          const selectedTrack = allTracks?.filter(
            (track: any) => track.height === value
          );
          playerRef.current?.selectVariantTrack(selectedTrack, true);
        }

        break;
      default:
        break;
    }
    setMenus(updatedMenu);
    // 返回顶层菜单
    setCurrentMenu(null);
  };

  const togglePlay = () => {
    console.log("togglePlay");
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

        playerRef.current = player;

        player.addEventListener("buffering", (event: any) => {
          setIsBuffering(event.buffering);
        });
      } catch (err) {
        console.error("Error code", err.code, "object", err);
      }
    };

    initPlayer();

    if (videoRef?.current) {
      videoRef?.current.addEventListener("timeupdate", onTimeUpdateListener);
      videoRef?.current.addEventListener("progress", onProgressListener);

      document.addEventListener("fullscreenchange", onFullscreenChangeListener);
      document.addEventListener(
        "webkitfullscreenchange",
        onFullscreenChangeListener
      );
      document.addEventListener(
        "mozfullscreenchange",
        onFullscreenChangeListener
      );
      document.addEventListener(
        "MSFullscreenChange",
        onFullscreenChangeListener
      );
      window.addEventListener("keydown", onKeydownListener);

      if (autoPlay) {
        togglePlay();
      }
    }

    return function cleanUp() {
      console.log("cleaning...");
      videoRef?.current.removeEventListener("timeupdate", onTimeUpdateListener);
      videoRef?.current.removeEventListener("progress", onProgressListener);

      document.removeEventListener(
        "fullscreenchange",
        onFullscreenChangeListener
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChangeListener
      );
      document.removeEventListener(
        "mozfullscreenchange",
        onFullscreenChangeListener
      );
      document.removeEventListener(
        "MSFullscreenChange",
        onFullscreenChangeListener
      );
      window.removeEventListener("keydown", onKeydownListener);
    };
  }, [src]);

  useImperativeHandle(ref, () => ({
    get video() {
      return video;
    },
  }));

  const containerClasses = classNames(styles.mplayer, {
    [styles.fulled]: isBrowserFullScreen,
  });

  return (
    <div
      className={containerClasses}
      onContextMenu={onContextMenu}
      onMouseEnter={onContainerMouseEnter}
      onMouseLeave={onContainerMouseLeave}
      onMouseMove={onContainerMouseMove}
      ref={mplayerRef}
    >
      <video ref={videoRef} className={styles.video} onClick={togglePlay} />

      <div
        className={classNames(styles.controls, {
          [styles.hidden]: !isContainerHovering,
        })}
      >
        <div className={styles.left}>
          <ConfigIcon name={paused ? "play" : "pause"} onClick={togglePlay} />

          <VolumeControl video={video} />
          <div className={styles.timeDisplay}>
            <span>{getFormattedTime(videoInfo?.current)}</span>
            <span>{` / `}</span>
            <span>{getFormattedTime(videoInfo?.duration)}</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.setting}>
            <ConfigIcon
              name="settings"
              onClick={() => {
                setShowSetting(!showSetting);
              }}
            />
            {video?.videoHeight && (
              <span className={styles.resolution}>{video?.videoHeight}</span>
            )}
          </div>

          <ConfigIcon
            name="tv"
            className={styles.browserFullScreen}
            onClick={() => {
              setIsBrowserFullScreen(!isBrowserFullScreen);
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
                elem = mplayerRef.current;
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
        className={classNames(styles.seekArea, {
          [styles.hidden]: !isContainerHovering,
        })}
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
        <span
          className={styles.buffered}
          style={{ width: `${videoInfo?.buffered}%` }}
        />
      </div>

      {isBuffering && <Loading className={styles.loading} />}
    </div>
  );
}

export default forwardRef(Player);
