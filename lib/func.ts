// import Vue from 'vue'

// import { ErrorHandler } from './utils'

// // export type AsyncFunc = {
// // 	(): number,
// // 	invocations: number,
// // }

// type InternalFunc<V extends Vue, T> = (this: V) => Promise<T>

// export class Func {
// 	constructor(
// 		protected readonly errorHandler: ErrorHandler | undefined,
// 	) {}

// 	func<V extends Vue, T>(vm: V, fn: InternalFunc<V, T>) {
// 		return new AsyncFunc()
// 	}
// }

// export class AsyncFunc<V extends Vue, T> {
// 	protected _invocations = 0
// 	get invocations() { return this._invocations }
// 	get loading() { return this._invocations > 0 }

// 	protected _error: Error | null = null
// 	get error() { return this._error }

// 	readonly fn: InternalFunc<V, T>
// 	constructor(
// 		readonly vm: V,
// 		readonly errorHandler: ErrorHandler | undefined,
// 		protected readonly _fn: InternalFunc<V, T>,
// 	) {
// 		this.fn = () => {
// 			const { vm, _fn, errorHandler } = this
// 			this._invocations++
// 			const promise = _fn.call(vm)
// 			return promise
// 				.then(v => {
// 					this._error = null
// 					return v
// 				})
// 				.catch(e => {
// 					if (errorHandler) errorHandler(e)
// 					this._error = e
// 					return this._value = this.defaultValue
// 				})
// 				.finally(() => {
// 					this._invocations--
// 				})
// 		}
// 	}

// 	// refresh() {
// 	// 	const { errorHandler } = this
// 	// 	this._loading = true
// 	// 	this._promise = this.fn.call(this.vm)
// 	// 		.then(v => {
// 	// 			this._error = null
// 	// 			return this._value = v
// 	// 		})
// 	// 		.catch(e => {
// 	// 			if (errorHandler) errorHandler(e)
// 	// 			this._error = e
// 	// 			return this._value = this.defaultValue
// 	// 		})
// 	// 		.finally(() => {
// 	// 			this._loading = false
// 	// 		})
// 	// }
// }
