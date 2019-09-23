import Vue from 'vue'
import _debounce from 'lodash.debounce'
import { createDecorator } from 'vue-class-component'

import { Data } from './data'
import { Overwrite, RequireDistinctIntersection, TupleUnion, ErrorHandler, pick, toArray } from './utils'

const ComputedDecorator = createDecorator((componentOptions, key) => {
	const existingCreated = componentOptions.created
	componentOptions.created = function() {
		const computed = (this as any)[key] as AsyncComputedlike
		(computed as any).vm = this
		computed.initializeWatches()
		if (existingCreated)
			existingCreated()
	}
})


interface AsyncComputedlike {
	initializeWatches(): void
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
	(watchedAttributes: I) => Promise<T>

type AsyncFuncSingle<V extends Vue, T, W extends Watcher<V>> =
	AsyncFunc<WatcherOutput<V, W>, T>

type AsyncFuncDistinct<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> =
	AsyncFunc<RequireDistinctIntersection<WatcherOutput<V, WW>, WatcherOutput<V, WC>>, T>


type OptionsGet<I, T> = {
	get: AsyncFunc<I, T>,
	error?: ErrorHandler,
	deep?: boolean,
}

type OptionsGetSingle<V extends Vue, T, W extends Watcher<V>> =
	OptionsGet<WatcherOutput<V, W>, T>

type OptionsGetDistinct<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> =
	OptionsGet<RequireDistinctIntersection<WatcherOutput<V, WW>, WatcherOutput<V, WC>>, T>


type OptionsWatch<V extends Vue, WW extends Watcher<V>> = {
	watch: WW,
}
type OptionsWatchClosely<V extends Vue, WC extends Watcher<V>> = {
	watchClosely: WC,
}


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
		readonly errorHandler: ErrorHandler | undefined,
	) {
		super(errorHandler)
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
		const { errorHandler: errorHandlerDefault, debounce: debounceDefault } = this

		const {
			get: fn,
			error: errorHandler = errorHandlerDefault,
			watch: watchOpt = undefined,
			watchClosely: watchCloselyOpt = undefined,
			eager = false,
			default: def = undefined,
			debounce: debounceOpt = debounceDefault,
			deep = true,
		} = options

		const debounce = watchOpt === undefined
			? undefined
			: debounceOpt

		// actually means it's an array
		const watch = typeof watchOpt === 'object'
			? function(this: V) { return pick(this, watchOpt) }
			: watchOpt

		const watchClosely = typeof watchCloselyOpt === 'object'
			? function(this: V) { return pick(this, watchCloselyOpt) }
			: watchCloselyOpt

		// (eager: true, defaulted: true, debounced: true)
		if (eager && def !== undefined && debounce !== undefined)
			return new AsyncComputed(vm, errorHandler, watch, watchClosely, fn, debounce, def, deep)

		// (eager: true, defaulted: false, debounced: true)
		else if (eager && def === undefined && debounce !== undefined)
			return new AsyncComputedNoDefault(vm, errorHandler, watch, watchClosely, fn, debounce, def, deep)

		// (eager: false, defaulted: true, debounced: true)
		else if (!eager && def !== undefined && debounce !== undefined)
			return new AsyncComputedNotEager(vm, errorHandler, watch, watchClosely, fn, debounce, def, deep)

		// (eager: false, defaulted: false, debounced: true)
		else if (!eager && def === undefined && debounce !== undefined)
			return new AsyncComputedNotEagerNoDefault(vm, errorHandler, watch, watchClosely, fn, debounce, def, deep)

		// (eager: true, defaulted: true, debounced: false)
		else if (eager && def !== undefined && debounce === undefined)
			return new AsyncComputedNoDebounce(vm, errorHandler, watchClosely, fn, def, deep)

		// (eager: true, defaulted: false, debounced: false)
		else if (eager && def === undefined && debounce === undefined)
			return new AsyncComputedNoDefaultNoDebounce(vm, errorHandler, watchClosely, fn, def, deep)

		// (eager: false, defaulted: true, debounced: false)
		else if (!eager && def !== undefined && debounce === undefined)
			return new AsyncComputedNotEagerNoDebounce(vm, errorHandler, watchClosely, fn, def, deep)

		// (eager: false, defaulted: false, debounced: false)
		else if (!eager && def === undefined && debounce === undefined)
			return new AsyncComputedNotEagerNoDefaultNoDebounce(vm, errorHandler, watchClosely, fn, def, deep)

		throw new Error(
			"Somehow the options to async.computed were invalid, and didn't match any actual cases:"
			+ `\n  get: ${fn}`
			+ `\n  watch: ${watchOpt}`
			+ `\n  watchClosely: ${watchClosely}`
			+ `\n  eager: ${eager}`
			+ `\n  default: ${def}`
			+ `\n  debounce: ${debounceOpt}`
		)
	}
}




// this is the root non-debounced
// (eager: false, defaulted: false, debounced: false)
class AsyncComputedNotEagerNoDefaultNoDebounce<V extends Vue, T, WC extends Watcher<V>> {
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly defaultValue: T | null = null,
		readonly deep = true,
	) {}

	protected initializeWatches() {
		const { vm, watchClosely, deep } = this

		if (watchClosely !== undefined)
			vm.$watch(
				watchClosely,
				() => { this.immediateHandler() },
				{ deep, immediate: false },
			)
	}

	protected immediateHandler() {
		const { vm, errorHandler, watchClosely, defaultValue } = this
		this._loading = true

		const promise = this._promise = this.fn({
			...((watchClosely && watchClosely.call(vm)) || {})
		})
			.then(v => {
				this._error = null
				return this._value = v
			})
			.catch(e => {
				if (errorHandler) errorHandler(e)
				this._error = e
				return this._value = defaultValue
			})
			.finally(() => {
				this._loading = false
			})

		return promise
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly defaultValue: T,
		readonly deep = true,
	) {
		super(vm, errorHandler, watchClosely, fn, defaultValue, deep)
		this._value = defaultValue
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly defaultValue: T | null = null,
		readonly deep = true,
	) {
		super(vm, errorHandler, watchClosely, fn, defaultValue, deep)
		// calling immediateHandler is the simplest way to be eager
		this.immediateHandler()
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncSingle<V, T, WC>,
		readonly defaultValue: T,
		readonly deep = true,
	) {
		super(vm, errorHandler, watchClosely, fn, defaultValue, deep)
		this.immediateHandler()
		this._value = defaultValue
	}
}



// this is the root debounced
// (eager: false, defaulted: false, debounced: true)
class AsyncComputedNotEagerNoDefault<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> {
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

	protected readonly debouncedFn: ReturnType<typeof _debounce>
	readonly cancel: () => void
	readonly now: () => void

	constructor(
		readonly vm: V,
		readonly errorHandler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly defaultValue: T | null = null,
		readonly deep = true,
	) {
		this.debouncedFn = _debounce(() => { this.immediateHandler() }, debounce)
		this.cancel = () => {
			this._queued = false
			this.debouncedFn.cancel()
		}
		this.now = () => {
			this.debouncedFn.flush()
		}
	}

	protected initializeWatches() {
		const { vm, watch, watchClosely, deep } = this
		if (watchClosely !== undefined) {
			vm.$watch(
				watchClosely,
				() => { this.immediateHandler() },
				{ deep, immediate: false },
			)
		}

		if (watch !== undefined) {
			vm.$watch(
				watch,
				() => {
					this._queued = true
					this.debouncedFn()
				},
				{ deep, immediate: false }
			)
		}
	}

	protected immediateHandler() {
		const { vm, errorHandler, watch, watchClosely, defaultValue } = this
		this.cancel()
		this._loading = true

		const promise = this._promise = this.fn({
			...((watchClosely && watchClosely.call(vm)) || {}),
			...((watch && watch.call(vm)) || {}),
		})
			.then(v => {
				this._error = null
				return this._value = v
			})
			.catch(e => {
				if (errorHandler) errorHandler(e)
				this._error = e
				return this._value = defaultValue
			})
			.finally(() => {
				this._loading = false
			})

		return promise
	}
}

// (eager: false, defaulted: true, debounced: true)
class AsyncComputedNotEager<V extends Vue, T, WW extends Watcher<V>, WC extends Watcher<V>> extends AsyncComputedNotEagerNoDefault<V, T, WW, WC> {
	protected _promise: Promise<T> | null = null
	protected _value: T
	get promise() { return this._promise }
	get value() { return this._value }

	constructor(
		readonly vm: V,
		readonly errorHandler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly defaultValue: T,
		readonly deep = true,
	) {
		super(vm, errorHandler, watch, watchClosely, fn, debounce, defaultValue, deep)
		this._value = defaultValue
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly defaultValue: T | null = null,
		readonly deep = true,
	) {
		super(vm, errorHandler, watch, watchClosely, fn, debounce, defaultValue, deep)
		this.immediateHandler()
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly watch: WatcherFunction<V, WW> | undefined,
		readonly watchClosely: WatcherFunction<V, WC> | undefined,
		readonly fn: AsyncFuncDistinct<V, T, WW, WC>,
		readonly debounce: number,
		readonly defaultValue: T,
		readonly deep = true,
	) {
		super(vm, errorHandler, watch, watchClosely, fn, debounce, defaultValue, deep)
		this._value = defaultValue
		this.immediateHandler()
	}
}
