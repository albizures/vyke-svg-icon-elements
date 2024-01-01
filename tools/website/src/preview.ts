import { dency } from '@vyke/dency'
import { type VykeRefElement, ref } from '@vyke/elements/v'
import { $ } from '@vyke/elements/v/dom'
import { type ReadSignal, effect } from '@maverick-js/signals'
import { div, h3, li, span, ul } from './elements'
import { ThemeToggle } from './theme/theme-toggle'
import { ThemeManager } from './theme/theme-manager'
import { Clipboard } from './icons'
import { rootSola } from './sola'

const sola = rootSola.withTag('preview')

type PreviewProps = {
	iconName: ReadSignal<string>
	onClose: () => void
}

export const Preview = createComponent((props: PreviewProps) => {
	const { iconName } = props
	const themeManager = dency.use(ThemeManager)

	const containerRef = ref<typeof div>()
	const titleRef = ref<typeof h3>()
	const nameCopyRef = ref<typeof span>()

	containerRef.onCreated(() => {
		effect(() => {
			sola.log('lelele')

			titleRef.value.textContent = iconName()
			nameCopyRef.value.textContent = iconName()
		})
	})

	function onChange(name: string) {
		containerRef.value.dataset.theme = name
	}

	return ref(div({ class: 'fixed bottom-0 w-full flex justify-center' },
		div({ $ref: containerRef, class: 'modal-box border border-base-200 flex' },
			div({ class: 'space-y-4' },
				div({ class: 'text-8xl flex justify-center' },
					Clipboard(),
				),
				div({},
					ThemeToggle({ onChange, themes: themeManager.themes }),
				),
			),
			div({ class: 'flex-1' },
				h3({ $ref: titleRef, class: 'text-center text-xl' }, iconName()),
				ul({},
					li({ },
						span({ $ref: nameCopyRef }, iconName()),
						Clipboard({ class: 'inline-block align-text-bottom' }),
					),
				),
			),
		),
	))
})

function createComponent<T extends VykeRefElement<string, ChildNode, 'html' | 'svg'>, TProps>(
	build: (props: TProps) => T,
) {
	let elRef: T | undefined
	return {
		get(props: TProps) {
			return build(props)
		},
		mount(parentRef: VykeRefElement<string, ParentNode, 'html' | 'svg'>, props: TProps) {
			setTimeout(() => {
				elRef = build(props)
				parentRef.value.append($(elRef))
			})
		},
		unmount() {
			if (elRef) {
				elRef.value.remove()
				elRef = undefined
			}
		},
	}
}
