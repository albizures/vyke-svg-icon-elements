#!/usr/bin/env node
'use strict'
// @ts-check

import process from 'node:process'
import { generateIcons } from '../dist/index.mjs'

Promise.all([
	generateIcons(),
	// generateIcons('dom'),
]).catch((err) => {
	console.error(err.stack)
	process.exit(1)
})
