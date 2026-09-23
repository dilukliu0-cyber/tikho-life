const fs = require('fs');
const path = require('path');

function patchPackageSwift(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Swift tools version & swift-syntax
  content = content.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.0');
  content = content.replace(/602\.0\.0-latest/g, '600.0.0');

  // 2. Remove trailing commas before closing parentheses
  content = content.replace(/,(\s*\))/g, '$1');

  // 3. Enable NonescapableTypes if not present
  if (content.includes('NonisolatedNonsendingByDefault') && !content.includes('NonescapableTypes')) {
    content = content.replace(
      '.enableUpcomingFeature("NonisolatedNonsendingByDefault"),',
      '.enableUpcomingFeature("NonisolatedNonsendingByDefault"),\n        .enableExperimentalFeature("NonescapableTypes"),'
    );
  }

  // 4. Disable library evolution flags that break C++ interop on Xcode 16.2
  content = content.replace(/"-enable-library-evolution",\s*/g, '');
  content = content.replace(/"-emit-module-interface",\s*/g, '');
  content = content.replace(/"-no-verify-emitted-module-interface",\s*/g, '');

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

  content = content.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler/g, 'RuntimeScheduler');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch] Successfully patched RuntimeScheduler.h`);
  }
}

function patchBuildXcframework() {
  const filePath = path.join(
    'node_modules',
    'expo-modules-jsi',
    'apple',
    'scripts',
    'build-xcframework.sh'
  );
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/BUILD_LIBRARY_FOR_DISTRIBUTION=YES/g, 'BUILD_LIBRARY_FOR_DISTRIBUTION=NO');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch] Successfully patched build-xcframework.sh`);
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

      // 1. Fix weak let -> weak var
      content = content.replace(/\bweak\s+let\b/g, 'weak var');

      // 2. Fix trailing comma in JavaScriptRuntime.swift
      if (item.name === 'JavaScriptRuntime.swift') {
        content = content.replace(
          /(_ arguments:\s*consuming\s*JavaScriptValuesBuffer),(\s*\)\s*async\s*throws)/g,
          '$1$2'
        );
      }

      // 3. Fix JavaScriptActor runIsolated isolation
      if (item.name === 'JavaScriptActor.swift') {
        content = content.replace(
          /@JavaScriptActor\s+@usableFromInline\s+internal\s+static\s+func\s+runIsolated/g,
          '@usableFromInline\n  internal static func runIsolated'
        );
      }

      // 4. Fix CppError extension in JavaScriptError.swift
      if (item.name === 'JavaScriptError.swift') {
        content = content.replace(
          /(extension\s+expo\.CppError:\s*Error\s*\{[\s\S]*?)public\s+(var\s+message:\s*String)/g,
          '$1$2'
        );
      }

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`[patch] Successfully patched Swift file: ${item.name}`);
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
patchBuildXcframework();
patchSwiftFiles(path.join('node_modules', 'expo-modules-jsi'));
console.log('[patch] All compatibility patches successfully applied.');
