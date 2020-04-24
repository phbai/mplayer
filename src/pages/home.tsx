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
        src="http://5.9.136.247/[Sakurato.Sub][Kaguya-sama%20wa%20Kokurasetai%20S2][02][GB][1080P]/index.mpd"
        ref={playerRef}
      />
      <div>
        <Icon name="play" />
        <button
          onClick={(e) => {
            playerRef?.current?.video?.pause();
          }}
        >
          pause
        </button>
        <button
          onClick={(e) => {
            playerRef?.current?.video?.play();
          }}
        >
          play
        </button>
      </div>
    </Container>
  );
}
