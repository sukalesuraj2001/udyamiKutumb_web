const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
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

function resolveWithCase(basePath, importPath) {
  const resolved = path.resolve(path.dirname(basePath), importPath);
  const dir = path.dirname(resolved);
  const base = path.basename(resolved);

  if (!fs.existsSync(dir)) return { ok: false, reason: 'dir-missing' };

  const candidates = fs.readdirSync(dir);
  const exactMatch = candidates.find(c => c === base || c.startsWith(base + '.'));
  if (exactMatch) return { ok: true };

  const caseInsensitiveMatch = candidates.find(
    c => c.toLowerCase() === base.toLowerCase() || c.toLowerCase().startsWith(base.toLowerCase() + '.')
  );
  if (caseInsensitiveMatch) {
    return { ok: false, reason: 'case-mismatch', actual: caseInsensitiveMatch };
  }

  return { ok: false, reason: 'not-found' };
}

let issues = 0;

walk(SRC_DIR, file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const result = resolveWithCase(file, importPath);
    if (!result.ok && result.reason === 'case-mismatch') {
      issues++;
      console.log(`❌ CASE MISMATCH in ${path.relative(__dirname, file)}`);
      console.log(`   import: "${importPath}"`);
      console.log(`   actual: "${result.actual}"`);
      console.log('');
    }
  }
});

console.log(`\nDone. Found ${issues} case mismatch(es).`);