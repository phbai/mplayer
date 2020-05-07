import classNames from "classnames";
import React, { useState, useRef, useEffect } from "react";
import styles from "./styles.less";
import { ConfigIcon } from "../icon/index";

interface VolumeControlProps {
  video: any;
}

const SLIDER_WIDTH = 60;
const HANDLE_WIDTH = 12;

export const VolumeControl = ({ video }: VolumeControlProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volumeHovering, setVolumeHovering] = useState(false);
  const [volumeSliderDowned, setVolumeSliderDowned] = useState(false);
  const volumeSliderRef = useRef(null);
  const savedVolume = useRef(0);
  const [volumeIcon, setVolumeIcon] = useState("volume-2");
  const volumeSliderRect = useRef(null);
  const volumeHandle = useRef(null);

  const volumeClasses = classNames(styles.volumeControl, {
    [styles.hovering]: volumeHovering || volumeSliderDowned,
  });

  useEffect(() => {
    video?.addEventListener("volumechange", onVolumeChangeListener);
    return () => {
      video?.removeEventListener("volumechange", onVolumeChangeListener);
    };
  }, [video]);

  const onVolumeChangeListener = () => {
    const { volume } = video;
    let left = SLIDER_WIDTH * volume - HANDLE_WIDTH / 2;
    left = Math.max(left, 0);
    left = Math.min(left, SLIDER_WIDTH - HANDLE_WIDTH);
    volumeHandle.current.style.left = `${left}px`;
    // update icon
    if (volume === 0) {
      setVolumeIcon("volume-off");
    } else if (volume < 0.5) {
      setVolumeIcon("volume-1");
    } else {
      setVolumeIcon("volume-2");
    }
  };

  const onVolumeMouseEnter = () => {
    setVolumeHovering(true);
  };

  const onVolumeMouseLeave = () => {
    setVolumeHovering(false);
  };

  const onVolumeSliderMouseDown = () => {
    setVolumeSliderDowned(true);
    volumeSliderRect.current = volumeSliderRef.current.getBoundingClientRect();
    document.addEventListener("mousemove", onDocumentMouseMove);
    document.addEventListener("mouseup", onDocumentMouseUp);
  };

  const onDocumentMouseMove = (event: any) => {
    updateOnSliderChange(event);
  };

  const onDocumentMouseUp = () => {
    updateOnSliderChange(event);
    setVolumeSliderDowned(false);
    // remove listeners
    document.removeEventListener("mousemove", onDocumentMouseMove);
    document.removeEventListener("mouseup", onDocumentMouseUp);
  };

  const updateOnSliderChange = (event: any) => {
    // prevent selection occurs
    event.preventDefault();
    let percentage =
      (event.pageX - volumeSliderRect.current.left) / SLIDER_WIDTH;
    percentage = Math.max(0, percentage);
    percentage = Math.min(1, percentage);
    video.volume = percentage;
    if (percentage === 0) {
      // set muted and unmute at half volume
      setIsMuted(true);
      savedVolume.current = 0.5;
    } else {
      // reset mute state
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      video.volume = savedVolume?.current;
    } else {
      setIsMuted(true);
      video.volume = 0;
    }
  };

  return (
    <div
      className={volumeClasses}
      onMouseEnter={onVolumeMouseEnter}
      onMouseLeave={onVolumeMouseLeave}
    >
      <ConfigIcon
        className={styles.volumeIcon}
        name={volumeIcon}
        onClick={toggleMute}
      />
      <div
        className={styles.volumeSlider}
        ref={volumeSliderRef}
        onMouseDown={onVolumeSliderMouseDown}
      >
        <div className={styles.volumeSliderHandle} ref={volumeHandle} />
      </div>
    </div>
  );
};
