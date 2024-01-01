import { option, select } from '../elements'

type ThemeToggleProps = {
	onChange: (theme: string) => void
	themes: Array<string>
}

export function ThemeToggle(props: ThemeToggleProps) {
	const { onChange: onChangeHandle, themes } = props
	function onChange(event: Event) {
		const { target } = event
		if (target instanceof HTMLSelectElement) {
			onChangeHandle(target.value)
		}
	}
	return select({ class: 'select select-bordered w-full max-w-xs', onchange: onChange },
		...themes.map((name) => {
			return option({ class: 'text-center' },
				name,
			)
		}),
	)
}
