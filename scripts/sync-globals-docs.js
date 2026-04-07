/**
 * Syncs globals.d.ts with Autodesk CAM Post Processor reference.
 * Updates JSDoc descriptions and adds @see URLs from reference HTML pages.
 * Replaces any-typed class member signatures with properly typed ones.
 *
 * Usage: node sync-globals-docs.js [output-path-to-globals.d.ts] [source-path-to-globals.d.ts]
 * Default output: workspace vs-code-extension/res/language files/globals.d.ts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const REFERENCE_BASE_URL = 'https://cam.autodesk.com/posts/reference';
const GLOBALS_REF_URL = `${REFERENCE_BASE_URL}/classPostProcessor.html`;
const ANNOTATED_URL = `${REFERENCE_BASE_URL}/annotated.html`;
const EXTENSION_DIR_PREFIX = 'autodesk.hsm-post-processor-';
const WORKSPACE_GLOBALS_PATH = path.resolve(
  __dirname, '..', 'vs-code-extension', 'res', 'language files', 'globals.d.ts'
);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 25000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<a\s+[^>]*class="el"[^>]*>([^<]*)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'");
}

function sanitizeDocText(text) {
  if (!text) return '';
  return text.replace(/\*\//g, '* /').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Type mapping (Autodesk reference types -> TypeScript)
// ---------------------------------------------------------------------------

function mapType(typeName) {
  const t = decodeEntities(typeName || '').trim();
  if (!t) return 'void';
  const map = {
    Boolean: 'boolean', Number: 'number', Integer: 'number',
    String: 'string', Object: 'any', Value: 'any', Map: 'any',
    Array: 'any[]', ArrayBuffer: 'ArrayBuffer', Function: 'Function',
    void: 'void', Format: 'FormatNumber'
  };
  if (map[t]) return map[t];
  if (t.includes('::')) return 'number';
  if (t.endsWith('[]')) return `${mapType(t.slice(0, -2))}[]`;
  return t;
}

// ---------------------------------------------------------------------------
// Source globals.d.ts path resolution
// ---------------------------------------------------------------------------

function resolveInstalledGlobalsPath() {
  const home = process.env.USERPROFILE || process.env.HOME;
  if (!home) return null;
  const extDir = path.join(home, '.cursor', 'extensions');
  if (!fs.existsSync(extDir)) return null;

  const candidates = fs.readdirSync(extDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(EXTENSION_DIR_PREFIX))
    .map((e) => ({
      version: e.name.slice(EXTENSION_DIR_PREFIX.length),
      path: path.join(extDir, e.name, 'res', 'language files', 'globals.d.ts')
    }))
    .filter((e) => e.version)
    .sort((a, b) => {
      const ap = a.version.split('.').map(Number);
      const bp = b.version.split('.').map(Number);
      for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
        if ((bp[i] || 0) !== (ap[i] || 0)) return (bp[i] || 0) - (ap[i] || 0);
      }
      return 0;
    });

  for (const c of candidates) {
    if (fs.existsSync(c.path)) return c.path;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Doxygen HTML parsing helpers
// ---------------------------------------------------------------------------

/** Find the closing </div> for a memdoc div, tracking nesting depth. */
function findMemdocEnd(html, contentStart) {
  let depth = 1, pos = contentStart;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) return -1;
    if (nextOpen === -1 || nextClose < nextOpen) {
      depth--;
      if (depth === 0) return nextClose;
      pos = nextClose + 6;
    } else {
      depth++;
      pos = nextOpen + 4;
    }
  }
  return -1;
}

/** Extract description text from a memdoc div's HTML content. */
function parseMemdoc(html) {
  const parts = [];
  const pRe = /<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pRe.exec(html)) !== null) parts.push(stripHtml(m[1]));
  const retMatch = html.match(/<dl\s+class="section return"[^>]*>[\s\S]*?<dd>([\s\S]*?)<\/dd>/i);
  if (retMatch) parts.push('Returns ' + stripHtml(retMatch[1]).replace(/^Returns\s+/i, ''));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Parse classPostProcessor.html (global symbols)
// ---------------------------------------------------------------------------

function parseGlobalsReference(html) {
  const map = new Map();

  // Detailed member documentation: <a ... id="HEX"> ... <h2 class="memtitle">...name...</h2> ... memdoc
  const detailRe = /<a\s+(?:class="anchor"\s+)?id="([a-f0-9]+)"[^>]*><\/a>\s*[\s\S]*?<h2\s+class="memtitle"[^>]*>[\s\S]*?<\/span>\s*([a-zA-Z0-9_]+)\s*(?:\([^)]*\))?\s*<\/h2>/g;
  let match;
  while ((match = detailRe.exec(html)) !== null) {
    const anchor = match[1];
    const name = match[2];
    const after = html.slice(match.index + match[0].length);
    const mdStart = after.indexOf('<div class="memdoc">');
    if (mdStart === -1) continue;
    const cStart = mdStart + 20;
    let cEnd = findMemdocEnd(after, cStart);
    if (cEnd === -1) cEnd = after.indexOf('</div>', cStart);
    const desc = cEnd === -1 ? '' : parseMemdoc(after.slice(cStart, cEnd));
    if (!name || !anchor) continue;
    const existing = map.get(name);
    if (!existing || !existing.description || existing.description === name + '().') {
      map.set(name, { anchor, description: desc || (existing && existing.description) || '' });
    }
  }

  // Summary table fallback: pick up any members the detail regex missed
  const tableRe = /href="classPostProcessor\.html#([a-f0-9]+)"[^>]*>([a-zA-Z0-9_]+)<\/a>/g;
  while ((match = tableRe.exec(html)) !== null) {
    if (!map.has(match[2])) map.set(match[2], { anchor: match[1], description: '' });
  }

  return map;
}

// ---------------------------------------------------------------------------
// Parse a class reference page (e.g. classVector.html)
// ---------------------------------------------------------------------------

function parseClassPage(html) {
  const members = new Map();

  // Step 1: Parse summary table rows for signatures + anchors.
  // The <tr class="memitem:HEX"> attribute contains the correct URL anchor.
  const rowRe = /<tr class="memitem:([a-f0-9]+)"[^>]*>([\s\S]*?)<\/tr>/g;
  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const rowAnchor = rm[1];
    const rowHtml = rm[2];

    const leftTd = rowHtml.match(/<td class="memItemLeft"[^>]*>([\s\S]*?)<\/td>/);
    const rightTd = rowHtml.match(/<td class="memItemRight"[^>]*>([\s\S]*?)<\/td>/);
    if (!rightTd) continue;

    // Return type from left td
    const rawReturn = leftTd ? extractLinkedTypeName(leftTd[1]) : '';
    const returnType = mapType(rawReturn);

    // Member name: first <a class="el"> in right td, before any '('
    const rightHtml = rightTd[1];
    const nameMatch = rightHtml.match(/<a class="el"[^>]*>([A-Za-z0-9_]+)<\/a>/);
    if (!nameMatch) continue;
    const memberName = nameMatch[1];

    // Parameters: everything between first '(' and last ')' after the name link
    const nameEnd = rightHtml.indexOf(nameMatch[0]) + nameMatch[0].length;
    const afterName = rightHtml.slice(nameEnd).trim();
    const hasParams = afterName.startsWith('(');
    const kind = hasParams ? 'method' : 'property';

    let parameters = [];
    if (hasParams) {
      const closeIdx = afterName.lastIndexOf(')');
      if (closeIdx > 0) {
        parameters = parseParameterList(afterName.slice(1, closeIdx));
      }
    }

    const declaration = kind === 'method'
      ? buildSignature(memberName, parameters, returnType)
      : `${memberName}: ${returnType};`;

    if (!members.has(memberName)) {
      members.set(memberName, {
        anchor: rowAnchor, description: '',
        kind, parameters, returnType, declaration
      });
    }
  }

  // Step 2: Parse detailed documentation for descriptions.
  const detailRe = /<a\s+(?:class="anchor"\s+)?id="([a-f0-9]+)"[^>]*><\/a>\s*[\s\S]*?<h2\s+class="memtitle"[^>]*>[\s\S]*?<\/span>\s*([a-zA-Z0-9_]+)\s*(?:\([^)]*\))?\s*<\/h2>/g;
  let dm;
  while ((dm = detailRe.exec(html)) !== null) {
    const anchor = dm[1];
    const name = dm[2];
    const after = html.slice(dm.index + dm[0].length);
    const mdStart = after.indexOf('<div class="memdoc">');
    if (mdStart === -1) continue;
    const cStart = mdStart + 20;
    let cEnd = findMemdocEnd(after, cStart);
    if (cEnd === -1) cEnd = after.indexOf('</div>', cStart);
    const desc = cEnd === -1 ? '' : parseMemdoc(after.slice(cStart, cEnd));

    const existing = members.get(name);
    if (existing) {
      // Update description but keep the summary table anchor
      if (desc && !existing.description) existing.description = desc;
    } else {
      members.set(name, {
        anchor, description: desc, kind: 'property',
        parameters: [], returnType: 'any', declaration: `${name}: any;`
      });
    }
  }

  return members;
}

/** Extract a type name from an HTML fragment (memItemLeft td). */
function extractLinkedTypeName(fragment) {
  if (!fragment) return '';
  const linkMatch = fragment.match(/<a[^>]*class="el"[^>]*>([^<]+)<\/a>/);
  if (linkMatch) return decodeEntities(linkMatch[1]).trim();
  return stripHtml(fragment);
}

/** Parse parameter HTML into [{name, type}]. */
function parseParameterList(paramHtml) {
  const cleaned = decodeEntities(paramHtml || '').trim();
  if (!cleaned) return [];

  return cleaned.split(/\s*,\s*/).map((chunk, idx) => {
    // Linked type: <a ... href="classType.html">Type</a> paramName
    // Sometimes param names also have links: <a href="...#xxx">paramName</a>
    const stripped = stripHtml(chunk);
    const parts = stripped.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return {
        type: mapType(parts.slice(0, -1).join(' ')),
        name: parts[parts.length - 1]
      };
    }
    if (parts.length === 1 && /^[A-Z]/.test(parts[0])) {
      return { type: mapType(parts[0]), name: `arg${idx + 1}` };
    }
    return { type: 'any', name: parts[0] || `arg${idx + 1}` };
  });
}

function buildSignature(name, parameters, returnType) {
  const params = parameters.map((p) => `${p.name}: ${p.type}`).join(', ');
  return `${name}(${params}): ${returnType};`;
}

// ---------------------------------------------------------------------------
// Fetch all reference class names from annotated.html
// ---------------------------------------------------------------------------

async function fetchAnnotatedClassNames() {
  const html = await fetchUrl(ANNOTATED_URL);
  const re = /class([A-Z]\w+)\.html/g;
  const names = new Set();
  let m;
  while ((m = re.exec(html)) !== null) names.add(m[1]);
  return names;
}

// ---------------------------------------------------------------------------
// Build class member reference map: "ClassName.memberName" -> ref data
// ---------------------------------------------------------------------------

async function buildClassMemberMap(classNames, annotatedNames) {
  const result = new Map();
  const unique = [...new Set(classNames)];
  const BATCH = 12;

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const fetched = await Promise.all(batch.map(async (cls) => {
      if (!annotatedNames.has(cls)) return null;
      const url = `${REFERENCE_BASE_URL}/class${cls}.html`;
      try {
        const html = await fetchUrl(url);
        return { cls, url, members: parseClassPage(html) };
      } catch {
        return null;
      }
    }));

    for (const entry of fetched) {
      if (!entry) continue;
      for (const [name, val] of entry.members) {
        result.set(`${entry.cls}.${name}`, { ...val, url: entry.url });
      }
    }

    const done = Math.min(i + batch.length, unique.length);
    console.log(`  Class pages: ${done} / ${unique.length}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// JSDoc generation
// ---------------------------------------------------------------------------

function makeJSDoc(description, seeUrl, indent) {
  const safe = sanitizeDocText(description);
  const seeLine = `${indent} * @see ${seeUrl} */`;
  if (!safe) return [`${indent}/**`, seeLine];
  return [`${indent}/** ${safe}`, seeLine];
}

// ---------------------------------------------------------------------------
// Transform globals.d.ts lines
// ---------------------------------------------------------------------------

/** Enrich JSDoc for top-level `declare function/var` symbols. */
function enrichGlobalSymbols(lines, refMap) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith('/**')) {
      const blockStart = i;
      let blockEnd = i;
      i++;
      while (i < lines.length) {
        if (lines[i].trim().endsWith('*/')) { blockEnd = i; i++; break; }
        i++;
      }

      const nextLine = lines[i];
      const sym = nextLine ? getDeclareSymbol(nextLine) : null;

      if (sym && refMap.has(sym)) {
        const { anchor, description } = refMap.get(sym);
        for (const l of makeJSDoc(description, `${GLOBALS_REF_URL}#${anchor}`, '')) out.push(l);
        out.push(nextLine);
        i++;
      } else {
        for (let j = blockStart; j <= blockEnd; j++) out.push(lines[j]);
        if (nextLine !== undefined) { out.push(nextLine); i++; }
      }
      continue;
    }

    out.push(lines[i]);
    i++;
  }

  return out;
}

function getDeclareSymbol(line) {
  const m = line.match(/declare\s+(?:function|var)\s+([a-zA-Z0-9_]+)\s*[:(<]/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Rewrite class members: fix signatures, rewrite JSDoc, add missing members
// ---------------------------------------------------------------------------

function rewriteClassMembers(lines, classRefMap) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const classMatch = lines[i].match(/^\s*declare\s+class\s+([A-Za-z0-9_]+)\s*\{/);
    if (!classMatch) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const className = classMatch[1];

    // Collect all lines belonging to this class
    const classLines = [lines[i]];
    i++;
    let depth = 1;
    while (i < lines.length && depth > 0) {
      classLines.push(lines[i]);
      depth += (lines[i].match(/\{/g) || []).length;
      depth -= (lines[i].match(/\}/g) || []).length;
      i++;
    }

    // Build ref lookup for this class
    const refs = new Map();
    for (const [key, ref] of classRefMap) {
      if (key.startsWith(className + '.')) {
        refs.set(key.slice(className.length + 1), ref);
      }
    }

    // Process class lines: rewrite signatures and JSDoc
    const seenMembers = new Set();
    const processed = [];

    for (let k = 0; k < classLines.length; k++) {
      const memberMatch = classLines[k].match(/^\s*(?:static\s+)?([a-zA-Z0-9_]+)\s*(?:\(|:)/);
      if (!memberMatch || memberMatch[1] === 'constructor' || k === 0 || k === classLines.length - 1) {
        processed.push(classLines[k]);
        continue;
      }

      const memberName = memberMatch[1];
      seenMembers.add(memberName);
      const ref = refs.get(memberName);

      if (!ref) {
        processed.push(classLines[k]);
        continue;
      }

      // Rewrite any-typed signature
      let memberLine = classLines[k];
      if (ref.declaration) {
        if (/\(\.\.\.\w+:\s*any\[\]\):\s*any;/.test(memberLine) || /^\s*\S+:\s*any;\s*$/.test(memberLine)) {
          memberLine = memberLine.match(/^\s*/)[0] + ref.declaration;
        }
      }

      // Replace preceding JSDoc block
      let jsdocStart = -1;
      for (let j = processed.length - 1; j >= 0; j--) {
        const t = processed[j].trim();
        if (t.startsWith('/**') || t.startsWith('*') || t.endsWith('*/')) {
          jsdocStart = j;
          if (t.startsWith('/**')) break;
        } else {
          break;
        }
      }

      if (jsdocStart >= 0 && ref.anchor && ref.url) {
        processed.splice(jsdocStart);
        const indent = memberLine.match(/^\s*/)[0] || '  ';
        for (const docLine of makeJSDoc(ref.description, `${ref.url}#${ref.anchor}`, indent)) {
          processed.push(docLine);
        }
      }

      processed.push(memberLine);
    }

    // Append missing members before closing brace
    const closingBrace = processed.pop();
    const missing = [...refs.entries()]
      .filter(([name]) => !seenMembers.has(name))
      .sort(([a], [b]) => a.localeCompare(b));

    for (const [, ref] of missing) {
      for (const docLine of makeJSDoc(ref.description, `${ref.url}#${ref.anchor}`, '  ')) {
        processed.push(docLine);
      }
      processed.push(`  ${ref.declaration}`);
    }
    processed.push(closingBrace);

    for (const line of processed) out.push(line);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Extract declared class names from source
// ---------------------------------------------------------------------------

function extractDeclaredClassNames(lines) {
  const names = [];
  for (const line of lines) {
    const m = line.match(/^\s*declare\s+class\s+([a-zA-Z0-9_]+)/);
    if (m) names.push(m[1]);
  }
  return names;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const outputPath = process.argv[2] || WORKSPACE_GLOBALS_PATH;
  const sourcePath = process.argv[3] || resolveInstalledGlobalsPath();

  if (!sourcePath || !fs.existsSync(sourcePath)) {
    console.error('Source globals not found. Provide as arg #2:');
    console.error('  node sync-globals-docs.js [output] [source]');
    process.exit(1);
  }
  if (!fs.existsSync(path.dirname(outputPath))) {
    console.error('Output folder not found:', path.dirname(outputPath));
    process.exit(1);
  }

  console.log('Fetching reference data...');
  const [globalsHtml, annotatedNames] = await Promise.all([
    fetchUrl(GLOBALS_REF_URL),
    fetchAnnotatedClassNames()
  ]);

  console.log('Parsing globals reference...');
  const globalsRef = parseGlobalsReference(globalsHtml);
  console.log(`  Global symbols: ${globalsRef.size}`);
  console.log(`  Annotated classes: ${annotatedNames.size}`);

  const source = fs.readFileSync(sourcePath, 'utf8');
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  let lines = source.split(/\r?\n/);

  const classNames = extractDeclaredClassNames(lines);
  console.log('Fetching class reference pages...');
  const classRefMap = await buildClassMemberMap(classNames, annotatedNames);
  console.log(`  Class member references: ${classRefMap.size}`);

  lines = enrichGlobalSymbols(lines, globalsRef);
  lines = rewriteClassMembers(lines, classRefMap);

  fs.writeFileSync(outputPath, lines.join(eol), 'utf8');
  console.log(`Rebuilt ${outputPath}`);
  console.log(`  from ${sourcePath}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
