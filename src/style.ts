import {
  fromTransformStyle,
  toTransformStyle,
  TransformProperties,
  transformProperties,
} from './transform';
import {px, alpha, color} from './converters';

export const numericalProperties = {
  top: px,
  left: px,
  right: px,
  bottom: px,
  width: px,
  height: px,
  opacity: alpha,
  background: color,
  backgroundColor: color,
  borderBottomColor: color,
  borderColor: color,
  borderLeftColor: color,
  borderRightColor: color,
  borderTopColor: color,
  color,
  letterSpacing: px,
  lineHeight: px,
  outlineColor: color,
  textDecorationColor: color,
};

type NumericalProperties = {
  [key in keyof typeof numericalProperties]: ReturnType<typeof numericalProperties[key][1]>
};

export type AnimatableProps = TransformProperties & NumericalProperties;

export function toStyle(props: Partial<AnimatableProps>): CSSStyleDeclaration {
  const transformProps: Partial<TransformProperties> = {};
  const style: Partial<NumericalProperties> = {};

  for (const p in props) {
    const val = props[p as keyof typeof props];
    if (val === undefined || val === null) continue;
    if (p in transformProperties) {
      const prop = p as keyof TransformProperties;
      transformProps[prop] = val as number;
    } else if (p in numericalProperties) {
      const prop = p as keyof NumericalProperties;
      style[prop as keyof typeof style] = numericalProperties[prop][0](val);
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unsupported prop', p);
    }
  }

  return {...style, transform: toTransformStyle(transformProps)};
}

export function getCurrentValue(style: CSSStyleDeclaration, p: keyof AnimatableProps) {
  if (p in transformProperties) {
    const prop = p as keyof TransformProperties;
    return fromTransformStyle(style.transform)[prop];
  } else if (p in numericalProperties) {
    const prop = p as keyof NumericalProperties;
    return numericalProperties[prop][1](style[prop]);
  }
  // eslint-disable-next-line no-console
  console.warn('Unsupported prop', p);
  return 0;
}
