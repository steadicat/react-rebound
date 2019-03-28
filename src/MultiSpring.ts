import {Listener, Spring, SpringSystem, SpringConfig} from 'rebound';

type Mapped<Tuple extends any[], Type> = {[K in keyof Tuple]: Type};

type SpringsForNumbers<Numbers extends number[]> = Mapped<Numbers, Spring | undefined>;

export default class MultiSpring<Numbers extends number[]> {
  private system: SpringSystem;
  private config: SpringConfig;
  private springs: SpringsForNumbers<Numbers> = ([] as Spring[]) as SpringsForNumbers<Numbers>;

  public constructor(system: SpringSystem, config: SpringConfig) {
    this.system = system;
    this.config = config;
  }

  public destroy() {
    for (const spring of this.springs) spring!.destroy();
  }

  public getCurrentValue() {
    return this.springs.map(s => s!.getCurrentValue()) as Numbers;
  }

  public setCurrentValue(value: Numbers, skipSetAtRest?: boolean) {
    for (let i = 0; i < value.length; i++) {
      if (!this.springs[i]) this.springs[i] = this.system.createSpring();
      this.springs[i]!.setCurrentValue(value[i], skipSetAtRest);
    }
  }

  public getEndValue() {
    return this.springs.map(s => s!.getEndValue());
  }

  public setEndValue(value: Numbers) {
    for (let i = 0; i < value.length; i++) {
      if (!this.springs[i]) this.springs[i] = this.system.createSpringWithConfig(this.config);
      this.springs[i]!.setEndValue(value[i]);
    }
  }

  public getVelocity() {
    return this.springs.map(s => s!.getVelocity());
  }

  public setAtRest() {
    for (const spring of this.springs) spring!.setAtRest();
  }

  public setVelocity(value: number) {
    for (const spring of this.springs) spring!.setVelocity(value);
  }
  public setRestSpeedThreshold(value: number) {
    for (const spring of this.springs) spring!.setRestSpeedThreshold(value);
  }

  public setRestDisplacementThreshold(value: number) {
    for (const spring of this.springs) spring!.setRestDisplacementThreshold(value);
  }

  public setOvershootClampingEnabled(value: boolean) {
    for (const spring of this.springs) spring!.setOvershootClampingEnabled(value);
  }

  public addListener(value: Listener) {
    for (const spring of this.springs) spring!.addListener(value);
  }
  public removeListener(value: Listener) {
    for (const spring of this.springs) spring!.removeListener(value);
  }
  public removeAllListeners() {
    for (const spring of this.springs) spring!.removeAllListeners();
  }
}
