import raf from 'raf';
import React from 'react';
import ReactDOM from 'react-dom';
import rebound from 'rebound';
import {extract} from 'stylistic';

const springSystem = new rebound.SpringSystem();

function isNumeric(n) {
  if (Array.isArray(n)) return n.every((x) => typeof x === 'number');
  return typeof n === 'number';
}

export class Animate extends React.Component {
  static displayName = 'Animate';

  constructor() {
    super();
    this.springs = {};
    this.animating = false;
  }

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
  }

  componentWillUpdate(nextProps) {
    // Check if this render will start an animation
    if (!this.animating) {
      for (let key in this.props) {
        if (this.props[key] !== nextProps[key] && isNumeric(this.props[key]) && isNumeric(nextProps[key])) {
          this.onAnimationStart();
          break;
        }
      }
    }
  }

  componentDidUpdate(lastProps) {
    for (let key in this.props) {
      if (this.props[key] !== lastProps[key] && isNumeric(this.props[key]) && isNumeric(lastProps[key])) {
        this.springs[key] || this.createSpring(key, lastProps[key]);
        this.setEndValue(key, this.props[key]);
      }
    }
  componentWillUnmount() {
    Object.value(this.springs).forEach(spring => spring.setAtRest());
  }

  }

  createSpring(key, startValue) {
    if (Array.isArray(startValue)) {
      return startValue.forEach((value, i) => {
        this.createSpring(`${key}/${i}`, value);
      });
    }
    this.springs[key] = springSystem.createSpring();
    this.springs[key].setCurrentValue(startValue);
    this.springs[key].addListener({
      onSpringActivate: this.onAnimationStart,
      onSpringAtRest: this.onAnimationEnd,
      onSpringUpdate: this.requestUpdate,
    });
  }

  setEndValue(key, endValue) {
    if (Array.isArray(endValue)) {
      return endValue.forEach((value, i) => {
        this.setEndValue(`${key}/${i}`, value);
      });
    }
    this.springs[key].setEndValue(endValue);
  }

  onAnimationStart = () => {
    if (this.animating) return;
    this.animating = true;
    if (typeof this.props.children === 'function') {
      this.setState({}); // Trigger a re-render
    }
  };

  onAnimationEnd = () => {
    if (!this.animating) return;
    this.animating = false;
    if (typeof this.props.children === 'function') {
      this.setState({}); // Trigger a re-render
    }
  };

  requestUpdate = () => {
    if (!this.request) {
      this.request = raf(this.performUpdate);
    }
  };

  performUpdate = () => {
    this.request = null;
    const current = Object.keys(this.springs).reduce((obj, key) => {
      if (key.indexOf('/') > 0) {
        const [name, index] = key.split('/');
        obj[name] || (obj[name] = []);
        obj[name][parseInt(index, 10)] = this.springs[key].getCurrentValue();
      } else {
        obj[key] = this.springs[key].getCurrentValue();
      }
      return obj;
    }, {});

    const {style} = extract({...this.props, ...current});
    for (let key in style) {
      this.node.style[key] = style[key];
    }
  };

  render() {
    let child = this.props.children;
    if (typeof child === 'function') {
      child = child(this.animating);
    }
    return React.Children.only(child);
  }
}
