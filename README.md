# vue-ts-async

> Library for extremely type-safe Typescript Vue asynchronous `data` and `computed` properties.

This library has two functions/decorators that allow you create extremely type-safe `data` and `computed` properties on Vue components using asynchronous functions.

Has convenient features for:

- loading, pending, and error flags
- ability to refresh data
- [debouncing](https://css-tricks.com/debouncing-throttling-explained-examples/), with `cancel` and `now` functions
- defaults
- error handling


## Install and Setup

```bash
# peer dependency
npm install --save vue vue-property-decorator

npm install --save vue-ts-async
```

Here's a simple example.

```ts
// src/vue-async.ts
import VueAsync from 'vue-ts-async'

// this object holds your default settings,
// and you'll use it in other components
// to create `data` and `computed` properties
const async = VueAsync({
  // your optional default error handler for async functions
  // (will be undefined by default, no function will be called)
  error: e => { console.error(e) },
  // default debounce length in milliseconds
  // (this is the default)
  debounce: 1000,
})
export default async
```

Then in the component itself:

```ts
// <script lang="ts">
import async from './vue-async'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop() readonly oneNumber!: number
  @Prop() readonly twoNumber!: number

  // this will be called only once, when the component is created
  oneNumberAddFive = async.data(this, {
    async get() {
      // let's pretend this is doing something useful
      return await Promise.resolve(this.oneNumber + 5)
    },
    default: 0,
  })

  // async.computed properties unfortunately need this decorator
  @async.Computed
  addFivePlusTwoNumber = async.computed(this, {
    // a list of properties to watch
    // `watch` uses debouncing
    watch: ['twoNumber'],
    // a function that returns an object to watch
    // `watchClosely` doesn't use debouncing
    watchClosely() {
      return { oneNumberAddFivePromise: this.oneNumberAddFive.promise }
    },
    // `watch` and `watchClosely` must not intersect (have any keys in common)
    async get({ oneNumberAddFivePromise, twoNumber }) {
      // see how we can use the promise from another async property
      // and await it directly?
      return (await oneNumberAddFivePromise) + twoNumber
    },
  })

  // normal computed properties can just use the `values` from async properties
  get promiseNumbersNotZero() {
    const oneNotZero = this.oneNumberAddFive.value !== 0
    // since `addFivePlusTwoNumber` doesn't have a default,
    // its value could be null
    const twoNotZero = (this.addFivePlusTwoNumber.value || 0) !== 0
    return oneNotZero && twoNotZero
  }

  get somethingIsLoading() {
    // `loading` on the properties let's you know if any promises are unresolved
    return this.oneNumberAddFive.loading || this.addFivePlusTwoNumber.loading
  }

  get addFivePlusTwoNumberIsDebounced() {
    // `queued` on debounced `async.computed` properties
    // tells you if a call is currently debounced
    return this.addFivePlusTwoNumber.queued
  }

  get somethingIsErrored() {
    // `error` is the most recent error
    // or null if the most recent was successful
    return !!this.oneNumberAddFive.error || !!this.addFivePlusTwoNumber.error
  }
}
```

## Very type-safe

This library uses advanced conditional types and function overloading to change the types of `async.data` and `async.computed` properties. If something could be null, you'll be informed.


## API

### `type ErrorHandler = (e: Error) => void`

A type alias for error handler functions.

### `function VueAsync({ debounce?: number = 1000, error?: ErrorHandler }) => VueTsAsync`

The top level function that returns an instance used to create all other `data` and `computed` properties.

### `class VueTsAsync`

The class that is returned by the `VueAsync` function. Has a `data` function to create data properties, `computed` function to create computed properties, and a `Computed` decorator that must be used on computed properties to make them reactive.

#### `function data(vm: V extends Vue, options: AsyncDataOptions<T>) => AsyncData<T>`

The full options object has this shape:

```ts
interface AsyncDataOptions<T> = {
  // the asynchronous function
  // that is called just once on component creation
  get: (this: V) => Promise<T>,

  // a function that will be called
  // if the promise is rejected
  error?: ErrorHandler,

  // a default value, used before the promise fulfills
  // or if it is rejected
  default?: T,

  // this switch tells the `AsyncData`
  // to wait until `refresh` is manually called
  lazy?: true,
}
```

#### `function data(vm: V extends Vue, (this: V) => Promise<T>) => AsyncData<T>`

The `data` function has a simple overload that allows you to only pass a function. It is equivalent to passing an options object with only the `get` value.


#### `class AsyncData<T>`

This is (basically) what is returned from the `data` function, and is the object the rest of your component will interact with.

The types of the properties of `AsyncData` depend on what values you give for `default` and `lazy`.

```ts
interface AsyncData<T> = {
  // the raw promise returned by your asynchronous function
  // can be useful if you'd prefer to have other computed properties
  // use `await` to depend on this
  // if you set `lazy` to `true`, then this could be null
  // and if you don't give a default, the internal value could be null
  promise: Promise<T | null> | null,

  // the promise's resolved value
  // if you don't provide a `default`, this could be null
  value: T | null,

  // whether the promise is currently unresolved
  loading: boolean,

  // the most recently thrown error,
  // or null if the most recent call was successful
  error: Error | null,

  // calls the `get` function again,
  // and updates all the values
  // this is useful since `AsyncData` aren't reactive
  refresh: () => void,
}
```

#### `function computed(vm: V extends Vue, options: AsyncComputedOptions<T>) => AsyncComputed<T>`

The `computed` function reactively updates when its dependencies change, and it must be decorated with `Computed`. It can be debounced so that many quick reactive triggers don't cause a flood of asynchronous function calls, which can be very expensive.

You have to provide a `get` function that returns a promise, and either a `watch` or `watchClosely` parameter which are either [arrays of strings referring to properties on the vue instance, or a function that returns an object you want tracked](https://vuejs.org/v2/api/#vm-watch).

You might be asking "Why are `watch` and `watchClosely` necessary? Why not just pass a function that's reactively watched?" Well, in order for Vue to reactively track a function, it has to invoke that function when you create the watcher. Since we have a function that performs an expensive async operation, which we also want to debounce, we can't really do that.

```ts
interface AsyncComputedOptions<T> = {
  // the asynchronous function,
  // that will be called without debouncing when `watchClosely` is triggered
  // and with debouncing when `watch` is triggered
  // this function receives the merged outputs of `watch` and `watchClosely`
  get: (watchedAttributes: OutputOfWatchAndWatchClosely) => Promise<T>,

  // a function that will be called
  // if the promise is rejected
  error?: ErrorHandler,

  // whether the watchers should be deep or not
  // passed to [Vue.$watch](https://vuejs.org/v2/api/#vm-watch)
  deep?: boolean,

  // `watch` and `watchClosely`
  // can either be a list of the component's property names
  // or a function that returns something
  // these are both used to make `AsyncComputed` reactive
  // `watch` is reactive but with a debounce
  watch?: (keyof V)[] | (this: V) => any,
  // `watchClosely` is reactive but has *no* debounce
  watchClosely?: (keyof V)[] | (this: V) => any,

  // a switch that determines if this computed will be run immediately
  // or wait for the first trigger of its watchers
  eager?: true,

  // a default value, used before the promise fulfills
  // or if it is rejected
  default?: T,

  // an override debounce length,
  // which defaults to the value given to `VueAsync`
  // if you don't want to debounce, only use `watchClosely`
  debounce?: number,
}
```

#### `class AsyncComputed<T>`

This is (basically) what is returned from the `computed` function, and is the object the rest of your component will interact with.

The types of the properties of `AsyncComputed` depend on what values you give for `default`, `eager`, `watch`, and `watchClosely`.

```ts
interface AsyncComputed<T> = {
  // same as `AsyncData`
  // if you *don't* set `eager`, then this could be null
  // and if you don't give a default, the internal value could be null
  promise: Promise<T | null> | null,

  // same as `AsyncData`
  value: T | null,

  // same as `AsyncData`
  loading: boolean,

  // same as `AsyncData`
  error: Error | null,

  // whether a call is currently debounced
  // if you only provide `watchClosely`,
  // then no debounce will ever be used on this `AsyncComputed`,
  // and it won't have this flag
  queued?: boolean,

  // cancels any currently debounced call,
  // preventing it from actually doing anything asynchronous
  cancel: () => void,

  // makes any currently debounced call happen immediately
  now: () => void,
}
```

#### `Computed: VueDecorator`

This decorator must be used on `async.computed` properties to make them reactive.


## Contributing

This package has testing set up with [mocha](https://mochajs.org/) and [chai expect](http://chaijs.com/api/bdd/). Since many of the tests are on the functionality of Vue components, the [vue testing docs](https://vuejs.org/v2/guide/unit-testing.html) are a good place to look for guidance.

If you'd like to contribute, perhaps because you uncovered a bug or would like to add features:

- fork the project
- clone it locally
- write tests to either to reveal the bug you've discovered or cover the features you're adding (write them in the `test` directory, and take a look at existing tests as well as the mocha, chai expect, and vue testing docs to understand how)
- run those tests with `npm test` (use `npm test -- -g "text matching test description"` to only run particular tests)
- once you're done with development and all tests are passing (including the old ones), submit a pull request!
