import { r } from '@vyke/results'
import { removeFileInModule } from './files'

export async function cleanUp() {
	await r.toExpect(removeFileInModule('src'), 'unable to clean remove src')
}
