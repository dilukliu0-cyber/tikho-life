const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let xcodeVersion = '';
try {
  xcodeVersion = execSync('xcodebuild -version', { encoding: 'utf8' });
  console.log('[patch] Current xcodebuild version:\n' + xcodeVersion);
} catch (e) {}

const isXcode162OrOlder =
  xcodeVersion.includes('Xcode 16.2') ||
  xcodeVersion.includes('Xcode 16.1') ||
  xcodeVersion.includes('Xcode 16.0');

function patchPackageSwift(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  if (isXcode162OrOlder) {
    content = content.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.0');
    content = content.replace(/602\.0\.0-latest/g, '600.0.0');
    content = content.replace(/,(\s*\))/g, '$1');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch] Successfully patched Package.swift: ${filePath}`);
  }
}

function patchRuntimeScheduler() {
  const filePath = path.join(
    'node_modules',
    'expo-modules-jsi',
    'apple',
    'Sources',
    'ExpoModulesJSI-Cxx',
    'include',
    'RuntimeScheduler.h'
  );
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // In C++, constructors cannot have return attributes like SWIFT_RETURNS_RETAINED
  content = content.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch] Successfully patched RuntimeScheduler.h`);
  }
}

function patchSwiftFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      patchSwiftFiles(full);
    } else if (item.name.endsWith('.swift')) {
      let content = fs.readFileSync(full, 'utf8');
      const original = content;

      // Fix `weak let` -> `weak var` across all Swift files (weak variables must always be var)
      content = content.replace(/\bweak\s+let\b/g, 'weak var');

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`[patch] Fixed weak let in: ${item.name}`);
      }
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== '.git') walk(full);
    } else if (item.name === 'Package.swift') {
      patchPackageSwift(full);
    }
  }
}

walk('node_modules');
patchRuntimeScheduler();
patchSwiftFiles(path.join('node_modules', 'expo-modules-jsi'));
console.log('[patch] All compatibility patches successfully applied.');
