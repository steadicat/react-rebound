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
  <a href="#" color="#000">Hover Me</a>
</Animate>
```

## Supported attributes

See [stylistic](https://github.com/steadicat/stylistic) for the list of supported attributes, though for performance you should try to stick to the transforms and opacity only.

