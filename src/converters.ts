function int(style: string) {
  return parseInt(style, 10);
}

function colorComponent(x: number) {
  return `${x < 0 ? 0 : x > 255 ? 255 : Math.round(x)}`;
}

export function cssFunction<Values extends (number | string)[]>(
  name: string,
  ...params: {[Value in keyof Values]: (k: Values[Value]) => string}
) {
  return (...values: Values) => `${name}(${params.map((p, i) => p(values[i]))})`;
}

type ConversionPair = [(value: number) => string, (style: string) => number];
type MultiConversionPair<Tuple extends number[]> = [
  (value: Tuple) => string,
  (style: string) => number[]
];

export const px: ConversionPair = [(n: number) => `${n || 0}px`, int];
export const alpha: ConversionPair = [(x: number) => `${x < 0 ? 0 : x > 1 ? 1 : x}`, int];
export const ratio: ConversionPair = [(n: number) => `${n}`, int];
export const deg: ConversionPair = [(n: number) => `${n}deg`, int];

const rgba = cssFunction<[number, number, number, number]>(
  'rgba',
  colorComponent,
  colorComponent,
  colorComponent,
  alpha[0],
);

export const color: MultiConversionPair<[number, number, number, number]> = [
  ([r, g, b, a = 1]: [number, number, number, number]) => rgba(r, g, b, a),
  (style: string) => {
    const match = /rgba?\(([^)]+)\)/.exec(style);
    if (!match) return [0, 0, 0, 0];
    const [r, g, b, a] = match[1].split(',').map(x => parseInt(x, 10));
    return [r, g, b, typeof a === 'undefined' ? 1 : a];
  },
];
