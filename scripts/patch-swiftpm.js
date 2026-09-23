const fs = require('fs');
const path = require('path');

function patchPackageSwift(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Lower swift-tools-version to 6.0 for Xcode 16.2
  content = content.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.0');

  // 2. Adjust swift-syntax version requirement if present
  content = content.replace(/602\.0\.0-latest/g, '600.0.0');

  // 3. Remove trailing commas before closing parentheses in function argument lists
  content = content.replace(/,(\s*\))/g, '$1');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch] Successfully patched: ${filePath}`);
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

  // Remove invalid SWIFT_RETURNS_RETAINED attribute from C++ constructors
  content = content.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch] Successfully patched RuntimeScheduler.h`);
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
console.log('[patch] All patches applied.');
