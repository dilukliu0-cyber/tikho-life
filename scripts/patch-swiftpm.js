const fs = require('fs');
const path = require('path');

// Patch Package.swift: swift-tools-version 6.2 -> 6.1, swift-syntax version, trailing commas
function patchPackageSwift(filePath) {
  if (!fs.existsSync(filePath)) return;
  let c = fs.readFileSync(filePath, 'utf8');
  const o = c;
  c = c.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.1');
  c = c.replace(/602\.0\.0-latest/g, '600.0.0');
  c = c.replace(/,(\s*\))/g, '$1');
  if (c !== o) { fs.writeFileSync(filePath, c, 'utf8'); console.log('[patch] Package.swift:', filePath); }
}

// Patch RuntimeScheduler.h: remove SWIFT_RETURNS_RETAINED from constructors
function patchRuntimeScheduler() {
  const f = path.join('node_modules','expo-modules-jsi','apple','Sources','ExpoModulesJSI-Cxx','include','RuntimeScheduler.h');
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  const o = c;
  c = c.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');
  if (c !== o) { fs.writeFileSync(f, c, 'utf8'); console.log('[patch] RuntimeScheduler.h'); }
}

// Patch all .swift files in expo-modules-jsi: weak let -> weak var, trailing commas in closures
function patchSwift(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) { patchSwift(full); continue; }
    if (!item.name.endsWith('.swift')) continue;
    let c = fs.readFileSync(full, 'utf8');
    const o = c;
    // weak let -> weak var (Swift 6.2 allows weak let, 6.1 does not)
    c = c.replace(/\bweak\s+let\b/g, 'weak var');
    // trailing commas before ) in function signatures
    c = c.replace(/,(\s*\)\s*(?:async\s+)?(?:throws(?:\([^)]*\))?\s+)?->)/g, '$1');
    if (c !== o) { fs.writeFileSync(full, c, 'utf8'); console.log('[patch] Swift:', item.name); }
  }
}

// Walk all node_modules for Package.swift
function walkPkg(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== '.git') walkPkg(full);
    else if (item.name === 'Package.swift') patchPackageSwift(full);
  }
}

// Also patch inside ios/Pods if it exists
for (const root of ['node_modules', 'ios/Pods']) {
  walkPkg(root);
}
patchRuntimeScheduler();
patchSwift(path.join('node_modules', 'expo-modules-jsi'));

// Also patch ios/Pods copy if it exists
const podsJsi = path.join('ios', 'Pods', 'ExpoModulesJSI');
if (fs.existsSync(podsJsi)) patchSwift(podsJsi);

console.log('[patch] Done.');
