import {SpringSystem, Spring, Listener} from 'rebound';

export default class MultiSpring {
  private system: SpringSystem;
  private springs: Spring[] = [];
  public constructor(system: SpringSystem) {
    this.system = system;
  }

  public destroy() {
    for (const spring of this.springs) spring.destroy();
  }

  public getCurrentValue() {
    return this.springs.map(s => s.getCurrentValue());
  }

  public setCurrentValue(value: number[], skipSetAtRest?: boolean) {
    for (let i = 0; i < value.length; i++) {
      if (!this.springs[i]) this.springs[i] = this.system.createSpring();
      this.springs[i].setCurrentValue(value[i], skipSetAtRest);
    }
  }

  public getEndValue() {
    return this.springs.map(s => s.getEndValue());
  }

  public setEndValue(value: number[]) {
    for (let i = 0; i < value.length; i++) {
      if (!this.springs[i]) this.springs[i] = this.system.createSpring();
      this.springs[i].setEndValue(value[i]);
    }
  }

  public getVelocity() {
    return this.springs.map(s => s.getVelocity());
  }

  public setAtRest() {
    for (const spring of this.springs) spring.setAtRest();
  }

  public setVelocity(value: number) {
    for (const spring of this.springs) spring.setVelocity(value);
  }

  public addListener(value: Listener) {
    for (const spring of this.springs) spring.addListener(value);
  }
  public removeListener(value: Listener) {
    for (const spring of this.springs) spring.removeListener(value);
  }
  public removeAllListeners() {
    for (const spring of this.springs) spring.removeAllListeners();
  }
}
