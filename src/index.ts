import { Animated as RawAnimated } from 'react-native';

type RawAnimatedValue = RawAnimated.Value | RawAnimated.AnimatedInterpolation;

const invertInterpolation: RawAnimated.InterpolationConfigType = {
  inputRange: [0, 1],
  outputRange: [1, 0],
};

export type AnimatedValueInput =
  | number
  | boolean
  | RawAnimatedValue
  | AnimatedManager;

export function getRawAnimatedFromInput(
  input: AnimatedValueInput,
): RawAnimatedValue {
  if (typeof input === 'number') {
    return new RawAnimated.Value(input);
  }
  if (typeof input === 'boolean') {
    return new RawAnimated.Value(input ? 1 : 0);
  }
  if (input instanceof AnimatedManager) {
    return input.getValue();
  }
  if (!input) {
    return new RawAnimated.Value(0);
  }
  return input;
}

function getStepInterpolationConfig(
  step: number,
  startValue: number,
): RawAnimated.InterpolationConfigType {
  return {
    inputRange: [0, 1],
    outputRange: [startValue, startValue + step],
  };
}

function isInterpolated(
  animated: RawAnimatedValue,
): animated is RawAnimated.AnimatedInterpolation {
  if (animated instanceof RawAnimated.Value) {
    return false;
  }
  if (animated.interpolate) {
    return true;
  }
  return false;
}

export class AnimatedManager {
  public readonly value: RawAnimatedValue;

  constructor(initialValue: AnimatedValueInput) {
    this.value = getRawAnimatedFromInput(initialValue);
  }

  public getScrollListener(
    axis: 'x' | 'y',
    config?: RawAnimated.EventConfig<any>,
  ) {
    return RawAnimated.event(
      [
        {
          nativeEvent: {
            contentOffset: { [axis]: this.getValue() as RawAnimated.Value },
          },
        },
      ],
      config,
    );
  }

  public getValue() {
    return this.value;
  }

  public invert() {
    return this.interpolate(invertInterpolation);
  }

  public multiply(...inputs: AnimatedValueInput[]) {
    return this.iterate(inputs, (a, b) => RawAnimated.multiply(a, b));
  }

  public subtract(...inputs: AnimatedValueInput[]) {
    return this.iterate(inputs, (a, b) => {
      const minusB = RawAnimated.multiply(b, new RawAnimated.Value(-1));
      return RawAnimated.add(a, minusB);
    });
  }

  public add(...inputs: AnimatedValueInput[]) {
    return this.iterate(inputs, (a, b) => RawAnimated.add(a, b));
  }

  public divide(...inputs: AnimatedValueInput[]) {
    return this.iterate(inputs, (a, b) => RawAnimated.divide(a, b));
  }

  public async spring(config: RawAnimated.SpringAnimationConfig) {
    const value = this.value;
    if (isInterpolated(value)) {
      throw new Error(`Interpolated value cannot be animated`);
    }
    await new Promise((resolve) => {
      RawAnimated.spring(value, config).start(resolve);
    });
    return this;
  }

  public async timing(config: RawAnimated.TimingAnimationConfig) {
    const value = this.value;
    if (isInterpolated(value)) {
      throw new Error(`Interpolated value cannot be animated`);
    }
    await new Promise((resolve) => {
      RawAnimated.timing(value, config).start(resolve);
    });
    return this;
  }

  public iterate(
    inputs: AnimatedValueInput[],
    iterator: (
      a: AnimatedValueInput,
      b: AnimatedValueInput,
    ) => RawAnimatedValue,
  ) {
    let resultRaw = this.value;
    for (const input of inputs) {
      const animatedInput = getRawAnimatedFromInput(input);

      resultRaw = iterator(resultRaw, animatedInput);
    }
    return new AnimatedManager(resultRaw);
  }

  public interpolate(interpolation: RawAnimated.InterpolationConfigType) {
    return new AnimatedManager(this.value.interpolate(interpolation));
  }

  public interpolateByStep(step: number, fromValue = 0) {
    const interpolationConfig = getStepInterpolationConfig(step, fromValue);
    return this.interpolate(interpolationConfig);
  }
}
