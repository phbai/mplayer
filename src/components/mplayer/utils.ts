import { ConfigMenuItem, ConfigMenuType } from "./index";

export const formatMenuContent = (value: number, type: ConfigMenuType) => {
  switch (type) {
    case ConfigMenuType.Speed:
      return `${value}x`;
    case ConfigMenuType.Resolution:
      return `${value}P`;
    default:
      return "";
  }
};
