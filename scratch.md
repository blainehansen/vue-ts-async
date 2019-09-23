type TupleUnion<L extends any[]> = L[number]

type Watcher<V> = (keyof V)[] | ((this: V) => any)

type WatcherOutput<V, W extends Watcher<V>> =
	[W] extends [(this: V) => infer T] ? T
	: [W] extends [(keyof V)[]] ? Pick<V, TupleUnion<W>>
	: never


type WatcherFunction<V, W extends Watcher<V>> =
	W extends []
		? (this: V) => never
		: (this: V) => WatcherOutput<V, W>

type Data = { a: string, b: boolean, c: number }
type A = WatcherFunction<Data, ['a', 'b']>
type B = WatcherFunction<Data, (this: Data) => { v: number }>
type C = WatcherFunction<Data, []>






// type Filter<T, U> = T extends U ? T : never

// type RequireDistinct<A, B> =
// 	Filter<keyof A, keyof B> extends never
// 		? A & B
// 		: never


// type A = { a: string, b: number }
// type B = {  c: boolean }

// type Z = RequireDistinct<A, B>


// type FuncOpt<I, O> =
//     (arg: I) => O

// type Options<V> = {
//     give: (this: V) => any,
//     extra?: (this: V) => any,
//     wrap?: true,
// }

// type IsFalse<>



// type OptionalReturnType<F extends ((...args: any[]) => any) | undefined> =
//     F extends (...args: any[]) => infer T ? T
//     : {}

// type InputOfOptions<V, O extends Options<V>> =
//     ReturnType<O['give']> & OptionalReturnType<O['extra']>

// type OptionsWithFunc<V, T, O extends Options<V>> =
//     { g: FuncOpt<InputOfOptions<V, O>, T> }
//     & O

// type Out<V, T, O extends Options<V>> =
//     O['wrap'] extends true ? { value: T }
//     : T

// function s<V, T, O extends Options<V>>(
//     v: V,
//     { g, give, extra, wrap }: OptionsWithFunc<V, T, O>,
// ): Out<V, T, O> {
//     throw new Error()
// }

// type Data = { a: string, b: boolean, c: number }

// const a = s({ a: 'a', b: true, c: 5 }, {
//     g({ some_string, len }) { return some_string.length === len },
//     give() { return { some_string: this.a } },
//     extra() { return { len: this.c } },
//     // wrap: true,
// })
