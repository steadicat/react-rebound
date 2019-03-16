import {CSSProperties} from 'react';

function cssFunction<Values extends (number | string)[]>(
  name: string,
  ...params: {[Value in keyof Values]: (k: Values[Value]) => string}
) {
  return (...values: Values) => `${name}(${params.map((p, i) => p(values[i]))})`;
}

function px(n: number) {
  return `${n || 0}px`;
}
function alpha(x: number) {
  return `${x < 0 ? 0 : x > 1 ? 1 : x}`;
}
function ratio(n: number) {
  return `${n}`;
}
function deg(n: number) {
  return `${n}deg`;
}

function colorComponent(x: number) {
  return `${x < 0 ? 0 : x > 255 ? 255 : Math.round(x)}`;
}

const rgb = cssFunction<[number, number, number]>(
  'rgb',
  colorComponent,
  colorComponent,
  colorComponent,
);

const rgba = cssFunction<[number, number, number, number]>(
  'rgba',
  colorComponent,
  colorComponent,
  colorComponent,
  alpha,
);

const translate = cssFunction('translate', px, px);
const translate3d = cssFunction('translate3d', px, px, px);
const scale = cssFunction('scale', ratio, ratio);
const rotate = cssFunction('rotate', deg, deg);
const rotateZ = cssFunction('rotateZ', deg);
const skew = cssFunction('skew', deg, deg);

function color([r, g, b, a]: [number, number, number, number?]) {
  return typeof a === 'undefined' ? rgb(r, g, b) : rgba(r, g, b, a);
}

export const numericalProperties = {
  top: px,
  left: px,
  right: px,
  bottom: px,
  width: px,
  height: px,
  opacity: alpha,
  color,
  background: color,
  backgroundColor: color,
  borderBottomColor: color,
  borderColor: color,
  borderLeftColor: color,
  borderRightColor: color,
  borderTopColor: color,
  outlineColor: color,
  textDecorationColor: color,
  fontSize: px,
  lineHeight: px,
  letterSpacing: px,
};

export const transformProperties = {
  translateX: true,
  translateY: true,
  translateZ: true,
  scaleX: true,
  scaleY: true,
  rotateX: true,
  rotateY: true,
  rotateZ: true,
  skewX: true,
  skewY: true,
};

type NumericalProperties = {
  [key in keyof typeof numericalProperties]: Parameters<typeof numericalProperties[key]>[0]
};

type TransformProperties = {[key in keyof typeof transformProperties]: number};

export type AnimatableProps = TransformProperties & NumericalProperties;

function toTransformStyle({
  translateX: tx,
  translateY: ty,
  translateZ: tz,
  scaleX: sx,
  scaleY: sy,
  rotateX: rx,
  rotateY: ry,
  rotateZ: rz,
  skewX: kx,
  skewY: ky,
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
  if (kx !== undefined || ky !== undefined) {
    transforms.push(skew(kx || 0, ky || 0));
  }
  if (transforms.length === 0) return 'none';
  return transforms.join(' ');
}

export function toStyle(props: Partial<AnimatableProps>): Partial<CSSProperties> {
  const transformProps: Partial<TransformProperties> = {};
  const style: Partial<CSSProperties> = {};

  for (const p in props) {
    const val = props[p as keyof typeof props];
    if (val === undefined || val === null) continue;
    if (p in transformProperties) {
      const prop = p as keyof TransformProperties;
      transformProps[prop] = val as number;
    } else if (p in numericalProperties) {
      const prop = p as keyof NumericalProperties;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style[prop as keyof typeof style] = numericalProperties[prop](val as any);
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unsupported prop', p);
    }
  }

  return {...style, transform: toTransformStyle(transformProps)};
}
