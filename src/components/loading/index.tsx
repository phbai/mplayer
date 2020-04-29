import React from "react";
import classNames from "classnames";
import loading from "../../assets/loading.svg";

interface LoadingProps {
  style?: React.CSSProperties;
  className?: string;
}
export default function Loading({ style, className }: LoadingProps) {
  const classes = classNames(className);
  return (
    <div className={classes} style={style}>
      <img src={loading} />
    </div>
  );
}
