import React from "react";
import styles from "./styles.less";

interface IconProps {
  name: string;
}

const Icon = ({ name }: IconProps) => {
  return <i className={`${styles.playControl} fe-${name}`} />;
};

export default Icon;
