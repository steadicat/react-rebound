import {cssFunction, px, ratio, deg} from './converters';

export const transformProperties = {
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  scaleX: 1,
  scaleY: 1,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
};

export type TransformProperties = {[key in keyof typeof transformProperties]: number};

const translate = cssFunction('translate', px[0], px[0]);
const translate3d = cssFunction('translate3d', px[0], px[0], px[0]);
const scale = cssFunction('scale', ratio[0], ratio[0]);
const rotate = cssFunction('rotate', deg[0], deg[0]);
const rotateZ = cssFunction('rotateZ', deg[0]);

export function toTransformStyle({
  translateX: tx,
  translateY: ty,
  translateZ: tz,
  scaleX: sx,
  scaleY: sy,
  rotateX: rx,
  rotateY: ry,
  rotateZ: rz,
}: Partial<TransformProperties>) {
  const transforms = [];
  if (tz !== undefined) {
    transforms.push(translate3d(tx || 0, ty || 0, tz || 0));
  } else if (tx !== undefined || ty !== undefined) {
    transforms.push(translate(tx || 0, ty || 0));
  }
  if (sx !== undefined || sy !== undefined) {
    transforms.push(scale(sx || 1, sy || 1));
  }
  if (rx !== undefined || ry !== undefined) {
    transforms.push(rotate(rx || 0, ry || 0));
  }
  if (rz !== undefined) {
    transforms.push(rotateZ(rz || 0));
  }
  if (transforms.length === 0) return 'none';
  return transforms.join(' ');
}

export function fromTransformStyle(style: string | null): TransformProperties {
  return transformProperties;
}
