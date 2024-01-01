import { dency } from '@vyke/dency'
import { type Val, createVal } from './value'

export type App = {
	selectedIcon: Val<string | undefined>
}

export const AppId = dency.create<App>('app')

export function createApp() {
	const selectedIcon = createVal<string | undefined>(undefined)
	const app: App = {
		selectedIcon,
	}

	return app
}
