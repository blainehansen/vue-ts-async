import Vue from 'vue'
import _debounce from 'lodash.debounce'

import { Computed } from './computed'
import { ErrorHandler } from './utils'

class VueTsAsync extends Computed {
	debounce_function<A extends any[]>(fn: (...arg: A) => void) {
		return _debounce(fn, this.debounce)
	}
}

export type VueAsyncOptions = { debounce?: number, error?: ErrorHandler }

export default function VueAsync({ debounce = 1000, error }: VueAsyncOptions = {}) {
	return new VueTsAsync(debounce, error)
}
