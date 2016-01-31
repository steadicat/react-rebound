# React Rebound

A React component that animates its (only) child directly in the DOM for maximum performance. Spring physics based on [rebound](https://github.com/facebook/rebound-js).

Check out a few simple demos [here](http://steadicat.github.io/react-rebound/).

## Examples

A little “pop” on hover:

```js
import {Animate} from 'react-rebound';

<Animate scaleX={this.state.hovered ? 1.1 : 1} scaleY={this.state.hovered ? 1.1 : 1}>
  <button>Hover Me</button>
</Animate>
```

A color fade (note the array form of the rgb color):

```js
import {Animate} from 'react-rebound';

<Animate color={this.state.hovered ? [238, 85, 34] : [0, 0, 0]}>
  <a href="#" style={{color: '#000'}}>Hover Me</a>
</Animate>
```

## Configuring springs

You can use props to configure the spring that’s driving the animation. The `tension` and `friction` parameters are the same as in [rebound-js](http://facebook.github.io/rebound-js/docs/rebound.html#section-11). There’s an extra parameter called `delay` which defers the animation by the specified number of milliseconds. This is useful for cascading animations.

```js
<Animate translateX={clicked ? 200 : 0} tension={200} friction={400} delay={100}>
  <button {...props}>Click Me</button>
</Animate>
```

## State during animations

Sometimes it’s useful to render children differently during animations. To do that, provide a function as the only child. The function takes one parameter, a boolean that tells you whether an animation is in progress:

```js
import {Animate} from 'react-rebound';

<Animate scaleX={this.state.expanded ? 3 : 1} scaleY={this.state.expanded ? 3 : 1}>
  {animating => <img style={{zIndex: this.state.expanded || animating ? 1 : 0}} />}
</Animate>
```

## Start and end callbacks

In complex situations it might be useful to be notified when an animation starts or ends. `Animate` provides two callbacks, `onStart` and `onEnd`:

```js
<Animate
  scaleX={expanded ? 5 : 1}
  scaleY={expanded ? 5 : 1}
  onStart={actions.onExpandStart}
  onEnd={actions.onExpandEnd}>
  <img {...props} />
</Animate>
```

## Supported attributes

See [stylistic](https://github.com/steadicat/stylistic) for the list of supported attributes, though for performance you should try to stick to the transforms and opacity only.

