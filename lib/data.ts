import Vue from 'vue'

import { Overwrite } from './utils'

// more?: () =>
// type InfiniteAsyncDataOptions<> = {
// 	//
// }

type AsyncDataFunc<V extends Vue, T> = (this: V) => Promise<T>

type AsyncDataOptions<V extends Vue, T> = {
	get: AsyncDataFunc<V, T>,
}

type OptionsDefaulted<T> = {
	default: T,
}

type OptionsLazy = {
	lazy: true,
}

// if they use lazy, then they get a nullable promise
// if they give a default, they get an non-nullable
export function data<V extends Vue, T>(vm: V, fn: AsyncDataFunc<V, T>): AsyncDataNoDefault<V, T>
export function data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T> & OptionsLazy & OptionsDefaulted<T>): AsyncDataLazy<V, T>
export function data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T> & OptionsLazy): AsyncDataLazyNoDefault<V, T>
export function data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T> & OptionsDefaulted<T>): AsyncData<V, T>
export function data<V extends Vue, T>(vm: V, opts: AsyncDataOptions<V, T>): AsyncDataNoDefault<V, T>
export function data<V extends Vue, T>(
	vm: V,
	opts: any,
): any {

	const { def, fn, lazy } = typeof opts === 'function'
		? { fn: opts, def: undefined, lazy: false }
		: { fn: opts.get, def: opts.default, lazy: opts.lazy || false }

	if (def === undefined) {
		if (lazy)
			return new AsyncDataLazyNoDefault(vm, fn, undefined)
		else
			return new AsyncDataNoDefault(vm, fn, undefined)
	}
	else {
		if (lazy)
			return new AsyncDataLazy(vm, fn, def)
		else
			return new AsyncData(vm, fn, def)
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

	constructor(readonly vm: V, readonly fn: AsyncDataFunc<V, T>, readonly default_value: T | null = null) {}

	refresh() {
		this._loading = true
		this._promise = this.fn.call(this.vm)
			.then(v => {
				this._error = null
				return this._value = v
			})
			.catch(e => {
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

	constructor(readonly vm: V, readonly fn: AsyncDataFunc<V, T>, readonly default_value: T | null = null) {
		super(vm, fn, default_value)
		this.refresh()
	}

	get promise() { return this._promise }
	get value() { return this._value }
}

class AsyncDataLazy<V extends Vue, T> extends AsyncDataLazyNoDefault<V, T> {
	protected _promise: Promise<T> | null = null
	protected _value: T

	constructor(readonly vm: V, readonly fn: AsyncDataFunc<V, T>, readonly default_value: T) {
		super(vm, fn, default_value)
		this._value = default_value
	}

	get promise() { return this._promise }
	get value() { return this._value }
}

class AsyncData<V extends Vue, T> extends AsyncDataLazy<V, T> {
	protected _promise!: Promise<T>
	protected _value: T

	constructor(readonly vm: V, readonly fn: AsyncDataFunc<V, T>, readonly default_value: T) {
		super(vm, fn, default_value)
		this._value = default_value
		this.refresh()
	}

	get promise() { return this._promise }
	get value() { return this._value }
}
