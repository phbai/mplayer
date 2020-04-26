import moment from "moment";
import "moment/locale/zh-tw";

moment.locale("zh-cn");
export const getFormattedTime = (seconds: number) =>
  moment()
    .startOf("day")
    .seconds(seconds)
    .format(seconds >= 3600 ? "H:mm:ss" : "m:ss");
