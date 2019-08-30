import Vue from 'vue'

import { Computed } from './computed'
import { ErrorHandler } from './utils'

class VueTsAsync<V extends Vue, T> extends Computed<V, T> {}

export default function VueAsync(
	error_handler?: ErrorHandler,
	debounce?: number,
) {
	return new VueTsAsync(error_handler, debounce)
}
