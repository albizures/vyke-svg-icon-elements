import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig(
	{
		// name: 'minified',
		// entries: ['./src/index', './src/dom/index'],
		rollup: {
			esbuild: {
				minify: true,
			},
		},
		// declaration: true,
	},
)
