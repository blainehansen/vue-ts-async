import Vue from 'vue'

import { Overwrite, ErrorHandler } from './utils'

// more?: () =>
// type InfiniteAsyncDataOptions<> = {
// 	//
// }

/**
 * A function with your Vue instance as the `this` context that returns a promise.
 */
export type AsyncDataFunc<V extends Vue, T> = (this: V) => Promise<T>

export type AsyncDataOptions<V extends Vue, T> = {
	get: AsyncDataFunc<V, T>,
	error?: ErrorHandler,
}

export type OptionsDefaulted<T> = {
	default: T,
}

export type OptionsLazy = {
	lazy: true,
}

export class Data {
	/**
	 * @ignore
	 */
	constructor(
		protected readonly error_handler: ErrorHandler | undefined,
	) {}

	// (defaulted: false, lazy: false) just function
	data<V extends Vue, T>(vm: V, fn: AsyncDataFunc<V, T>): AsyncDataNoDefault<V, T>
	// (defaulted: false, lazy: true)
	data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T> & OptionsLazy & OptionsDefaulted<T>): AsyncDataLazy<V, T>
	// (defaulted: false, lazy: false)
	data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T> & OptionsLazy): AsyncDataLazyNoDefault<V, T>
	// (defaulted: true, lazy: true)
	data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T> & OptionsDefaulted<T>): AsyncData<V, T>
	// (defaulted: true, lazy: false)
	data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T>): AsyncDataNoDefault<V, T>
	data<V extends Vue, T>(
		vm: V,
		opts: any,
	): any {

		const { error_handler: error_handler_default } = this

		const { def, fn, lazy, error_handler = error_handler_default } = typeof opts === 'function'
			? { fn: opts, def: undefined, lazy: false }
			: { fn: opts.get, def: opts.default, lazy: opts.lazy || false, error_handler: opts.error }

		if (def === undefined) {
			if (lazy)
				return new AsyncDataLazyNoDefault(vm, error_handler, fn, undefined)
			else
				return new AsyncDataNoDefault(vm, error_handler, fn, undefined)
		}
		else {
			if (lazy)
				return new AsyncDataLazy(vm, error_handler, fn, def)
			else
				return new AsyncData(vm, error_handler, fn, def)
		}
	}
}


class AsyncDataLazyNoDefault<V extends Vue, T> {
	protected _promise: Promise<T | null> | null = null
	protected _value: T | null = null
	protected _loading = false
	protected _error: Error | null = null

	get promise() { return this._promise }
	get value() { return this._value }
	get loading() { return this._loading }
	get error() { return this._error }

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly default_value: T | null = null,
	) {}

	refresh() {
		const { error_handler } = this
		this._loading = true
		this._promise = this.fn.call(this.vm)
			.then(v => {
				this._error = null
				return this._value = v
			})
			.catch(e => {
				if (error_handler) error_handler(e)
				this._error = e
				return this._value = this.default_value
			})
			.finally(() => {
				this._loading = false
			})
	}
}

class AsyncDataNoDefault<V extends Vue, T> extends AsyncDataLazyNoDefault<V, T> {
	protected _promise!: Promise<T | null>

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly default_value: T | null = null,
	) {
		super(vm, error_handler, fn, default_value)
		this.refresh()
	}

	get promise() { return this._promise }
	get value() { return this._value }
}

class AsyncDataLazy<V extends Vue, T> extends AsyncDataLazyNoDefault<V, T> {
	protected _promise: Promise<T> | null = null
	protected _value: T

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly default_value: T,
	) {
		super(vm, error_handler, fn, default_value)
		this._value = default_value
	}

	get promise() { return this._promise }
	get value() { return this._value }
}

class AsyncData<V extends Vue, T> extends AsyncDataLazy<V, T> {
	protected _promise!: Promise<T>
	protected _value: T

	constructor(
		readonly vm: V,
		readonly error_handler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly default_value: T,
	) {
		super(vm, error_handler, fn, default_value)
		this._value = default_value
		this.refresh()
	}

	get promise() { return this._promise }
	get value() { return this._value }
}
