import React, { useState, useRef, useEffect } from "react";
import { Input, Progress, Button } from "antd";
import _ from "lodash";
import Container from "../components/container/index";
import style from "./home.less";
import Player from "../components/mplayer/index";

export default function Home({ match }: any) {
  const playerRef = React.createRef();
  const inputRef = useRef(null);
  const [src, setSrc] = useState(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  );

  const onChangeUrl = () => {
    const url = inputRef.current.value;
    setSrc(url);
  };

  return (
    <Container className={style.homePage}>
      <div style={{ marginBottom: 10, display: "flex" }}>
        <input ref={inputRef} style={{ flex: 1, marginRight: 10 }} />
        <button onClick={onChangeUrl}>播放</button>
      </div>
      <Player width={1280} src={src} ref={playerRef} />
    </Container>
  );
}
