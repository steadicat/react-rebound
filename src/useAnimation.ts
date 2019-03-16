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

export function useAnimation(
  ref: MutableRefObject<HTMLElement | undefined>,
  props: Partial<AnimatableProps>,
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
  },
) {
  const springs = React.useRef<{[prop in keyof AnimatableProps]?: rebound.Spring | MultiSpring}>(
    {},
  );
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
      const current: Partial<AnimatableProps> = {};

      for (const p in springs.current) {
        const prop = p as keyof typeof springs.current;
        current[prop] = springs.current[
          prop
        ]!.getCurrentValue() as AnimatableProps[keyof AnimatableProps];
      }

      const style = toStyle(current);
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
    function createSpring<Value extends AnimatableProps[keyof AnimatableProps]>(
      startValue: Value,
    ): Value extends number[] ? MultiSpring : Spring {
      let spring;
      if (Array.isArray(startValue)) {
        spring = new MultiSpring(springSystem, new SpringConfig(tension, friction));
        spring.setCurrentValue(startValue);
      } else {
        spring = springSystem.createSpringWithConfig(new SpringConfig(tension, friction));
        spring.setCurrentValue(startValue as number);
      }
      spring.addListener({onSpringActivate, onSpringAtRest, onSpringUpdate});
      return spring as Value extends number[] ? MultiSpring : Spring;
    }

    for (const p in props) {
      const prop = p as keyof typeof props;
      const value = props[prop];
      if (value === undefined) continue;
      const spring = springs.current[prop] || (springs.current[prop] = createSpring(value));

      if (animate) {
        if (delay) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setTimeout(() => spring.setEndValue(value as any), delay);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          spring.setEndValue(value as any);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spring.setCurrentValue(value as any);
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
