import raf from 'raf';
import React from 'react';
import ReactDOM from 'react-dom';
import rebound, {SpringConfig, Spring} from 'rebound';
import MultiSpring from './MultiSpring';
import {AnimatableProps, toStyle} from './style';

const springSystem = new rebound.SpringSystem();

export interface AnimateAPI {
  setVelocity<Prop extends keyof AnimatableProps>(prop: Prop, value: AnimatableProps[Prop]): void;
  setCurrentValue<Prop extends keyof AnimatableProps>(
    prop: keyof AnimatableProps,
    value: AnimatableProps[Prop],
  ): void;
  getCurrentValue<Prop extends keyof AnimatableProps>(prop: Prop): AnimatableProps[Prop];
}

export const Animate = React.forwardRef(
  (
    {
      animate = true,
      tension = 230,
      friction = 22,
      delay = 0,
      onStart,
      onEnd,
      children,
      ...props
    }: {
      animate?: boolean;
      tension?: number;
      friction?: number;
      delay?: number;
      onStart?: () => void;
      onEnd?: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: React.ReactElement<any> | ((animating: boolean) => React.ReactElement<any>);
    } & Partial<AnimatableProps>,
    forwardedRef: React.Ref<AnimateAPI>,
  ) => {
    const ref = React.useRef();
    const [, setState] = React.useState(null);
    const springs = React.useRef<{[prop in keyof AnimatableProps]?: rebound.Spring | MultiSpring}>(
      {},
    );
    const animating = React.useRef(false);
    const node = React.useRef<HTMLElement | null>(null);

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        setVelocity<Prop extends keyof AnimatableProps>(prop: Prop, value: AnimatableProps[Prop]) {
          const spring = springs.current[prop];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          spring && spring.setVelocity(value as any);
        },
        setCurrentValue<Prop extends keyof AnimatableProps>(
          prop: Prop,
          value: AnimatableProps[Prop],
        ) {
          const spring = springs.current[prop];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          spring && spring.setCurrentValue(value as any);
        },
        getCurrentValue<Prop extends keyof AnimatableProps>(prop: Prop) {
          const spring = springs.current[prop];
          return spring && spring.getCurrentValue();
        },
      }),
      [],
    );

    const latestChildren = React.useRef(children);
    latestChildren.current = children;

    const onSpringActivate = React.useCallback(() => {
      if (animating.current) return;
      animating.current = true;
      if (typeof latestChildren.current === 'function') {
        setState(null); // Trigger a re-render
      }
      onStart && onStart();
    }, []);

    const onSpringAtRest = React.useCallback(() => {
      if (!animating.current) return;
      animating.current = false;
      if (typeof latestChildren.current === 'function') {
        setState(null); // Trigger a re-render
      }
      onEnd && onEnd();
    }, []);

    const request = React.useRef<number | null>(null);

    const onSpringUpdate = React.useCallback(() => {
      function performUpdate() {
        request.current = null;
        const current: Partial<AnimatableProps> = {};

        for (const p in springs.current) {
          const prop = p as keyof typeof springs.current;
          current[prop] = springs.current[prop]!.getCurrentValue();
        }

        const style = toStyle(current);
        for (const p in style) {
          const prop = p as keyof CSSStyleDeclaration;
          if (prop !== 'length' && prop !== 'parentRule') {
            node.current!.style[prop] = style[prop];
          }
        }
      }

      if (!request.current) {
        request.current = raf(performUpdate);
      }
    }, []);

    React.useEffect(() => {
      () => {
        for (const p in springs.current) {
          const prop = p as keyof AnimatableProps;
          springs.current[prop]!.setAtRest();
          springs.current[prop]!.destroy();
        }
      };
    }, []);

    React.useEffect(() => {
      if (!node.current) {
        // eslint-disable-next-line react/no-find-dom-node
        node.current = ReactDOM.findDOMNode(ref.current) as HTMLElement;
      }

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

    if (typeof children === 'function') {
      children = children(animating.current);
    }
    return React.cloneElement(React.Children.only(children), {ref});
  },
);

Animate.displayName = 'Animate';
