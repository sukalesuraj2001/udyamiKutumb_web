/**
 * check-case-sensitivity.js
 *
 * Scans your src/ folder for relative imports and checks whether the
 * imported path's CASING exactly matches the actual file on disk.
 * This catches bugs that work on Windows/macOS (case-insensitive FS)
 * but fail on Render/Linux (case-sensitive FS).
 *
 * Usage:
 *   node check-case-sensitivity.js
 *
 * Run this from your project ROOT (same level as package.json).
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const VALID_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const IMPORT_REGEX = /(?:import|require)\s*(?:[^'"]*from\s*)?['"](\.[^'"]+)['"]/g;

let issuesFound = 0;

function getAllFiles(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        if (entry.isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else if (VALID_EXTENSIONS.includes(path.extname(entry.name))) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function resolveWithRealCasing(basedir, importPath) {
    // Try resolving with each valid extension (and no extension, and /index.*)
    const candidates = [];
    if (path.extname(importPath)) {
        candidates.push(importPath);
    } else {
        for (const ext of VALID_EXTENSIONS) {
            candidates.push(importPath + ext);
        }
        for (const ext of VALID_EXTENSIONS) {
            candidates.push(path.join(importPath, 'index' + ext));
        }
    }

    for (const candidate of candidates) {
        const absPath = path.resolve(basedir, candidate);
        const dir = path.dirname(absPath);
        const base = path.basename(absPath);

        if (!fs.existsSync(dir)) continue;

        const actualEntries = fs.readdirSync(dir);
        const exactMatch = actualEntries.includes(base);
        const caseInsensitiveMatch = actualEntries.find(
            (e) => e.toLowerCase() === base.toLowerCase(),
        );

        if (exactMatch) {
            return { found: true, mismatch: false };
        }
        if (caseInsensitiveMatch) {
            return {
                found: true,
                mismatch: true,
                actual: caseInsensitiveMatch,
                imported: base,
                dir,
            };
        }
    }
    return { found: false, mismatch: false };
}

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const basedir = path.dirname(filePath);
    let match;

    IMPORT_REGEX.lastIndex = 0;
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
        const importPath = match[1];
        const result = resolveWithRealCasing(basedir, importPath);

        if (result.mismatch) {
            issuesFound++;
            console.log('❌ CASE MISMATCH');
            console.log(`   File:     ${path.relative(process.cwd(), filePath)}`);
            console.log(`   Imported: "${importPath}" (expects "${result.imported}")`);
            console.log(`   Actual:   "${result.actual}" in ${path.relative(process.cwd(), result.dir)}`);
            console.log('');
        } else if (!result.found) {
            console.log('⚠️  COULD NOT RESOLVE (check path depth / typo)');
            console.log(`   File:     ${path.relative(process.cwd(), filePath)}`);
            console.log(`   Imported: "${importPath}"`);
            console.log('');
        }
    }
}

console.log(`Scanning ${SRC_DIR} for case-sensitivity issues...\n`);

if (!fs.existsSync(SRC_DIR)) {
    console.error(`No "src" directory found at ${SRC_DIR}. Run this from your project root.`);
    process.exit(1);
}

const allFiles = getAllFiles(SRC_DIR);
allFiles.forEach(scanFile);

console.log('----------------------------------------');
if (issuesFound === 0) {
    console.log('✅ No case-sensitivity mismatches found.');
} else {
    console.log(`Found ${issuesFound} case-sensitivity issue(s). Fix these before deploying to Render.`);
}
