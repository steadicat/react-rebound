import raf from 'raf';
import React from 'react';
import rebound from 'rebound';
import {extract} from 'stylistic';

const springSystem = new rebound.SpringSystem();

function isNumeric(n) {
  if (Array.isArray(n)) return n.every((x) => typeof x === 'number');
  return typeof n === 'number';
}

export class Animate {
  static displayName = 'Animate';

  componentDidMount() {
    this.springs = {};
    this.node = React.findDOMNode(this.refs.child);
  }

  componentDidUpdate(lastProps) {
    for (let key in this.props) {
      if (this.props[key] !== lastProps[key] && isNumeric(this.props[key]) && isNumeric(lastProps[key])) {
        this.springs[key] || this.createSpring(key, lastProps[key]);
        this.setEndValue(key, this.props[key]);
      }
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

  requestUpdate = () => {
    if (!this.request) {
      this.request = raf(this.performUpdate);
    }
  }

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
    Object.keys(style).forEach((key) => {
      this.node.style[key] = style[key];
    });
  }

  render() {
    const {children, ...props} = this.props;
    const child = React.Children.only(children);
    return React.cloneElement(child, {ref: 'child'});
  }
}
