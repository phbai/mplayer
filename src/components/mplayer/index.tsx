// import ShakaPlayer from "shaka-player";
import shaka from "shaka-player/dist/shaka-player.compiled";
import React, {
  useEffect,
  createRef,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

interface PlayerProps {
  src: string;
  width?: number;
}

function Player({ src, width }: PlayerProps, ref: any) {
  const videoRef = useRef(null);

  console.log("shaka: ", shaka);
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
    <div>
      <video ref={videoRef} width={width} />
    </div>
  );
}

export default forwardRef(Player);
