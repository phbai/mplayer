import React from "react";
import styles from "./styles.less";

interface IconProps {
  name: string;
  onClick?: () => void;
}

const Icon = ({ name, onClick }: IconProps) => {
  return <i className={`${styles.playControl} fe-${name}`} onClick={onClick} />;
};

export default Icon;
