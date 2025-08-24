#!/usr/bin/env node

/**
 * Simple build script to generate UMD and ESM versions from source
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

// Read the source file and update version
let source = fs.readFileSync(path.join(__dirname, '../src/jado.js'), 'utf8');

// Update the version in the source (in the version function)
source = source.replace(/'version'\s*:\s*"[^"]*"/, `'version'   : "${version}"`);

// Write back the updated source
fs.writeFileSync(path.join(__dirname, '../src/jado.js'), source);
console.log(`✓ Updated version to ${version} in source`);

// Extract the core code (between the UMD wrapper)
// The core starts after the factory function begins and ends before the return
const coreStart = source.indexOf('"use strict";');
const coreEnd = source.lastIndexOf('return jado;');
const coreCode = source.substring(coreStart, coreEnd + 'return jado;'.length);

// Create ESM version
const esmVersion = `/**
 * jado.js - ESM Module
 * A small library for treating any javascript objects as iterables
 * @author M A Chatterjee <deftio [at] deftio [dot] com>
 * @license BSD-2-Clause
 */

${coreCode.replace('return jado;', 'export default jado;\nexport { jado };')}
`;

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.mkdirSync(path.join(__dirname, '../dist'));
}

// Write the ESM version
fs.writeFileSync(path.join(__dirname, '../dist/jado.esm.js'), esmVersion);
console.log('✓ Created dist/jado.esm.js');

// Copy the UMD version to dist
fs.copyFileSync(
    path.join(__dirname, '../src/jado.js'),
    path.join(__dirname, '../dist/jado.umd.js')
);
console.log('✓ Created dist/jado.umd.js');

// Create minified versions using uglify-js
try {
    execSync('npx uglifyjs dist/jado.umd.js -o dist/jado.umd.min.js');
    console.log('✓ Created dist/jado.umd.min.js');
    
    execSync('npx uglifyjs dist/jado.esm.js -o dist/jado.esm.min.js');
    console.log('✓ Created dist/jado.esm.min.js');
} catch (e) {
    console.log('⚠ Could not create minified versions (uglify-js may not be installed)');
}

// No longer copying to root - everything lives in dist/ now

console.log('\nBuild complete!');