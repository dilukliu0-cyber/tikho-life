const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
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
    console.log(`[patch-swiftpm] Successfully patched: ${filePath}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full);
    } else if (item.name === 'Package.swift') {
      patchFile(full);
    }
  }
}

walk('node_modules');
console.log('[patch-swiftpm] Scan complete.');
