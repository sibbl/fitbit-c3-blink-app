import clock from "clock";
import document from "document";
import { display } from "display";
import { preferences } from "user-settings";
import { me as device } from "device";

import { logoDark, logoLight, rotateContainer, backgroundRect, clockText, popupText } from "./elements";
import { DisplayBrightnessValue }from "./consts";
import colors from "./colors";
import * as util from "./utils";

// set some initial API settings
display.autoOff = false;
clock.granularity = "minutes";

// let's center the image...
if (!device.screen) device.screen = { width: 348, height: 250 };
const logoWidth = device.screen.width;
const logoHeight = 151 * logoWidth / 340;
logoDark.width = logoLight.width = logoWidth;
logoDark.height = logoLight.height = logoHeight;
logoDark.y = logoLight.y = (device.screen.height - logoHeight) / 2;

const intervals = [250, 500, 750];

let colorIndex = 0;
let intervalIndex = Math.floor(intervals.length / 2);
let rotated = false;
let brightnessIndex = 0;
let colorTimeoutId;
let popupTimeoutId;

const setColorTimeout = () => {
  clearTimeout(colorTimeoutId);
  colorTimeoutId = setTimeout(nextChar, intervals[intervalIndex]);
}

const nextChar = () => {
  const {background, foreground} = colors[colorIndex];
  if(foreground === "light") {
    logoDark.style.display = "none";
    logoLight.style.display = "inline";
  } else {
    logoLight.style.display = "none";
    logoDark.style.display = "inline";
  }
  backgroundRect.style.fill = background;
  
  popupText.style.fill = foreground === "light" ? "#fff" : "#000";
  
  colorIndex = (colorIndex + 1) % colors.length;
  
  setColorTimeout();
}
nextChar();

rotateContainer.onclick = () => {
  rotated = !rotated;
  rotateContainer.groupTransform.rotate.angle = rotated ? 180 : 0;
}

const cycleBrightness = () => {
  brightnessIndex = (brightnessIndex + 1) % DisplayBrightnessValue.length;
  display.brightnessOverride = DisplayBrightnessValue[brightnessIndex];  
  showPopup(`Brightness: ${DisplayBrightnessValue[brightnessIndex] || "auto"}`);
}

const cycleInterval = () => {
  intervalIndex = (intervalIndex + 1) % intervals.length;
  setColorTimeout(); 
  showPopup(`Interval: ${intervals[intervalIndex]}ms`);
}

const showPopup = (text) => {
  popupText.text = text;
  clearTimeout(popupTimeoutId);
  popupTimeoutId = setTimeout(() => {
    popupText.text = "";
  }, 1000);
}

document.onkeypress = e => {
  switch(e.key) {
    case "down":
      cycleBrightness();
      break;
    case "up":
      cycleInterval();
      break;
  }
}

clock.ontick = ({date}) => {
  const hours = date.getHours();
  const hoursFormatted = preferences.clockDisplay === "12h" ? (hours % 12 || 12) : util.zeroPad(hours);
  const minsFormatted = util.zeroPad(date.getMinutes());
  clockText.text = `${hoursFormatted}:${minsFormatted}`;
}