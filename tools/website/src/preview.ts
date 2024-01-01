import { dency } from '@vyke/dency'
import copy from 'copy-text-to-clipboard'
import { type VykeRefElement, ref } from '@vyke/elements/v'
import { $ } from '@vyke/elements/v/dom'
import * as icons from '@vyke/elements-fa-solid'
import { button, div, h3, li, span, ul } from './elements'
import { ThemeToggle } from './theme/theme-toggle'
import { ThemeManager } from './theme/theme-manager'
import { Clipboard } from './icons'
import { rootSola } from './sola'
import { type ReadVal, getValues, select, subscribe } from './value'

const sola = rootSola.withTag('preview')

type PreviewProps = {
	iconName: ReadVal<string>
	onClose: () => void
}

type Icons = keyof typeof icons

function getImport(icon: string) {
	return `import { ${icon} } from '@vyke/elements-fa-solid'`
}

export const Preview = createComponent((props: PreviewProps) => {
	const { iconName: iconNameVal } = props
	const themeManager = dency.use(ThemeManager)

	const containerRef = ref<typeof div>()
	const titleRef = ref<typeof h3>()
	const iconPreviewRef = ref<typeof div>()

	const importIconVal = select((icon) => {
		return getImport(icon)
	}, iconNameVal)

	subscribe((iconName) => {
		titleRef.value.textContent = iconName
		const svg = iconPreviewRef.value.querySelector('svg')

		if (svg) {
			svg.replaceWith($(icons[iconName as Icons]()))
		}
	}, iconNameVal)

	const [iconName] = getValues(iconNameVal)

	function onChange(name: string) {
		sola.debug('preview theme changed', name)
		containerRef.value.dataset.theme = name
	}

	function onCopyName() {
		return copy(iconNameVal.get())
	}

	function onCopyImport() {
		return copy(getImport(iconNameVal.get()))
	}

	return ref(div({ class: 'fixed bottom-0 w-full flex justify-center' },
		div({ $ref: containerRef, class: 'modal-box max-w-3xl border border-base-200 flex' },
			div({ class: 'space-y-4' },
				div({ $ref: iconPreviewRef, class: 'text-8xl flex justify-center' },
					icons[iconName as Icons](),
				),
				div({},
					ThemeToggle({ onChange, themes: themeManager.themes }),
				),
			),
			div({ class: 'flex-1 overflow-hidden flex flex-col items-center' },
				h3({ $ref: titleRef, class: 'text-center text-xl' }, iconName),
				ul({ class: 'm-4 space-y-2' },
					li({ },
						CopyButton({
							label: importIconVal,
							onCopy: onCopyImport,
						}),
					),
					li({ },
						CopyButton({
							label: iconNameVal,
							onCopy: onCopyName,
						}),
					),
				),
			),
		),
	))
})

type CopyButtonProps = {
	label: ReadVal<string>
	onCopy: () => void
}

function CopyButton(props: CopyButtonProps) {
	const { label: labelVal, onCopy } = props
	const labelRef = ref<typeof span>()

	subscribe((label) => {
		labelRef.value.textContent = label
	}, labelVal)

	function onClick(event: Event) {
		const { currentTarget } = event
		if (currentTarget instanceof HTMLButtonElement) {
			currentTarget.className = `${currentTarget.className} text-success`
			setTimeout(() => {
				currentTarget.classList.remove('text-success', 'scale-110')
			}, 1000)
		}

		onCopy()
	}

	return button({ class: 'transition-all whitespace-nowrap overflow-scroll bg-base-200 border rounded py-0.5 px-1', onclick: onClick },
		Clipboard({ class: 'inline-block align-text-bottom mr-1' }),
		span({ $ref: labelRef }, labelVal.get()),
	)
}

function createComponent<T extends VykeRefElement<string, ChildNode, 'html' | 'svg'>, TProps>(
	build: (props: TProps) => T,
) {
	let elRef: T | undefined
	const component = {
		isMounted() {
			return Boolean(elRef)
		},
		get(props: TProps) {
			elRef = build(props)
			return elRef
		},
		mount(parentRef: VykeRefElement<string, ParentNode, 'html' | 'svg'>, props: TProps) {
			component.unmount()
			elRef = build(props)
			parentRef.value.append($(elRef))
		},
		unmount() {
			if (elRef) {
				elRef.value.remove()
				elRef = undefined
			}
		},
	}

	return component
}
