import React from 'react';
import ReactDOM from 'react-dom';
import {Animate, AnimateAPI} from './src/index';

function toggle(Inner) {
  return props => {
    const [toggled, setToggled] = React.useState(false);
    const onClick = React.useCallback(() => setToggled(t => !t), []);
    return <Inner {...props} toggled={toggled} onClick={onClick} />;
  };
}

const ScaleDemo = toggle(({toggled, ...props}) => (
  <section>
    <h2>Scale</h2>
    <Animate scaleX={toggled ? 1.4 : 1} scaleY={toggled ? 1.4 : 1}>
      <button className="c1" {...props}>
        Click Me
      </button>
    </Animate>
  </section>
));

const TranslateDemo = toggle(({toggled, ...props}) => (
  <section>
    <h2>Translate</h2>
    <Animate translateX={toggled ? 200 : 0}>
      <button className="c2" {...props}>
        Click Me
      </button>
    </Animate>
  </section>
));

const FrictionDemo = toggle(({toggled, ...props}) => (
  <section>
    <h2>Translate with high friction</h2>
    <Animate translateX={toggled ? 200 : 0} friction={80}>
      <button className="c3" {...props}>
        Click Me
      </button>
    </Animate>
  </section>
));

const TensionDemo = toggle(({toggled, ...props}) => (
  <section>
    <h2>Translate with high tension</h2>
    <Animate translateX={toggled ? 200 : 0} tension={500}>
      <button className="c4" {...props}>
        Click Me
      </button>
    </Animate>
  </section>
));

const FrictionAndTensionDemo = toggle(({toggled, ...props}) => (
  <section>
    <h2>Translate with high friction and tension</h2>
    <Animate translateX={toggled ? 200 : 0} friction={80} tension={500}>
      <button className="c5" {...props}>
        Click Me
      </button>
    </Animate>
  </section>
));

const CascadeWithDelayDemo = toggle(({toggled, ...props}) => (
  <section {...props}>
    <h2>Cascade with delay</h2>
    {[1, 2, 3, 4, 5, 6, 7].map(index => (
      <Animate key={index} translateX={toggled ? 200 : 0} delay={index * 20}>
        <button className={`c${index}`} style={{display: 'block', margin: '10px 0'}}>
          Click Me
        </button>
      </Animate>
    ))}
  </section>
));

const CascadeWithFrictionDemo = toggle(({toggled, ...props}) => (
  <section {...props}>
    <h2>Cascade with friction</h2>
    {[1, 2, 3, 4, 5, 6, 7].map(index => (
      <Animate key={index} translateX={toggled ? 200 : 0} friction={10 + index * 4}>
        <button className={`c${index}`} style={{display: 'block', margin: '10px 0'}}>
          Click Me
        </button>
      </Animate>
    ))}
  </section>
));

const CascadeWithTensionDemo = toggle(({toggled, ...props}) => (
  <section {...props}>
    <h2>Cascade with tension</h2>
    {[1, 2, 3, 4, 5, 6, 7].map(index => (
      <Animate key={index} translateX={toggled ? 200 : 0} tension={100 + (10 - index) * 20}>
        <button className={`c${index}`} style={{display: 'block', margin: '10px 0'}}>
          Click Me
        </button>
      </Animate>
    ))}
  </section>
));

const ColorDemo = toggle(({toggled, ...props}) => (
  <section>
    <h2>Color</h2>
    <Animate background={toggled ? [200, 100, 0] : [100, 200, 100]}>
      <button {...props}>Click Me</button>
    </Animate>
  </section>
));

const DragDemo = () => {
  const animation = React.useRef<AnimateAPI>();
  const lastDrag = React.useRef(null);
  const velocity = React.useRef(null);
  const onDragStart = React.useCallback((event: React.MouseEvent) => {
    lastDrag.current = event.clientX;
  }, []);
  const onMouseMove = React.useCallback((event: React.MouseEvent) => {
    if (lastDrag.current === null) return;
    velocity.current = event.clientX - lastDrag.current;
    animation.current.setCurrentValue(
      'translateX',
      animation.current.getCurrentValue('translateX') + velocity.current,
    );
    lastDrag.current = event.clientX;
  }, []);
  const onDragEnd = React.useCallback(() => {
    if (lastDrag.current === null) return;
    lastDrag.current = null;
    animation.current.setVelocity('translateX', velocity.current * 100);
    velocity.current = 0;
  }, []);

  return (
    <section onMouseMove={onMouseMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      <h2>Drag with momentum</h2>
      <Animate ref={animation} translateX={0} tension={0}>
        <button
          className="c1"
          style={{display: 'block', margin: '10px 0'}}
          onMouseDown={onDragStart}>
          Drag Me
        </button>
      </Animate>
    </section>
  );
};

const Demo = () => (
  <div>
    <h1>react-rebound demos</h1>
    <p>
      See <a href="https://github.com/steadicat/react-rebound">react-rebound on GitHub</a> for code
      and instructions.
    </p>
    <ScaleDemo />
    <TranslateDemo />
    <FrictionDemo />
    <TensionDemo />
    <FrictionAndTensionDemo />
    <DragDemo />
    <ColorDemo />
    <CascadeWithDelayDemo />
    <CascadeWithFrictionDemo />
    <CascadeWithTensionDemo />
  </div>
);

ReactDOM.render(<Demo />, document.getElementById('wrapper'));
