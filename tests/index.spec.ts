import 'mocha'
import { expect } from 'chai'
import '@ts-std/extensions/dist/promise'

import VueAsync from '../lib/index'
const async = VueAsync({ debounce: 25 })

describe('debounce_function', () => {
	it('works', async () => {
		let p = undefined as Promise<number> | undefined
		const fn = async.debounce_function((n: number) => {
			p = Promise.resolve(n + 1)
		})

		const r: void = fn(1)
		expect(p).eql(undefined)
		await Promise.delay(25)
		expect(await p).eql(2)
	})
})
