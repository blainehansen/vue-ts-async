import 'mocha'
import Vue from 'vue'
import { expect } from 'chai'

import VueAsync from '../lib/index'

const async = VueAsync()

describe('data', () => {
	it('(defaulted: false, lazy: false) just function', async () => {
		class A extends Vue {
			num = 1
			dat = async.data(this, async function() { return await Promise.resolve(this.num + 1) })
		}
		const a = new A()

		type T = number | null
		const v: T = a.dat.value
		const p: Promise<T> = a.dat.promise
		const l: boolean = a.dat.loading
		const e: Error | null = a.dat.error

		expect(a.num).eql(1)

		expect(a.dat.promise).a('promise')
		expect(a.dat.value).eql(null)
		expect(a.dat.loading).true
		expect(a.dat.error).eql(null)

		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)

		a.dat.refresh()
		expect(a.dat.loading).true
		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)
	})

	it('(defaulted: false, lazy: false)', async () => {
		class A extends Vue {
			num = 1
			dat = async.data(this, {
				async get() { return await Promise.resolve(this.num + 1) },
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.dat.value
		const p: Promise<T> = a.dat.promise
		const l: boolean = a.dat.loading
		const e: Error | null = a.dat.error

		expect(a.num).eql(1)

		expect(a.dat.promise).a('promise')
		expect(a.dat.value).eql(null)
		expect(a.dat.loading).true
		expect(a.dat.error).eql(null)

		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)

		a.dat.refresh()
		expect(a.dat.loading).true
		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)
	})

	it('(defaulted: false, lazy: true)', async () => {
		class A extends Vue {
			num = 1
			dat = async.data(this, {
				async get() { return await Promise.resolve(this.num + 1) },
				lazy: true,
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.dat.value
		const p: Promise<T> | null = a.dat.promise
		const l: boolean = a.dat.loading
		const e: Error | null = a.dat.error

		expect(a.num).eql(1)

		expect(a.dat.promise).eql(null)
		expect(a.dat.value).eql(null)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)

		a.dat.refresh()
		expect(a.dat.loading).true
		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)
	})

	it('(defaulted: true, lazy: false)', async () => {
		class A extends Vue {
			num = 1
			dat = async.data(this, {
				async get() { return await Promise.resolve(this.num + 1) },
				default: 0,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.dat.value
		const p: Promise<T> = a.dat.promise
		const l: boolean = a.dat.loading
		const e: Error | null = a.dat.error

		expect(a.num).eql(1)

		expect(a.dat.promise).a('promise')
		expect(a.dat.value).eql(0)
		expect(a.dat.loading).true
		expect(a.dat.error).eql(null)

		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)

		a.dat.refresh()
		expect(a.dat.loading).true
		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)
	})

	it('(defaulted: true, lazy: true)', async () => {
		class A extends Vue {
			num = 1
			dat = async.data(this, {
				async get() { return await Promise.resolve(this.num + 1) },
				default: 0,
				lazy: true,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.dat.value
		const p: Promise<T> | null = a.dat.promise
		const l: boolean = a.dat.loading
		const e: Error | null = a.dat.error

		expect(a.num).eql(1)

		expect(a.dat.promise).eql(null)
		expect(a.dat.value).eql(0)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)

		a.dat.refresh()
		expect(a.dat.loading).true
		await a.dat.promise
		expect(a.dat.value).eql(2)
		expect(a.dat.loading).false
		expect(a.dat.error).eql(null)
	})
})
