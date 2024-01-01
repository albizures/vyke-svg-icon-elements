import './style.css'
import { type ReadSignal, type WriteSignal, effect, root } from '@maverick-js/signals'
import { $, type VykeRefElement, ref } from '@vyke/elements/v/dom'
import * as icons from '@vyke/elements-fa-solid'
import { dency } from '@vyke/dency'
import type { AnyVykeElement, AnyVykeRefElement } from '@vyke/elements/v'
import { Observable } from 'oby'
import { button, div, li, span, ul } from './elements'
import { Preview } from './preview'
import { ThemeManager, createThemeManager } from './theme/theme-manager'
import { AppId, createApp } from './app'
import { rootSola } from './sola'

const sola = rootSola.withTag('main')

dency.bind(ThemeManager, createThemeManager, [])
dency.bind(AppId, createApp, [])

function main() {
	const iconNames = Object.keys(icons) as Array<keyof typeof icons>

	const app = dency.use(AppId)

	const containerRef = ref<typeof div>()
	// let previewRef: VykeRefElement<'div', HTMLDivElement, 'html'> | undefined

	effect(() => {
		const selectedIcon = app.selectedIcon()
		sola.log(selectedIcon)

		if (!selectedIcon) {
			return
		}

		Preview.mount(
			containerRef,
			{
				iconName: app.selectedIcon as NonNullableSignal<typeof app.selectedIcon>,
				onClose() {
					//
				},
			},
		)
	})

	// effect(() => {
	// 	const icon = app.selectedIcon()

	// 	if (icon && !previewRef) {
	// 		root(() => {
	// 			previewRef = ref(Preview({
	// 				iconName: app.selectedIcon as WriteSignal<string>,
	// 				onClose() {
	// 					console.log('lelele')
	// 				},
	// 			}))
	// 			return containerRef.value.append($(previewRef))
	// 		})
	// 	}
	// 	if (!icon && previewRef && previewRef.value.isConnected) {
	// 		previewRef.value.remove()
	// 		previewRef = undefined
	// 	}
	// })

	return div({ $ref: containerRef },
		ul({ class: 'grid auto-cols-max grid-auto-size gap-4 mx-4' },
			...iconNames.map((name) => {
				const icon = icons[name]

				function onSelectIcon() {
					app.selectedIcon.set(name)
				}

				return li({ class: 'text-xl flex justify-center flex-col' },
					button({ onclick: onSelectIcon, class: 'flex justify-center items-center py-4 shadow rounded border-primary' },
						icon(),
					),
					div({ class: 'overflow-hidden text-center' },
						span({ class: 'text-xs' }, name),
					),
				)
			}),
		),

		isEx(
			(iconName) => Preview.get({
				iconName,
				onClose() {
				//
				},
			}),
			app.selectedIcon,
		),

	)
}

function isNon(signal: ReadSignal<unknown>): signal is ReadSignal<NonNullable<unknown>> {
	const value = signal()
	return value !== undefined && value !== null
}

type NonNullableSignal<T> = T extends WriteSignal<infer TValue>
	? WriteSignal<NonNullable<TValue>>
	: T extends ReadSignal<infer TValue>
		? ReadSignal<NonNullable<TValue>>
		: never

type EachNon<TArgs extends Array<unknown>> = TArgs extends [infer THead]
	? [NonNullableSignal<THead>]
	: TArgs extends [infer THead, ...infer TTail]
		? [NonNullableSignal<THead>, ...EachNon<TTail>]
		: never

type CreateFn<TOuput> = (...args: Array<ReadSignal<unknown>>) => TOuput
type GetArgs<TFn> = TFn extends (...args: infer TArgs) => any ? TArgs : never
function isEx<
	TOuput extends AnyVykeElement,
	TFn extends CreateFn<TOuput>,
>(
	create: (...args: EachNon<GetArgs<TFn>>) => TOuput | undefined,
	...args: GetArgs<TFn>
) {
	const isValid = args.every((signal) => {
		return signal() !== undefined && signal() !== null
	}, true)

	if (isValid) {
		return create(...args as EachNon<GetArgs<TFn>>)
	}
	return undefined
}

document.getElementById('app')!.append($(main()))
