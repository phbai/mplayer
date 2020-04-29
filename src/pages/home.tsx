import React, { useState, useRef, useEffect } from "react";
import { Input, Progress, Button } from "antd";
import _ from "lodash";
import Container from "../components/container/index";
const { Search } = Input;
import style from "./home.less";
import Player from "../components/mplayer/index";
import Icon from "../components/icon/index";

export default function Home({ match }: any) {
  const playerRef = React.createRef();
  // const { player, ui, videoElement } = controllerRef.current;

  return (
    <Container className={style.homePage}>
      <Player
        width={1280}
        // src="http://5.9.136.247/[Sakurato.Sub][Kaguya-sama%20wa%20Kokurasetai%20S2][03][GB][1080P]/index.mpd"
        src="https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/19649098_1b963a65be1d87914d76082627572fad.mp4"
        ref={playerRef}
      />
    </Container>
  );
}
