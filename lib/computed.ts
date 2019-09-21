import Vue from 'vue'
import _debounce from 'lodash.debounce'
import { createDecorator } from 'vue-class-component'

import { Data } from './data'
import { Overwrite, RequireDistinctIntersection, TupleUnion, ErrorHandler, pick, to_array } from './utils'

const ComputedDecorator = createDecorator((component_options, key) => {
	const existing_created = component_options.created
	component_options.created = function() {
		const computed = (this as any)[key] as AsyncComputedlike
		(computed as any).vm = this
		computed.initialize_watches()
		if (existing_created)
			existing_created()
	}
})


interface AsyncComputedlike {
	initialize_watches(): void
}




type Watcher<V> = (keyof V)[] | ((this: V) => any)

type WatcherOutput<V, W extends Watcher<V>> =
	[W] extends [(this: V) => infer T] ? T
	: [W] extends [(keyof V)[]] ? Pick<V, TupleUnion<W>>
	: never


type WatcherFunction<V, W extends Watcher<V>> =
	W extends []
		? (this: V) => never
		: (this: V) => WatcherOutput<V, W>


type AsyncFunc<I, T> =
	(watched_attributes: I) => Promise<T>

type AsyncFuncSingle<V extends Vue, T, W extends Watcher<V>> =
	AsyncFunc<WatcherOutput<V, W>, T>

type AsyncFuncDistinct<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> =
	AsyncFunc<RequireDistinctIntersection<WatcherOutput<V, WW>, WatcherOutput<V, WC>>, T>


type OptionsGet<I, T> = {
	get: AsyncFunc<I, T>,
	error?: ErrorHandler,
}

type OptionsGetSingle<V extends Vue, T, W extends Watcher<V>> =
	OptionsGet<WatcherOutput<V, W>, T>

type OptionsGetDistinct<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> =
	OptionsGet<RequireDistinctIntersection<WatcherOutput<V, WW>, WatcherOutput<V, WC>>, T>


type OptionsWatch<V extends Vue, WW extends Watcher<V>> = {
	watch: WW,
}
type OptionsWatchClosely<V extends Vue, WC extends Watcher<V>> = {
	watch_closely: WC,
}




// type AsyncFunc<V extends Vue, T, K extends keyof V> =
// 	(watched_attributes: Pick<V, K>) => Promise<T>

// type AsyncFuncSingle<V extends Vue, T, KC extends (keyof V)[]> =
// 	AsyncFunc<V, T, TupleUnion<KC>>

// type AsyncFuncDistinct<V extends Vue, T, KW extends (keyof V)[], KC extends (keyof V)[]> =
// 	AsyncFunc<V, T, RequireDistinct<TupleUnion<KW>, TupleUnion<KC>>>


// type OptionsGet<V extends Vue, T, K extends keyof V> = {
// 	get: AsyncFunc<V, T, K>,
// 	error?: ErrorHandler,
// }

// type OptionsGetSingle<V extends Vue, T, KC extends (keyof V)[]> =
// 	OptionsGet<V, T, TupleUnion<KC>>

// type OptionsGetDistinct<V extends Vue, T, KW extends (keyof V)[], KC extends (keyof V)[]> =
// 	OptionsGet<V, T, RequireDistinct<TupleUnion<KW>, TupleUnion<KC>>>

// type PickFunction<V extends Vue, K extends (keyof V)[]> = (this: V) => Pick<V, TupleUnion<K>>

// type OptionsWatch<V extends Vue, KW extends (keyof V)[]> = {
// 	watch: KW | PickFunction<V, KW>,
// }
// type OptionsWatchClosely<V extends Vue, KC extends (keyof V)[]> = {
// 	watch_closely: KC | PickFunction<V, KC>,
// }


type OptionsEager = {
	eager: true,
}
type OptionsDefault<T> = {
	default: T,
}
type OptionsDebounce = {
	debounce: number
}


export class Computed extends Data {
	constructor(
		readonly debounce: number,
		readonly error_handler: ErrorHandler | undefined,
	) {
		super(error_handler)
	}

	Computed = ComputedDecorator

	// (eager: true, defaulted: true, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetDistinct<V, T, WW, WC>
			& OptionsWatch<V, WW> & OptionsWatchClosely<V, WC>
			& Partial<OptionsDebounce>
			& OptionsEager
			& OptionsDefault<T>,
	): AsyncComputed<V, T, WW, WC>
	// (eager: true, defaulted: true, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WW>
			& OptionsWatch<V, WW>
			& Partial<OptionsDebounce>
			& OptionsEager
			& OptionsDefault<T>,
	): AsyncComputed<V, T, WW, []>


	// (eager: true, defaulted: false, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetDistinct<V, T, WW, WC>
			& OptionsWatch<V, WW> & OptionsWatchClosely<V, WC>
			& Partial<OptionsDebounce>
			& OptionsEager,
	): AsyncComputedNoDefault<V, T, WW, WC>
	// (eager: true, defaulted: false, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WW>
			& OptionsWatch<V, WW>
			& Partial<OptionsDebounce>
			& OptionsEager,
	): AsyncComputedNoDefault<V, T, WW, []>


	// (eager: false, defaulted: true, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetDistinct<V, T, WW, WC>
			& OptionsWatch<V, WW> & OptionsWatchClosely<V, WC>
			& Partial<OptionsDebounce>
			& OptionsDefault<T>,
	): AsyncComputedNotEager<V, T, WW, WC>
	// (eager: false, defaulted: true, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WW>
			& OptionsWatch<V, WW>
			& Partial<OptionsDebounce>
			& OptionsDefault<T>,
	): AsyncComputedNotEager<V, T, WW, []>


	// (eager: false, defaulted: false, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetDistinct<V, T, WW, WC>
			& OptionsWatch<V, WW> & OptionsWatchClosely<V, WC>
			& Partial<OptionsDebounce>,
	): AsyncComputedNotEagerNoDefault<V, T, WW, WC>
	// (eager: false, defaulted: false, debounced: true)
	computed<V extends Vue, T, WW extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WW>
			& OptionsWatch<V, WW>
			& Partial<OptionsDebounce>,
	): AsyncComputedNotEagerNoDefault<V, T, WW, []>


	// (eager: true, defaulted: true, debounced: false)
	computed<V extends Vue, T, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WC>
			& OptionsWatchClosely<V, WC>
			& OptionsEager
			& OptionsDefault<T>,
	): AsyncComputedNoDebounce<V, T, WC>

	// (eager: true, defaulted: false, debounced: false)
	computed<V extends Vue, T, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WC>
			& OptionsWatchClosely<V, WC>
			& OptionsEager,
	): AsyncComputedNoDefaultNoDebounce<V, T, WC>

	// (eager: false, defaulted: true, debounced: false)
	computed<V extends Vue, T, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WC>
			& OptionsWatchClosely<V, WC>
			& OptionsDefault<T>,
	): AsyncComputedNotEagerNoDebounce<V, T, WC>

	// (eager: false, defaulted: false, debounced: false)
	computed<V extends Vue, T, WC extends Watcher<V>>(
		vm: V,
		options: OptionsGetSingle<V, T, WC>
			& OptionsWatchClosely<V, WC>,
	): AsyncComputedNotEagerNoDefaultNoDebounce<V, T, WC>

	computed<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>>(
		vm: V,
		options: any,
	): any {
		const { error_handler: error_handler_default, debounce: debounce_default } = this

		const {
			get: fn,
			error: error_handler = error_handler_default,
			watch: watch_opt = undefined,
			watch_closely: watch_closely_opt = undefined,
			eager = false,
			default: def = undefined,
			debounce: debounce_opt = debounce_default,
		} = options

		const debounce = watch_opt === undefined
			? undefined
			: debounce_opt

		// actually means it's an array
		const watch = typeof watch_opt === 'object'
			? function(this: V) { return pick(this, watch_opt) }
			: watch_opt

		const watch_closely = typeof watch_closely_opt === 'object'
			? function(this: V) { return pick(this, watch_closely_opt) }
			: watch_closely_opt

		// (eager: true, defaulted: true, debounced: true)
		if (eager && def !== undefined && debounce !== undefined)
			return new AsyncComputed(vm, error_handler, watch, watch_closely, fn, debounce, def)

		// (eager: true, defaulted: false, debounced: true)
		else if (eager && def === undefined && debounce !== undefined)
			return new AsyncComputedNoDefault(vm, error_handler, watch, watch_closely, fn, debounce, def)

		// (eager: false, defaulted: true, debounced: true)
		else if (!eager && def !== undefined && debounce !== undefined)
			return new AsyncComputedNotEager(vm, error_handler, watch, watch_closely, fn, debounce, def)

		// (eager: false, defaulted: false, debounced: true)
		else if (!eager && def === undefined && debounce !== undefined)
			return new AsyncComputedNotEagerNoDefault(vm, error_handler, watch, watch_closely, fn, debounce, def)

		// (eager: true, defaulted: true, debounced: false)
		else if (eager && def !== undefined && debounce === undefined)
			return new AsyncComputedNoDebounce(vm, error_handler, watch_closely, fn, def)

		// (eager: true, defaulted: false, debounced: false)
		else if (eager && def === undefined && debounce === undefined)
			return new AsyncComputedNoDefaultNoDebounce(vm, error_handler, watch_closely, fn, def)

		// (eager: false, defaulted: true, debounced: false)
		else if (!eager && def !== undefined && debounce === undefined)
			return new AsyncComputedNotEagerNoDebounce(vm, error_handler, watch_closely, fn, def)

		// (eager: false, defaulted: false, debounced: false)
		else if (!eager && def === undefined && debounce === undefined)
			return new AsyncComputedNotEagerNoDefaultNoDebounce(vm, error_handler, watch_closely, fn, def)

		throw new Error(
			"Somehow the options to async.computed were invalid, and didn't match any actual cases:"
			+ `\n  get: ${fn}`
			+ `\n  watch: ${watch_opt}`
			+ `\n  watch_closely: ${watch_closely}`
			+ `\n  eager: ${eager}`
			+ `\n  default: ${def}`
			+ `\n  debounce: ${debounce_opt}`
		)
	}
}




// this is the root non-debounced
// (eager: false, defaulted: false, debounced: false)
class AsyncComputedNotEagerNoDefaultNoDebounce<V extends Vue, T, WC extends Watcher<V>> implements AsyncComputedlike {
	protected _promise: Promise<T | null> | null = null
	protected _value: T | null = null
	get promise() { return this._promise }
	get value() { return this._value }

	protected _loading: boolean = false
	protected _error: Error | null = null
	get loading() { return this._loading }
	get error() { return this._error }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly default_value: T | null = null
	) {}

	initialize_watches() {
		const { vm, watch_closely } = this

		if (watch_closely !== undefined)
			vm.$watch(
				watch_closely,
				() => { this.immediate_handler() },
				{ deep: true, immediate: false },
			)

		// if (watch_closely.length > 0)
		// 	vm.$watch(
		// 		function() { return pick(this, watch_closely) },
		// 		() => { this.immediate_handler() },
		// 		{ deep: true, immediate: false },
		// 	)
	}

	protected immediate_handler() {
		const { vm, error_handler, watch_closely, default_value } = this
		this._loading = true

		return this._promise = this.fn({
			...((watch_closely && watch_closely.call(vm)) || {})
		})
			.then(v => {
				this._error = null
				return this._value = v
			})
			.catch(e => {
				if (error_handler) error_handler(e)
				this._error = e
				return this._value = default_value
			})
			.finally(() => {
				this._loading = false
			})
	}
}

// (eager: false, defaulted: true, debounced: false)
class AsyncComputedNotEagerNoDebounce<V extends Vue, T, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefaultNoDebounce<V, T, WC> {
	protected _promise: Promise<T> | null = null
	protected _value: T
	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly default_value: T,
	) {
		super(vm, error_handler, watch_closely, fn, default_value)
		this._value = default_value
	}
}

// (eager: true, defaulted: false, debounced: false)
class AsyncComputedNoDefaultNoDebounce<V extends Vue, T, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefaultNoDebounce<V, T, WC> {
	protected _promise!: Promise<T | null>
	protected _value: T | null = null
	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly default_value: T | null = null,
	) {
		super(vm, error_handler, watch_closely, fn, default_value)
		// calling immediate_handler is the simplest way to be eager
		this.immediate_handler()
	}
}

// (eager: true, defaulted: true, debounced: false)
class AsyncComputedNoDebounce<V extends Vue, T, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefaultNoDebounce<V, T, WC> {
	protected _promise!: Promise<T>
	protected _value: T
	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly default_value: T,
	) {
		super(vm, error_handler, watch_closely, fn, default_value)
		this.immediate_handler()
		this._value = default_value
	}
}



// this is the root debounced
// (eager: false, defaulted: false, debounced: true)
class AsyncComputedNotEagerNoDefault<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> implements AsyncComputedlike {
	protected _promise: Promise<T | null> | null = null
	protected _value: T | null = null
	get promise() { return this._promise }
	get value() { return this._value }

	protected _loading: boolean = false
	protected _error: Error | null = null
	get loading() { return this._loading }
	get error() { return this._error }

	protected _queued = false
	get queued() { return this._queued }

	protected debounced_fn: ReturnType<typeof _debounce>

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly default_value: T | null = null,
	) {
		this.debounced_fn = _debounce(() => { this.immediate_handler() }, debounce)
	}

	initialize_watches() {
		const { vm, watch, watch_closely } = this
		if (watch_closely !== undefined) {
			vm.$watch(
				watch_closely,
				() => { this.immediate_handler() },
				{ deep: true, immediate: false },
			)
		}

		if (watch !== undefined) {
			vm.$watch(
				watch,
				() => {
					this._queued = true
					this.debounced_fn()
				},
				{ deep: true, immediate: false }
			)
		}
	}

	protected immediate_handler() {
		const { vm, error_handler, watch, watch_closely, default_value } = this
		this._cancel()
		this._loading = true

		return this._promise = this.fn({
			...((watch_closely && watch_closely.call(vm)) || {}),
			...((watch && watch.call(vm)) || {}),
		})
			.then(v => {
				this._error = null
				return this._value = v
			})
			.catch(e => {
				if (error_handler) error_handler(e)
				this._error = e
				return this._value = default_value
			})
			.finally(() => {
				this._loading = false
			})
	}

	protected _cancel() {
		this._queued = false
		this.debounced_fn.cancel()
	}
	get cancel() { return this._cancel.bind(this) }

	protected _now() {
		this.debounced_fn.flush()
	}
	get now() { return this._now.bind(this) }
}

// (eager: false, defaulted: true, debounced: true)
class AsyncComputedNotEager<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefault<V, T, WW, WC> {
	protected _promise: Promise<T> | null = null
	protected _value: T
	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly default_value: T,
	) {
		super(vm, error_handler, watch, watch_closely, fn, debounce, default_value)
		this._value = default_value
	}
}

// (eager: true, defaulted: false, debounced: true)
class AsyncComputedNoDefault<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefault<V, T, WW, WC> {
	protected _promise!: Promise<T | null>
	protected _value: T | null = null
	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly default_value: T | null = null,
	) {
		super(vm, error_handler, watch, watch_closely, fn, debounce, default_value)
		this.immediate_handler()
	}
}

// (eager: true, defaulted: true, debounced: true)
class AsyncComputed<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefault<V, T, WW, WC> {
	protected _promise!: Promise<T>
	protected _value: T

	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watch_closely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly default_value: T,
	) {
		super(vm, error_handler, watch, watch_closely, fn, debounce, default_value)
		this._value = default_value
		this.immediate_handler()
	}
}
