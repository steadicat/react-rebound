import React from 'react';
import {AnimatableProps} from './style';
import {useAnimation} from './useAnimation';

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
    const ref = React.useRef<HTMLElement>();
    const animating = React.useRef(false);
    const [, setState] = React.useState(null);
    const latestChildren = React.useRef(children);
    latestChildren.current = children;

    const springs = useAnimation(ref, props, {
      animate,
      tension,
      friction,
      delay,
      onStart() {
        animating.current = true;
        if (typeof latestChildren.current === 'function') {
          setState(null); // Trigger a re-render
        }

        onStart && onStart();
      },
      onEnd() {
        animating.current = false;
        if (typeof latestChildren.current === 'function') {
          setState(null); // Trigger a re-render
        }

        onEnd && onEnd();
      },
    });

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        setVelocity<Prop extends keyof AnimatableProps>(prop: Prop, value: AnimatableProps[Prop]) {
          const spring = springs[prop];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          spring && spring.setVelocity(value as any);
        },
        setCurrentValue<Prop extends keyof AnimatableProps>(
          prop: Prop,
          value: AnimatableProps[Prop],
        ) {
          const spring = springs[prop];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          spring && spring.setCurrentValue(value as any);
        },
        getCurrentValue<Prop extends keyof AnimatableProps>(prop: Prop) {
          const spring = springs[prop];
          return spring && (spring.getCurrentValue() as AnimatableProps[keyof AnimatableProps]);
        },
      }),
      [springs],
    );

    if (typeof children === 'function') {
      children = children(animating.current);
    }
    return React.cloneElement(React.Children.only(children), {ref});
  },
);

Animate.displayName = 'Animate';
