import { dency } from '@vyke/dency'

export type ThemeManager = {
	themes: Array<string>
	current: string
	onChange: (theme: string) => void
}

export const ThemeManager = dency.create<ThemeManager>('themes')

export function createThemeManager() {
	const manager: ThemeManager = {
		themes: ['light', 'dark', 'cupcake'],
		current: 'cupcake',
		onChange(theme) {
			manager.current = theme
		},
	}

	return manager
}
