import './style.css'
import { $, ref } from '@vyke/elements/v/dom'
import * as icons from '@vyke/elements-fa-solid'
import { dency } from '@vyke/dency'
import { button, div, h1, li, span, ul } from './elements'
import { Preview } from './preview'
import { ThemeManager, createThemeManager } from './theme/theme-manager'
import { AppId, createApp } from './app'
import { rootSola } from './sola'
import { isValueNonNullable, subscribe } from './value'

const sola = rootSola.withTag('main')

dency.bind(ThemeManager, createThemeManager, [])
dency.bind(AppId, createApp, [])

function main() {
	const iconNames = Object.keys(icons) as Array<keyof typeof icons>

	const app = dency.use(AppId)

	const containerRef = ref<typeof div>()

	subscribe((value) => {
		sola.debug('icon selected changed', value)

		if (Preview.isMounted() || !isValueNonNullable(app.selectedIcon)) {
			return
		}

		Preview.mount(
			containerRef,
			{
				iconName: app.selectedIcon,
				onClose() {
					Preview.unmount()
				},
			},
		)
	}, app.selectedIcon)

	return div({ $ref: containerRef },
		div(
			h1({ class: 'text-center text-5xl mt-6 mb-4' }, '@vyke/elements-fa-solid'),
		),
		ul({ class: 'grid auto-cols-max grid-auto-size gap-4 p-4' },
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

	)
}

document.getElementById('app')!.append($(main()))
