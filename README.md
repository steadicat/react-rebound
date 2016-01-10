# React Rebound

A React component that animates its (only) child directly in the DOM for maximum performance. Spring physics based on [rebound](https://github.com/facebook/rebound-js).

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

## State during animations

Sometimes it’s useful to render children differently during animations. To do that, provide a function as the only child. The function takes one parameter, a boolean that tells you whether an animation is in progress:

```js
import {Animate} from 'react-rebound';

<Animate scaleX={this.state.expanded ? 3 : 1} scaleY={this.state.expanded ? 3 : 1}>
  {animating => <img style={{zIndex: this.state.expanded || animating ? 1 : 0}} />}
</Animate>
```

## Supported attributes

See [stylistic](https://github.com/steadicat/stylistic) for the list of supported attributes, though for performance you should try to stick to the transforms and opacity only.

