import Vue from 'vue'

import { Computed } from './computed'
import { ErrorHandler } from './utils'

class VueTsAsync extends Computed {}

export type VueAsyncOptions = { debounce?: number, error?: ErrorHandler }

export default function VueAsync({ debounce = 1000, error }: VueAsyncOptions = {}) {
	return new VueTsAsync(debounce, error)
}
