import raf from 'raf';
import React from 'react';
import ReactDOM from 'react-dom';
import rebound from 'rebound';
import {extract} from 'stylistic';
/* global setTimeout */

const springSystem = new rebound.SpringSystem();

function isNumeric(n) {
  if (Array.isArray(n)) return n.every(x => typeof x === 'number');
  return typeof n === 'number';
}

export class Animate extends React.Component {
  static displayName = 'Animate';

  constructor() {
    super();
    this.springs = {};
    this.animating = false;
  }

  defaultProps = {
    animate: true,
  };

  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    this.triggerAnimations(this.getChild().props, this.props);
  }

  componentWillUpdate(nextProps) {
    // Check if this render will start an animation
    if (!this.animating && this.getChangedProps(this.props, nextProps).length > 0) {
      this.onAnimationStart();
    }
  }

  componentDidUpdate(lastProps) {
    this.triggerAnimations(lastProps, this.props);
  }

  componentWillUnmount() {
    this.animating = false;
    for (let prop in this.springs) {
      this.springs[prop].setAtRest();
    }
  }

  triggerAnimations(lastProps, nextProps) {
    this.getChangedProps(lastProps, nextProps).map(([prop, start, end]) => {
      const {tension, friction, delay, animate} = nextProps;
      this.springs[prop] || this.createSpring(prop, start, tension, friction);

      if (animate) {
        this.setEndValue(prop, end, delay);
      } else {
        this.springs[prop].setCurrentValue(end).setAtRest();
      }
    });
  }

  isNotSpecialProp(prop) {
    return ['tension', 'friction', 'delay', 'onStart', 'onEnd'].indexOf(prop) < 0;
  }

  getChangedProps(lastProps, nextProps) {
    return Object.keys(nextProps)
      .filter(this.isNotSpecialProp)
      .filter(prop =>
        nextProps[prop] !== lastProps[prop] && isNumeric(nextProps[prop]) && isNumeric(lastProps[prop]))
      .map(prop =>
        [prop, lastProps[prop], nextProps[prop]]);
  }

  createSpring(key, startValue, tension = 40, friction = 7) {
    if (Array.isArray(startValue)) {
      return startValue.forEach((value, i) => {
        this.createSpring(`${key}/${i}`, value, tension, friction);
      });
    }
    this.springs[key] = springSystem.createSpring(tension, friction);
    this.springs[key].setCurrentValue(startValue);
    this.springs[key].addListener({
      onSpringActivate: this.onAnimationStart,
      onSpringAtRest: this.onAnimationEnd,
      onSpringUpdate: this.requestUpdate,
    });
  }

  setEndValue(key, endValue, delay) {
    if (delay) {
      setTimeout(() => this.setEndValue(key, endValue), delay);
      return;
    }

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
    this.props.onStart && this.props.onStart();
  };

  onAnimationEnd = () => {
    if (!this.animating) return;
    this.animating = false;
    if (typeof this.props.children === 'function') {
      this.setState({}); // Trigger a re-render
    }
    this.props.onEnd && this.props.onEnd();
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

  getChild() {
    let child = this.props.children;
    if (typeof child === 'function') {
      child = child(this.animating);
    }
    return React.Children.only(child);
  }

  render() {
    return this.getChild();
  }
}
