const fs = require('fs');
const path = require('path');

function patchPackageSwift(filePath) {
  if (!fs.existsSync(filePath)) return;
  let c = fs.readFileSync(filePath, 'utf8');
  const o = c;
  c = c.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.1');
  c = c.replace(/602\.0\.0-latest/g, '600.0.0');
  c = c.replace(/,(\s*\))/g, '$1');
  if (c !== o) { fs.writeFileSync(filePath, c, 'utf8'); console.log('[patch] Package.swift:', filePath); }
}

function patchRuntimeScheduler() {
  const f = path.join('node_modules','expo-modules-jsi','apple','Sources','ExpoModulesJSI-Cxx','include','RuntimeScheduler.h');
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  const o = c;
  c = c.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');
  if (c !== o) { fs.writeFileSync(f, c, 'utf8'); console.log('[patch] RuntimeScheduler.h'); }
}

function patchSwift(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) { patchSwift(full); continue; }
    if (!item.name.endsWith('.swift')) continue;
    let c = fs.readFileSync(full, 'utf8');
    const o = c;

    // Swift 6.2 allows `weak let`, Swift 6.1 does not.
    // But `weak var` in a Sendable class is also an error in strict concurrency.
    // Fix: replace `weak let` with `nonisolated(unsafe) weak var`
    c = c.replace(/\bweak\s+let\b/g, 'nonisolated(unsafe) weak var');

    // Also fix any already-patched `weak var` that's in a Sendable class (from previous runs)
    // by adding nonisolated(unsafe) if not already there
    c = c.replace(/(?<!nonisolated\(unsafe\)\s)weak\s+var\s+(runtime\b)/g, 'nonisolated(unsafe) weak var $1');

    // trailing commas before ) in function/closure type signatures
    c = c.replace(/,(\s*\)\s*(?:async\s+)?(?:throws(?:\([^)]*\))?\s+)?->)/g, '$1');

    if (c !== o) { fs.writeFileSync(full, c, 'utf8'); console.log('[patch] Swift:', item.name); }
  }
}

function walkPkg(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== '.git') walkPkg(full);
    else if (item.name === 'Package.swift') patchPackageSwift(full);
  }
}

for (const root of ['node_modules', 'ios/Pods']) { walkPkg(root); }
patchRuntimeScheduler();
patchSwift(path.join('node_modules', 'expo-modules-jsi'));
const podsJsi = path.join('ios', 'Pods', 'ExpoModulesJSI');
if (fs.existsSync(podsJsi)) patchSwift(podsJsi);
console.log('[patch] Done.');
