# vue-ts-async

```bash
# these peer dependencies and dev are required
npm install --save vue vue-class-component
npm install --save-dev typescript

npm install --save vue-ts-async
```

Here's a simple example.

```ts
// src/vue-async.ts
import VueAsync from 'vue-ts-async'

export default const async = VueAsync({
  // your optional default error handler for async functions
  // (will be undefined by default, no function will be called)
  error: e => { console.error(e) },
  // default length in milliseconds of debounce
  // (this is the default)
  debounce: 1000,
})

```


```vue
<!-- src/MyComponent.vue -->
<template lang="pug">

#MyComponent
  .asyncAddFive
    div {{ asyncAddFive.value }} /- `number`
    div {{ asyncAddFive.promise }} /- `Promise<number>`
    div {{ asyncAddFive.loading }} /- `boolean`, whether it's currently loading
    div {{ asyncAddFive.error }} /- `Error | null`, the most recently thrown error

</template>

<script lang="ts">
import async from './vue-async'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop() readonly input!: number

  // this will be called only once
  asyncAddFive = async.data(this, {
    async get() {
      // let's pretend this `delay` function exists
      return await delay(1000, this.input + 5)
    },
    default: 0,
  })

  // async computed properties unfortunately need this decorator
  @async.Computed
  computed = async.computed(this, {
    // a list of properties to watch with debouncing
    watch: ['num'],
    // a list of properties to watch with no debouncing
    watch_closely: ['']
    // `watch` and `watch_closely` must not share any keys
    async get({ num }) {
      return await delay(25, num + 1)
    },
    default: 0,
    eager: true,
  })
}

</script>
```
