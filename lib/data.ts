import Vue from 'vue'

import { ErrorHandler } from './utils'

// more?: () =>
// type InfiniteAsyncDataOptions<> = {
// 	//
// }

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
	constructor(
		protected readonly errorHandler: ErrorHandler | undefined,
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

		const { errorHandler: errorHandlerDefault } = this

		const { def, fn, lazy, errorHandler = errorHandlerDefault } = typeof opts === 'function'
			? { fn: opts, def: undefined, lazy: false }
			: { fn: opts.get, def: opts.default, lazy: opts.lazy || false, errorHandler: opts.error }

		if (def === undefined) {
			if (lazy)
				return new AsyncDataLazyNoDefault(vm, errorHandler, fn, undefined)
			else
				return new AsyncDataNoDefault(vm, errorHandler, fn, undefined)
		}
		else {
			if (lazy)
				return new AsyncDataLazy(vm, errorHandler, fn, def)
			else
				return new AsyncData(vm, errorHandler, fn, def)
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

	readonly refresh: () => void

	constructor(
		readonly vm: V,
		readonly errorHandler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly defaultValue: T | null = null,
	) {
		this.refresh = () => {
			const { errorHandler } = this
			this._loading = true
			this._promise = this.fn.call(this.vm)
				.then(v => {
					this._error = null
					return this._value = v
				})
				.catch(e => {
					if (errorHandler) errorHandler(e)
					this._error = e
					return this._value = this.defaultValue
				})
				.finally(() => {
					this._loading = false
				})
		}
	}
}

class AsyncDataNoDefault<V extends Vue, T> extends AsyncDataLazyNoDefault<V, T> {
	protected _promise!: Promise<T | null>

	constructor(
		readonly vm: V,
		readonly errorHandler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly defaultValue: T | null = null,
	) {
		super(vm, errorHandler, fn, defaultValue)
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
		readonly errorHandler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly defaultValue: T,
	) {
		super(vm, errorHandler, fn, defaultValue)
		this._value = defaultValue
	}

	get promise() { return this._promise }
	get value() { return this._value }
}

class AsyncData<V extends Vue, T> extends AsyncDataLazy<V, T> {
	protected _promise!: Promise<T>
	protected _value: T

	constructor(
		readonly vm: V,
		readonly errorHandler: ErrorHandler | undefined,
		readonly fn: AsyncDataFunc<V, T>,
		readonly defaultValue: T,
	) {
		super(vm, errorHandler, fn, defaultValue)
		this._value = defaultValue
		this.refresh()
	}

	get promise() { return this._promise }
	get value() { return this._value }
}
