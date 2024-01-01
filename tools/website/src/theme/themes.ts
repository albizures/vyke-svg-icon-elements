import { dency } from '@vyke/dency'

export type Themes = {
	names: Array<string>
}

export const Themes = dency.create<Themes>('themes')
