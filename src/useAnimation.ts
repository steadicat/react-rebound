import raf from 'raf';
import React, {MutableRefObject, CSSProperties} from 'react';
import rebound, {Spring, SpringConfig} from 'rebound';
import MultiSpring from './MultiSpring';
import {AnimatableProps, toStyle} from './style';

const springSystem = new rebound.SpringSystem();

function usePersisted<Value>(value: Value) {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}

function createSpring<Props extends Partial<AnimatableProps>>(
  startValue: Props[keyof Props],
  tension: number,
  friction: number,
): Props[keyof Props] extends number[] ? MultiSpring : Spring {
  let spring;
  if (Array.isArray(startValue)) {
    spring = new MultiSpring(springSystem, new SpringConfig(tension, friction));
    spring.setCurrentValue(startValue);
  } else {
    spring = springSystem.createSpringWithConfig(new SpringConfig(tension, friction));
    spring.setCurrentValue((startValue as unknown) as number);
  }
  return spring as Props[keyof Props] extends number[] ? MultiSpring : Spring;
}

export function useAnimation<Props extends Partial<AnimatableProps>>(
  ref: MutableRefObject<HTMLElement | undefined>,
  props: Props,
  {
    animate = true,
    tension = 230,
    friction = 22,
    delay = 0,
    onStart,
    onEnd,
  }: {
    animate?: boolean;
    tension?: number;
    friction?: number;
    delay?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {},
) {
  const springs = React.useRef<
    {[prop in keyof Props]: Props[prop] extends number ? rebound.Spring : MultiSpring}
  >({} as {[prop in keyof Props]: Props[prop] extends number ? rebound.Spring : MultiSpring});
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
      const currentValues: {[key in keyof Props]?: Props[key]} = {};

      for (const p in springs.current) {
        const prop = p as keyof typeof currentValues;
        currentValues[prop] = springs.current[prop]!.getCurrentValue();
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
    for (const p in props) {
      const prop = p as keyof typeof props;
      const value = props[prop];
      if (value === undefined) continue;
      let spring = springs.current[prop];
      if (!spring) {
        spring = springs.current[prop] = createSpring<Props>(value, tension, friction);
        spring.addListener({onSpringActivate, onSpringAtRest, onSpringUpdate});
      }
      if (!animate) {
        spring.setCurrentValue(value);
        return;
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
      for (const p in springs.current) {
        const prop = p as keyof AnimatableProps;
        springs.current[prop]!.setAtRest();
        springs.current[prop]!.destroy();
      }
    };
  }, []);

  return springs.current;
}
