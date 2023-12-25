#!/usr/bin/env node
'use strict'
// @ts-check

import process from 'node:process'
import { cleanUp } from '../dist/index.mjs'

Promise.all([
	cleanUp(),
]).catch((err) => {
	console.error(err.stack)
	process.exit(1)
})
