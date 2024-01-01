import path from 'node:path'
import process from 'node:process'
import camelCase from 'camelcase'
import { type Attribs, markupToNodes, nodesToElements } from '@vyke/transform-to-elements'
import { r } from '@vyke/results'
import { Sola } from '@vyke/sola'
import { readSvgIcon, readTemplate, writeFileInBundleSrc } from './files'
import { readManifest } from './manifest'

const sola = new Sola({ tag: 'vyke:svg-icon-elements' })

const baseDir = process.cwd()

type Icon = {
	name: string
	file: string
}

export async function generateIcons() {
	const packModuleName = process.argv[2]!
	const icons = await r.toExpect(readManifest(packModuleName), 'Error reading manifest')

	if (icons.length === 0) {
		console.error('Error reading icons from pack')
		process.exit(1)
	}

	const componentPrefix = camelCase(
		packModuleName.replace('@svg-icons/', ''),
		{ pascalCase: true },
	)

	const iconTemplate = await r.toExpect(readTemplate('icon.ts.template'), 'Unable to get the template')

	const totalIcons = icons.length
	const allIcons: Array<Icon> = []

	const elementsUsed = new Set<string>()

	for (const icon of icons) {
		const svgIcon = await r.toUnwrap(readSvgIcon(packModuleName, icon.name))

		const iconNodes = markupToNodes(svgIcon)

		const [rootNode] = iconNodes

		if (iconNodes.length !== 1 || !(rootNode && rootNode.type === 'tag' && rootNode.name === 'svg')) {
			sola.error('svg is not root of the icon')

			continue
		}

		const defaultAttribs: Attribs = {
			fill: { type: 'value', value: 'currentColor' },
			xmlns: { type: 'value', value: 'http://www.w3.org/2000/svg' } }
		const currentAttribs = rootNode.attribs
		rootNode.attribs = {
			...currentAttribs,
			...defaultAttribs,
			width: { type: 'value', value: '1em' },
			height: { type: 'value', value: '1em' },
			class: { type: 'var', name: 'className' },
			viewBox: { type: 'value', value: icon.viewBox ?? `0 0 ${icon.width} ${icon.height}` },
			verticalAlign: { type: 'value', value: icon.verticalAlign ?? 'middle' },
		}

		icon.pack = path.basename(baseDir)

		const componentName = camelCase(icon.name, { pascalCase: true })
		const iconName = `${componentPrefix}${componentName}`
		const { code, tags: elements } = nodesToElements([rootNode])

		for (const element of elements) {
			elementsUsed.add(element)
		}

		// console.log(code, '<- the code')

		const iconCode = iconTemplate
			.replaceAll(/{{name}}/g, iconName)
			.replaceAll(/{{code}}/g, code.join('\n\t'))
			.replaceAll(/{{elements}}/g, elements.join(', '))

		await r.toUnwrap(writeFileInBundleSrc(`icons/${icon.name}.ts`, iconCode))

		allIcons.push({
			name: iconName,
			file: icon.name,
		})

		sola.log(`${iconName} created`)
	}

	await r.toUnwrap(writeElementsFile([...elementsUsed]))
	await r.toUnwrap(writeIndexFile(allIcons))

	sola.log(`${totalIcons} icons generated!`)
}

async function writeElementsFile(elements: Array<string>) {
	const elementsTemplate = await r.toExpect(readTemplate('elements.ts.template'), 'error getting elements template')

	const elementsCode = elementsTemplate.replace(/{{elements}}/g, elements.sort().join(',\n\t'))

	return writeFileInBundleSrc('elements.ts', elementsCode)
}

async function writeIndexFile(icons: Array<Icon>) {
	const code = icons.map((icon) => {
		return `export { ${icon.name}} from './icons/${icon.file}'`
	}).join('\n')

	return writeFileInBundleSrc('index.ts', code)
}
