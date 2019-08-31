import 'mocha'
import Vue from 'vue'
import sinon from 'sinon'
import { expect } from 'chai'
import { delay } from 'bluebird'
import Component from 'vue-class-component'
import { shallowMount } from '@vue/test-utils'

import VueAsync from '../lib/index'

// const clock = sinon.useFakeTimers()

const async = VueAsync({ debounce: 25 })

describe('computed', () => {
	it('(eager: true, defaulted: true, debounced: true)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
				default: 0,
				eager: true,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.computed.value
		const p: Promise<T> = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.value).eql(0)
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(2)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
	})
	it('(eager: true, defaulted: true, debounced: true) with watch_closely', async () => {
		const error_handler = sinon.spy()

		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				watch_closely: ['yes'],
				async get({ num, yes }) {
					if (!yes) throw new Error('e')
					return await delay(25, num + 1)
				},
				error: error_handler,
				default: 0,
				eager: true,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.computed.value
		const p: Promise<T> = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.value).eql(0)
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(2)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false

		m.setData({ yes: false })
		await m.vm.computed.promise
		expect(error_handler.calledOnce).true
		expect(m.vm.computed.error!.message).eql('e')
	})


	it('(eager: true, defaulted: false, debounced: true)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
				eager: true,
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.computed.value
		const p: Promise<T> = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.value).eql(null)
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(2)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
	})
	it('(eager: true, defaulted: false, debounced: true) with watch_closely', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				watch_closely: ['yes'],
				async get({ num, yes }) { return await delay(25, yes ? num + 1 : 4) },
				eager: true,
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.computed.value
		const p: Promise<T> = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.value).eql(null)
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(2)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
	})


	it('(eager: false, defaulted: true, debounced: true)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
				default: 0,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.computed.value
		const p: Promise<T> | null = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(0)

		m.setData({ num: 2 })
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).true
		expect(m.vm.computed.value).eql(0)

		await delay(25)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(0)

		await m.vm.computed.promise
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(3)
	})
	it('(eager: false, defaulted: true, debounced: true) with watch_closely', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				watch_closely: ['yes'],
				async get({ num, yes }) { return await delay(25, yes ? num + 1 : 4) },
				default: 0,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.computed.value
		const p: Promise<T> | null = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(0)

		m.setData({ yes: false })
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(0)

		await m.vm.computed.promise
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(4)
	})


	it('(eager: false, defaulted: false, debounced: true)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.computed.value
		const p: Promise<T> | null = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(null)

		m.setData({ num: 2 })
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).true
		expect(m.vm.computed.value).eql(null)

		await delay(25)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(null)

		await m.vm.computed.promise
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(3)
	})
	it('(eager: false, defaulted: false, debounced: true) with watch_closely', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch: ['num'],
				watch_closely: ['yes'],
				async get({ num, yes }) { return await delay(25, yes ? num + 1 : 4) },
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.computed.value
		const p: Promise<T> | null = a.computed.promise
		const l: boolean = a.computed.loading
		const q: boolean = a.computed.queued
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(null)

		m.setData({ yes: false })
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.loading).true
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(null)

		await m.vm.computed.promise
		expect(m.vm.computed.loading).false
		expect(m.vm.computed.queued).false
		expect(m.vm.computed.value).eql(4)
	})



	it('(eager: true, defaulted: true, debounced: false)', async () => {
		const error_handler = sinon.spy()

		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch_closely: ['num'],
				async get({ num }) {
					if (num === 10) throw new Error('e')
					return await delay(25, num + 1)
				},
				error: error_handler,
				default: 0,
				eager: true,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.computed.value
		const p: Promise<T> = a.computed.promise
		const l: boolean = a.computed.loading
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.value).eql(0)
		expect(m.vm.computed.loading).true

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(2)
		expect(m.vm.computed.loading).false

		m.setData({ num: 2 })
		expect(m.vm.computed.loading).true

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(3)
		expect(m.vm.computed.loading).false

		m.setData({ num: 10 })
		await m.vm.computed.promise
		expect(error_handler.calledOnce).true
		expect(m.vm.computed.error!.message).eql('e')
	})

	it('(eager: true, defaulted: false, debounced: false)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch_closely: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
				eager: true,
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.computed.value
		const p: Promise<T> = a.computed.promise
		const l: boolean = a.computed.loading
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.value).eql(null)
		expect(m.vm.computed.loading).true

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(2)
		expect(m.vm.computed.loading).false

		m.setData({ num: 2 })
		expect(m.vm.computed.loading).true

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(3)
		expect(m.vm.computed.loading).false
	})

	it('(eager: false, defaulted: true, debounced: false)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch_closely: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
				default: 0,
			})
		}
		const a = new A()

		type T = number
		const v: T = a.computed.value
		const p: Promise<T> | null = a.computed.promise
		const l: boolean = a.computed.loading
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.value).eql(0)
		expect(m.vm.computed.loading).false

		m.setData({ num: 2 })
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.loading).true

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(3)
		expect(m.vm.computed.loading).false
	})

	it('(eager: false, defaulted: false, debounced: false)', async () => {
		@Component({ render(h) { return h('div', ['hello']) } })
		class A extends Vue {
			num = 1; yes = true
			@async.Computed
			computed = async.computed(this, {
				watch_closely: ['num'],
				async get({ num }) { return await delay(25, num + 1) },
			})
		}
		const a = new A()

		type T = number | null
		const v: T = a.computed.value
		const p: Promise<T> | null = a.computed.promise
		const l: boolean = a.computed.loading
		const e: Error | null = a.computed.error

		const m = shallowMount(A)
		expect(m.vm.num).eql(1)
		expect(m.vm.computed.promise).eql(null)
		expect(m.vm.computed.value).eql(null)
		expect(m.vm.computed.loading).false

		m.setData({ num: 2 })
		expect(m.vm.computed.promise).a('promise')
		expect(m.vm.computed.loading).true

		await m.vm.computed.promise
		expect(m.vm.computed.value).eql(3)
		expect(m.vm.computed.loading).false
	})
})
