import { ConfigMenuItem, ConfigMenuType } from "./index";

export const formatMenuContent = (value: number, type: ConfigMenuType) => {
  switch (type) {
    case ConfigMenuType.Speed:
      return `${value}x`;
    case ConfigMenuType.Resolution:
      if (value === 0) {
        return "自动";
      }
      return `${value}P`;
    default:
      return "";
  }
};
