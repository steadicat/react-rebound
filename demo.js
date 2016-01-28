import React from 'react';
import ReactDOM from 'react-dom';
import {Animate} from './src/index';

function toggle(Inner) {
  return class Component extends React.Component {
    constructor() {
      super();
      this.state = {toggled: false};
    }

    toggle = () => {
      this.setState({toggled: !this.state.toggled});
    };

    render() {
      return <Inner {...this.props} toggled={this.state.toggled} onClick={this.toggle} />;
    }
  }
}

const ScaleDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Scale</h2>
    <Animate scaleX={toggled ? 1.4 : 1} scaleY={toggled ? 1.4 : 1}>
      <button className="c1" {...props}>Click Me</button>
    </Animate>
  </section>
);

const TranslateDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Translate</h2>
    <Animate translateX={toggled ? 200 : 0}>
      <button className="c2" {...props}>Click Me</button>
    </Animate>
  </section>
);

const FrictionDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Translate with high friction</h2>
    <Animate translateX={toggled ? 200 : 0} friction={400}>
      <button className="c3" {...props}>Click Me</button>
    </Animate>
  </section>
);

const TensionDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Translate with high tension</h2>
    <Animate translateX={toggled ? 200 : 0} tension={400}>
      <button className="c4" {...props}>Click Me</button>
    </Animate>
  </section>
);

const FrictionAndTensionDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Translate with high friction and tension</h2>
    <Animate translateX={toggled ? 200 : 0} friction={400} tension={400}>
      <button className="c5" {...props}>Click Me</button>
    </Animate>
  </section>
);

const CascadeWithDelayDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Cascade with delay</h2>
    {[ 1, 2, 3, 4, 5, 6, 7].map(index =>
      <Animate key={index} translateX={toggled ? 200 : 0} delay={index * 20}>
        <button className={`c${index}`} style={{display: 'block', margin: '10px 0'}} {...props}>Click Me</button>
      </Animate>
    )}
  </section>
);

const CascadeWithFrictionDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Cascade with friction</h2>
    {[ 1, 2, 3, 4, 5, 6, 7].map(index =>
      <Animate key={index} translateX={toggled ? 200 : 0} friction={10 + index * 1}>
        <button className={`c${index}`} style={{display: 'block', margin: '10px 0'}} {...props}>Click Me</button>
      </Animate>
    )}
  </section>
);

const CascadeWithTensionDemo = toggle(({toggled, ...props}) =>
  <section>
    <h2>Cascade with tension</h2>
    {[ 1, 2, 3, 4, 5, 6, 7].map(index =>
      <Animate key={index} translateX={toggled ? 200 : 0} tension={(10 - index) * 5}>
        <button className={`c${index}`} style={{display: 'block', margin: '10px 0'}} {...props}>Click Me</button>
      </Animate>
    )}
  </section>
);


const Demo = () =>
  <div>
    <h1>react-rebound demos</h1>
    <p>See <a href="https://github.com/steadicat/react-rebound">react-rebound on GitHub</a> for code and instructions.</p>
    <ScaleDemo />
    <TranslateDemo />
    <FrictionDemo />
    <TensionDemo />
    <FrictionAndTensionDemo />
    <CascadeWithDelayDemo />
    <CascadeWithFrictionDemo />
    <CascadeWithTensionDemo />
  </div>;

ReactDOM.render(<Demo />, document.body.appendChild(document.createElement('div')));
