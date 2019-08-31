import Vue from 'vue'

import { Computed } from './computed'
import { ErrorHandler } from './utils'

class VueTsAsync extends Computed {}

export default function VueAsync({ error, debounce }: { error?: ErrorHandler, debounce?: number } = {}) {
	return new VueTsAsync(error, debounce)
}
