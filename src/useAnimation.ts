import raf from 'raf';
import React, {MutableRefObject, CSSProperties} from 'react';
import rebound, {Spring, SpringConfig} from 'rebound';
import MultiSpring from './MultiSpring';
import {AnimatableProps, toStyle} from './style';

type SpringForProp<Prop extends keyof AnimatableProps> = AnimatableProps[Prop] extends number[]
  ? MultiSpring<AnimatableProps[Prop]>
  : Spring;

const springSystem = new rebound.SpringSystem();

function usePersisted<Value>(value: Value) {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}

function createSpring<Prop extends keyof AnimatableProps>(
  startValue: AnimatableProps[Prop],
  tension: number,
  friction: number,
) {
  let spring;
  if (Array.isArray(startValue)) {
    spring = new MultiSpring(springSystem, new SpringConfig(tension, friction));
    spring.setCurrentValue(startValue);
  } else {
    spring = springSystem.createSpringWithConfig(new SpringConfig(tension, friction));
    spring.setCurrentValue((startValue as unknown) as number);
  }
  return spring as SpringForProp<Prop>;
}

export function useAnimation<Props extends keyof Partial<AnimatableProps>>(
  ref: MutableRefObject<HTMLElement | undefined | null>,
  props: {[prop in Props]: AnimatableProps[prop]},
  {
    animate = true,
    tension = 230,
    friction = 22,
    delay = 0,
    displacementThreshold = 0.001,
    speedThreshold = 0.001,
    clamp = false,
    onStart,
    onEnd,
  }: {
    animate?: boolean;
    tension?: number;
    friction?: number;
    delay?: number;
    displacementThreshold?: number;
    speedThreshold?: number;
    clamp?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  } = {},
) {
  const springs = React.useRef({} as {[Prop in Props]: SpringForProp<Prop>});
  const animating = React.useRef(0);

  const onStartRef = usePersisted(onStart);
  const onSpringActivate = React.useCallback(() => {
    animating.current += 1;
    animating.current === 1 && onStartRef.current && onStartRef.current();
  }, [onStartRef]);

  const onEndRef = usePersisted(onEnd);
  const onSpringAtRest = React.useCallback(() => {
    animating.current -= 1;
    animating.current === 0 && onEndRef.current && onEndRef.current();
  }, [onEndRef]);

  const request = React.useRef<number | null>(null);
  const onSpringUpdate = React.useCallback(() => {
    function performUpdate() {
      if (!ref.current) return;

      request.current = null;
      const currentValues: {[Prop in Props]?: AnimatableProps[Prop]} = {};

      for (const prop in springs.current) {
        currentValues[prop] = springs.current[prop].getCurrentValue();
      }

      const style = toStyle(currentValues);
      for (const p in style) {
        const prop = p as keyof CSSProperties;
        ref.current.style[prop as Exclude<keyof CSSStyleDeclaration, 'length' | 'parentRule'>] =
          style[prop];
      }
    }

    if (!request.current) {
      request.current = raf(performUpdate);
    }
  }, [ref]);

  React.useEffect(() => {
    for (const prop in props) {
      const value = props[prop];
      if (value === undefined) continue;
      let spring = springs.current[prop];
      if (!spring) {
        spring = springs.current[prop] = createSpring(value, tension, friction);
        spring.setRestSpeedThreshold(speedThreshold);
        spring.setRestDisplacementThreshold(displacementThreshold);
        spring.setOvershootClampingEnabled(clamp);
        spring.addListener({onSpringActivate, onSpringAtRest, onSpringUpdate});
      }
      if (!animate) {
        spring.setCurrentValue(value);
        continue;
      }
      if (delay) {
        setTimeout(() => spring.setEndValue(value), delay);
      } else {
        spring.setEndValue(value);
      }
    }
  });

  // Cleanup
  React.useEffect(() => {
    () => {
      for (const prop in springs.current) {
        springs.current[prop].setAtRest();
        springs.current[prop].destroy();
      }
    };
  }, []);

  return springs.current;
}
