# React Rebound

A React component that animates its (only) child directly in the DOM for maximum performance. Spring physics based on [rebound](https://github.com/facebook/rebound-js).

Check out some demos [here](http://steadicat.github.io/react-rebound/).

## Examples

A little “pop” on hover:

```js
import {Animate} from 'react-rebound';

const [hovered] = React.useState(false);

<Animate
  scaleX={hovered ? 1.1 : 1}
  scaleY={hovered ? 1.1 : 1}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}>
  <button>Hover Me</button>
</Animate>
```

A color fade (note the array form of the rgb color):

```js
<Animate color={hovered ? [238, 85, 34] : [0, 0, 0]}>
  <a href="#">Hover Me</a>
</Animate>
```

## Configuring springs

You can use props to configure the spring that’s driving the animation. The `tension` and `friction` parameters are the same as in [rebound-js](http://facebook.github.io/rebound-js/docs/rebound.html#section-11). There’s an extra parameter called `delay` which defers the animation by the specified number of milliseconds. This is useful for cascading animations.

```js
<Animate translateX={clicked ? 200 : 0} tension={200} friction={400} delay={100}>
  <button>Click Me</button>
</Animate>
```

## State during animations

Sometimes it’s useful to render children differently during animations. To do that, provide a function as the only child. The function takes one parameter, a boolean that tells you whether an animation is in progress:

```js
import {Animate} from 'react-rebound';

<Animate scaleX={expanded ? 3 : 1} scaleY={expanded ? 3 : 1}>
  {animating => <img style={{zIndex: expanded || animating ? 1 : 0}} />}
</Animate>
```

## Start and end callbacks

In complex situations it might be useful to be notified when an animation starts or ends. `Animate` provides two callbacks, `onStart` and `onEnd`:

```js
<Animate
  scaleX={expanded ? 5 : 1}
  scaleY={expanded ? 5 : 1}
  onStart={onExpandStart}
  onEnd={onExpandEnd}>
  <img />
</Animate>
```

## Setting initial values

Spring animations should always start from their previous value: this is why with `react-rebound` you only specify the end value of the animation.

In some special cases, it might be necessary to override the start value. You have two options:

  1. Use the `setCurrentValue` imperative API (see “Setting current values and velocity” section below).
  2. Render with an initial value and `animate={false}`, then render again with your end value and `animate={true}`.

```js
const [visible, setVisible] = React.useState(false);

const instantHide = React.useCallback(() => setVisible(false));

const fadeIn = React.useCallback(() => setVisible(true));

<Animate opacity={visible ? 1 : 0} animate={visible}>
  <button>Hover Me</button>
</Animate>
```

## Animating on first render

To animate an element in on first render, start with the initial value, then trigger an animation using `componentDidMount` or `useEffect` and React state:

```js
const [visible, setVisible] = React.useState(false);

React.useEffect(() => setVisible(true), []);

<Animate opacity={visible ? 1 : 0}>
  <button>Hover Me</button>
</Animate>
```

## Setting current values and velocity

You can override the current value and velocity of an animation using the public
methods `setCurrentValue` and `setVelocity` on the `Animate` component instance.
This is useful for swipes and drags, where you want to override the spring
animation while dragging, and preserve velocity when the drag ends.

```js
const animation = React.useRef();

const onSwipeMove = React.useCallback(() => {
  animation.current.setCurrentValue('translateX', currentPosition);
});

const onSwipeEnd = React.useCallback(() => {
  animation.current.setVelocity('translateX', 200);
});

<Animate ref={animation} translateX={restingPosition}>
  <img {...props} />
</Animate>
```

## Supported properties

This is the full list of properties you can animate:

### Transforms

- **translateX**: number in px
- **translateY**: number in px
- **translateZ**: number in px
- **scaleX**: number in px
- **scaleY**: number in px
- **rotateX**: number in px
- **rotateY**: number in px
- **rotateZ**: number in px
- **skewX**: number in px
- **skewY**: number in px

### Position and opacity

- **top**: number in px
- **left**: number in px
- **right**: number in px
- **bottom**: number in px
- **width**: number in px
- **height**: number in px
- **opacity**: number between 0 and 1

### Colors

**Warning**: animating colors causes a paint on every frame. Consider animating using opacity instead.

- **color**: array of numbers, either [r, g, b] or [r, g, b, a]
- **background**: array of numbers, either [r, g, b] or [r, g, b, a]
- **backgroundColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **borderBottomColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **borderColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **borderLeftColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **borderRightColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **borderTopColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **outlineColor**: array of numbers, either [r, g, b] or [r, g, b, a]
- **textDecorationColor**: array of numbers, either [r, g, b] or [r, g, b, a]

### Text

**Warning**: animating text properties can cause performance issues and jittery animations. Consider using scale transforms instead.

- **fontSize**: number in px
- **lineHeight**: number in px
- **letterSpacing**: number in px

