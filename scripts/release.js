#!/usr/bin/env node

/**
 * Release script for Mr. Taps
 *
 * Updates version numbers across all files:
 * - package.json
 * - public/version.json
 * - public/sw.js (cache name)
 *
 * Usage:
 *   npm run release <version>
 *   npm run release 2026.01.28-5
 *
 * The script will:
 * 1. Validate the version format
 * 2. Update all version references
 * 3. Increment the service worker cache version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// File paths
const PACKAGE_JSON = path.join(rootDir, 'package.json');
const VERSION_JSON = path.join(rootDir, 'public', 'version.json');
const SW_JS = path.join(rootDir, 'public', 'sw.js');

// Get version from command line
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: npm run release <version>');
  console.error('Example: npm run release 2026.01.28-5');
  process.exit(1);
}

// Validate version format (YYYY.MM.DD-N)
const versionRegex = /^\d{4}\.\d{2}\.\d{2}-\d+$/;
if (!versionRegex.test(newVersion)) {
  console.error(`Invalid version format: ${newVersion}`);
  console.error('Expected format: YYYY.MM.DD-N (e.g., 2026.01.28-5)');
  process.exit(1);
}

console.log(`Releasing version ${newVersion}...\n`);

// Update package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json: ${oldVersion} -> ${newVersion}`);
} catch (err) {
  console.error(`Failed to update package.json: ${err.message}`);
  process.exit(1);
}

// Update version.json
try {
  const versionJson = { version: newVersion };
  fs.writeFileSync(VERSION_JSON, JSON.stringify(versionJson, null, 2) + '\n');
  console.log(`Updated public/version.json: ${newVersion}`);
} catch (err) {
  console.error(`Failed to update version.json: ${err.message}`);
  process.exit(1);
}

// Update sw.js cache name
try {
  let swContent = fs.readFileSync(SW_JS, 'utf8');
  const cacheMatch = swContent.match(/const CACHE_NAME = 'mr-taps-v(\d+)'/);

  if (cacheMatch) {
    const oldCacheVersion = parseInt(cacheMatch[1], 10);
    const newCacheVersion = oldCacheVersion + 1;
    swContent = swContent.replace(
      /const CACHE_NAME = 'mr-taps-v\d+'/,
      `const CACHE_NAME = 'mr-taps-v${newCacheVersion}'`
    );
    fs.writeFileSync(SW_JS, swContent);
    console.log(`Updated public/sw.js cache: v${oldCacheVersion} -> v${newCacheVersion}`);
  } else {
    console.warn('Warning: Could not find CACHE_NAME in sw.js');
  }
} catch (err) {
  console.error(`Failed to update sw.js: ${err.message}`);
  process.exit(1);
}

console.log(`\nRelease ${newVersion} prepared successfully!`);
console.log('\nNext steps:');
console.log('1. Update public/CHANGELOG.md with release notes');
console.log('2. Run: npm test');
console.log('3. Commit: git add -A && git commit -m "Release ' + newVersion + '"');
console.log('4. Tag: git tag v' + newVersion);
