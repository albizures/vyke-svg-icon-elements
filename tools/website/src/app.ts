import { dency } from '@vyke/dency'
import { type WriteSignal, signal } from '@maverick-js/signals'

export type App = {
	selectedIcon: WriteSignal<string | undefined>
}

export const AppId = dency.create<App>('app')

export function createApp() {
	const selectedIcon = signal<string | undefined>(undefined)
	const app: App = {
		selectedIcon,
	}

	return app
}
