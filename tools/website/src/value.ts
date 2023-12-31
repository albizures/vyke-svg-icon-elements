type Listener<T> = (value: T) => boolean | void
type Unsubscribe = () => void

export type ReadVal<T> = {
	get: () => T
	subscribe: (fn: Listener<T>) => Unsubscribe
}
export type Val<T> = ReadVal<T> & {
	notify: () => void
	set: (value: T, update?: boolean) => void
}

export function createVal<T>(defaultValue: T): Val<T> {
	let current = defaultValue
	const listeners = new Set<Listener<any>>()

	const val = {
		notify() {
			for (const listener of listeners) {
				if (listener(current) === false) {
					listeners.delete(listener)
				}
			}
		},
		subscribe<T>(listener: Listener<T>) {
			listeners.add(listener)

			return () => {
				listeners.delete(listener)
			}
		},
		get() {
			return current
		},
		set(value: T, update = true) {
			if (value === current) {
				return
			}

			current = value

			if (update) {
				val.notify()
			}
		},
	}

	return val
}

export type InferType<TVal> = TVal extends ReadVal<infer TValue> ? TValue : never
export type InferEachType<TVals> = TVals extends [infer THead]
	? [InferType<THead>]
	: TVals extends [infer THead, ... infer TTail]
		? [InferType<THead>, ...InferEachType<TTail>]
		: never

function getValue<T>(val: ReadVal<T>) {
	return val.get()
}

export function getValues<T extends Array<ReadVal<any>>>(...values: T): InferEachType<T> {
	return values.map(getValue) as InferEachType<T>
}

export type SelectFn<TValues extends Array<any>, TOuput> = (...value: TValues) => TOuput

export function select<
	TVals extends Array<ReadVal<any>>,
	TOuput,
>(
	fn: SelectFn<InferEachType<TVals>, TOuput>,
	...vals: TVals
): ReadVal<TOuput> {
	const val = {
		subscribe(listener: Listener<TOuput>) {
			return subscribe((...values) => {
				return listener(fn(...values))
			}, ...vals)
		},
		get() {
			return fn(...getValues(...vals))
		},
	}

	return val
}

export type SubscribeFn<TValues extends Array<any>> = (...value: TValues) => boolean | void

export function subscribe<TVals extends Array<ReadVal<any>>>(
	listener: SubscribeFn<InferEachType<TVals>>,
	...vals: TVals
) {
	let unsubscribers: Array<Unsubscribe> = []

	function unsubscribe() {
		for (const unsubscribe of unsubscribers) {
			unsubscribe()
		}

		unsubscribers = []
	}

	for (const val of vals) {
		unsubscribers.push(val.subscribe(() => {
			if (listener(...getValues(...vals)) === false) {
				unsubscribe()
				return false
			}
		}))
	}

	return unsubscribe
}

export function isValueNonNullable<TValue>(val: ReadVal<TValue>): val is ReadVal<NonNullable<TValue>> {
	const value = val.get()
	return !(value === undefined || value === null)
}
