# react-native-animated-mananger

Simple class wrapping native Animated Value that helps to perform various operations on them

`yarn add react-native-animated-mananger`

## Create value

```ts
new AnimatedManager(0);
new AnimatedManager(true); // will convert true > 1, false > 0
new AnimatedManager(new Animated.Value(1));
```

## Get raw animated value (to pass it to styles)

```ts
const value = new AnimatedManager(0);
const rawAnimatedValue = value.getValue();
```

## Compose values

```ts
const valueA = new AnimatedManager(1);
const valueB = new AnimatedManager(2);
const valueC = new AnimatedManager(4);
const valueA = valueA.add(valueB, valueC);
```

## Call animations as promises

```ts
const value = new AnimatedManager(1);

async function increase() {
  await value.spring({ toValue: 2 }); // no need to call .start()
  console.log('animation finished');
}
```

## API

```ts
// allowed input for AnimatedManager class and methods
type AnimatedValueInput = number | boolean | Animated.Value | AnimatedManager;


// return raw react natvie Animated.Value
value.getValue(): RawAnimatedValue;
// inverts value that is in 0-1 range.
// example: const animatedOpacity = isHidden.invert()
value.invert(): AnimatedManager;

// basic mathematical operators - under the hood it just use raw Animated.add etc but in chainable way
// also every valid AnimatedManager input can be used eg. someValue.add(new Animated.Value(2), 50, true)
value.multiply(...inputs: AnimatedValueInput[]): AnimatedManager;
value.subtract(...inputs: AnimatedValueInput[]): AnimatedManager;
value.add(...inputs: AnimatedValueInput[]): AnimatedManager;
value.divide(...inputs: AnimatedValueInput[]): AnimatedManager;

// Works the same as raw Animated.spring etc, but doesnt need .start() to be called and returns promise that is resolved when animation is finished
value.spring(config: RawAnimated.SpringAnimationConfig): Promise<this>;
value.timing(config: RawAnimated.TimingAnimationConfig): Promise<this>;

// works exactly as native interpolation function
value.interpolate(interpolation: RawAnimated.InterpolationConfigType): AnimatedManager;
```

## Tips and Gotchas

Always remember to call `.getValue()` before passing it to animated view. Animated view will only accept raw `Animated.Value` instance that is returned by `.getValue()`

## Helpers

Connecting it to events. Pass `.getValue()` result to `Animated.Event`

Also there is helper method for scroll based events:

```tsx
<ScrollView onScroll={animatedManagerInstance.getScrollListener('y')} />
```
