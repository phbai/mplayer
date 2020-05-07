import React from "react";
import classNames from "classnames";
import styles from "./styles.less";

interface IconProps {
  name: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const Icon = ({ name, onClick, style, className }: IconProps) => {
  const classes = classNames(`fe-${name}`, className);
  return <i className={classes} style={style} onClick={onClick} />;
};

export const ConfigIcon = ({ name, onClick, className }: IconProps) => {
  const classes = classNames(styles.playControl, className);
  return <Icon name={name} onClick={onClick} className={classes} />;
};
export default Icon;
