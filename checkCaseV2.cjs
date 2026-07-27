const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const importRegex = /from\s+["'](\.\.?\/[^"']+)["']/g;

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      callback(fullPath);
    }
  });
}

// Walk the import path segment by segment, checking exact case at each level
function resolveSegmentsWithCase(startDir, importPath) {
  const segments = importPath.split('/').filter(s => s !== '.');
  let currentDir = startDir;
  const correctedSegments = [];

  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];

    if (seg === '..') {
      currentDir = path.dirname(currentDir);
      correctedSegments.push(seg);
      continue;
    }

    const isLast = i === segments.length - 1;

    if (!fs.existsSync(currentDir)) {
      return { ok: false, reason: 'dir-missing', atSegment: seg };
    }

    const candidates = fs.readdirSync(currentDir);

    if (isLast) {
      // Try exact match first (file may or may not include extension)
      const exact = candidates.find(c => c === seg || c.startsWith(seg + '.'));
      if (exact) {
        correctedSegments.push(seg);
        return { ok: true, corrected: correctedSegments.join('/') };
      }
      const ci = candidates.find(
        c => c.toLowerCase() === seg.toLowerCase() ||
             c.toLowerCase().startsWith(seg.toLowerCase() + '.')
      );
      if (ci) {
        correctedSegments.push(ci.replace(/\.(js|jsx|ts|tsx)$/, seg.match(/\.(js|jsx|ts|tsx)$/) ? RegExp.lastMatch : ''));
        return { ok: false, reason: 'case-mismatch', badSegment: seg, actualSegment: ci, corrected: correctedSegments.concat([]).join('/') };
      }
      return { ok: false, reason: 'not-found', atSegment: seg };
    } else {
      // Intermediate folder segment
      const exact = candidates.find(c => c === seg && fs.statSync(path.join(currentDir, c)).isDirectory());
      if (exact) {
        correctedSegments.push(seg);
        currentDir = path.join(currentDir, seg);
        continue;
      }
      const ci = candidates.find(
        c => c.toLowerCase() === seg.toLowerCase() && fs.statSync(path.join(currentDir, c)).isDirectory()
      );
      if (ci) {
        return { ok: false, reason: 'folder-case-mismatch', badSegment: seg, actualSegment: ci };
      }
      return { ok: false, reason: 'not-found', atSegment: seg };
    }
  }
  return { ok: true };
}

let issues = 0;

walk(SRC_DIR, file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const result = resolveSegmentsWithCase(path.dirname(file), importPath);
    if (!result.ok && (result.reason === 'case-mismatch' || result.reason === 'folder-case-mismatch')) {
      issues++;
      console.log(`❌ ${result.reason === 'folder-case-mismatch' ? 'FOLDER' : 'FILE'} CASE MISMATCH in ${path.relative(process.cwd(), file)}`);
      console.log(`   import segment: "${result.badSegment}"`);
      console.log(`   actual on disk:  "${result.actualSegment}"`);
      console.log(`   full import: "${importPath}"`);
      console.log('');
    } else if (!result.ok && result.reason === 'not-found') {
      console.log(`⚠️  NOT FOUND in ${path.relative(process.cwd(), file)}: "${importPath}" (segment "${result.atSegment}")`);
    }
  }
});

console.log(`\nDone. Found ${issues} case mismatch(es).`);
