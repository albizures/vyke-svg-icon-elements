import { r } from '@vyke/results'
import { z } from 'zod'
import { readModuleFile } from './files'
import { rootSola } from './sola'

const sola = rootSola.withTag('manifest')

export const Attrs = z.record(z.string(), z.coerce.string())
export type Attrs = z.infer<typeof Attrs>

export const Icon = z.object({
	name: z.string(),
	pack: z.string().optional(),
	viewBox: z.string().optional(),
	verticalAlign: z.string().optional(),
	originalName: z.string().optional(),
	attrs: Attrs,
	width: z.number(),
	height: z.number(),
})
export type Icon = z.infer<typeof Icon>

export const Manifest = z.array(Icon)
export type Manifest = z.infer<typeof Manifest>

export async function readManifest(packModuleName: string) {
	const file = await r.toUnwrap(readModuleFile(packModuleName, '__manifest.json'))

	const parsed = Manifest.safeParse(JSON.parse(file))

	if (!parsed.success) {
		for (const itemError of parsed.error.issues) {
			sola.error(itemError.message, itemError.path.join('.'))
		}
		return r.err(new Error('parsing manifest, check the log above for more details'))
	}

	return r.ok(parsed.data)
}
