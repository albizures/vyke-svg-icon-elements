import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import fs from 'fs-extra'
import { r } from '@vyke/results'
import { rootSola } from './sola'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const baseDir = process.cwd()
const require = createRequire(import.meta.url)
const sola = rootSola.withTag('files')

export async function writeFileInBundleSrc(filename: string, content: string) {
	return writeFileInBundle(path.join('src', filename), content)
}

export async function writeFileInBundle(filename: string, content: string) {
	const data = await r.to(fs.outputFile(path.join(baseDir, filename), content))

	if (!data.ok) {
		sola.error(data.value)
		sola.error(`unable to write ${filename}, check the error above`)
		return r.err(new Error('unable to write file'))
	}

	return data
}

export async function removeFileInModule(filename: string) {
	const result = await r.to(fs.remove(path.join(baseDir, filename)))

	if (!result.ok) {
		sola.error(result.value)
		sola.error(`unable to delete ${filename}, check the error above`)
		return r.err(new Error('unable to delete file'))
	}

	return result
}

export async function readModuleFile(packModuleName: string, filename: string) {
	const pathname = require.resolve(path.join(packModuleName, filename))
	const icon = await r.to(fs.readFile(pathname, 'utf8'))

	if (!icon.ok) {
		sola.error(icon.value)
		sola.error(`unable to read ${filename} in ${packModuleName}, check the error above`)
		return r.err(new Error(`reading read in ${packModuleName}`))
	}

	return icon
}

export async function readTemplate(name: string) {
	const filename = path.join(
		path.resolve(__dirname, '..', '..', 'src', 'templates'),
		name,
	)

	const data = await r.to(fs.readFile(filename, 'utf8'))

	if (!data.ok) {
		sola.error(data.value)
		sola.error(`unable to read the template ${name}, check the error above`)
		return r.err(new Error('unable to read template'))
	}

	return data
}

export async function readSvgIcon(packModuleName: string, name: string) {
	return readModuleFile(packModuleName, `${name}.svg`)
}
