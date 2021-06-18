import {Coordinates, Hsv, RootStackParamList} from './types';

// keep result within range
export const clamp = (num: number, min: number, max: number): number => {
  'worklet';
  return Math.min(Math.max(num, min), max);
};

// convert hsv to hsl color
// math from here - https://stackoverflow.com/a/31851617
export const hsvToHsl = (hsv: Hsv): string => {
  'worklet';
  const lPrime = (2 - hsv.s) * hsv.v;
  const divisor = lPrime <= 1 ? lPrime : 2 - lPrime;
  // Avoid division by zero when lightness is close to zero
  const sPrime = divisor < 1e-9 ? 0 : (hsv.s * hsv.v) / divisor;

  const hue = hsv.h;
  const saturation = clamp(sPrime * 100, 0, 100);
  const lightness = clamp(lPrime * 50, 0, 100);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// from a color and a wheel radius, calculate the appropriate puck coords
export const deriveCoordsFromHsv = (
  hsv: Hsv,
  wheelRadius: number,
): Coordinates => {
  // do reverse calculation of coords to hsv
  // takes into account flipped y axis and 90deg rotation of wheel
  let theta = (hsv.h * Math.PI) / 180;
  theta = theta + Math.PI / 2;
  const puckR = hsv.s * wheelRadius;
  const y = -puckR * Math.sin(theta);
  const x = puckR * Math.cos(theta);
  return {x, y};
};

export const onMove = (
  start: Coordinates,
  translation: Coordinates,
  wheelRadius: number,
): {newCoords: Coordinates; hsv: Hsv} => {
  'worklet';
  let newX = start.x + translation.x;
  let newY = start.y + translation.y;

  // calculate distance from center of puck to center of wheel
  const puckR = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2));
  // calculate angle in screen coordinate system (down is +y axis)
  const t = Math.atan2(newY, newX);
  // begin to calculate hue angle by flipping y axis first
  let h = Math.atan2(-newY, newX);
  // then rotate by a quarter so 0rad is top of screen
  h = h - Math.PI / 2;
  // keep it all positive (atan2 range in -PI to PI)
  if (h < 0) {
    h = h + 2 * Math.PI;
  }
  // to degrees, range 0 to 360
  h = (h * 180) / Math.PI;
  // clamp coordinates within wheel
  if (puckR > wheelRadius) {
    newY = wheelRadius * Math.sin(t);
    newX = wheelRadius * Math.cos(t);
  }
  // saturation from 0 to 1
  const s = clamp(puckR / wheelRadius, 0, 1);

  return {
    newCoords: {
      x: newX,
      y: newY,
    },
    hsv: {
      h,
      s,
      v: 0,
    },
  };
};
