// interpret(indexHtml, manifest[, {loaderSource}]) → the load plan for one TMT-family game.
//
// PURE: no DOM, no Node imports, no globals — the page (loader/page.js) and the Node harness
// (tools/harness/boot.mjs) both call it, so "the page and the harness make the same plan" is one code path.
//
// The script-order rules are the census's (PeerInfinity/tmt-fork-census lib/boot.mjs): the same <script> regex,
// `type=module` skipped, CDN vs relative normalisation, and a case-insensitive `loader.js` whose modFiles are
// loaded AFTER the last static script (a browser runs async=false inserted scripts after the parser's own; forks
// call `format()` at the top level of a mod file). What the page needs on top: stylesheets, the body markup and
// its attributes, inline scripts, and the manifest's `load.external` verdicts for every non-relative URL.

export class InterpretError extends Error {
  constructor(message) { super(message); this.name = 'InterpretError'; }
}

const ATTR_RE = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
/** Attributes of a tag's attribute text, lower-cased names, in source order. */
export function parseAttrs(text) {
  const out = {};
  for (const m of String(text || '').matchAll(ATTR_RE)) {
    const name = m[1].toLowerCase();
    if (!(name in out)) out[name] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

export const isExternal = (url) => /^(https?:)?\/\//i.test(url);

/** posix path normalise ('a/./b/../c' → 'a/c'), no Node import. */
export function normalizePath(p) {
  const parts = [];
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { if (parts.length && parts[parts.length - 1] !== '..') parts.pop(); else parts.push('..'); continue; }
    parts.push(seg);
  }
  return parts.join('/') || '.';
}
/** The census's relative-src rule: leading './' or '/' dropped, query/hash dropped, normalised. */
export const normalizeSrc = (src) => normalizePath(src.replace(/^\.?\//, '').replace(/[?#].*$/, ''));

export const LOADER_RE = /(^|\/)loader\.js$/i;
/** The directory prefix a loader.js puts in front of modInfo.modFiles (`"js/" + modInfo.modFiles[i]` in stock). */
export const loaderPrefixOf = (src) => (src && src.match(/["'`]([^"'`]*)["'`]\s*\+\s*modInfo\.modFiles\s*\[/) || [])[1] ?? null;

function externalVerdict(url, manifest) {
  const load = (manifest && manifest.load) || {};
  const verdict = (load.external || {})[url];
  if (!verdict) throw new InterpretError(`external URL not in manifest.load.external: ${url} (re-emit the manifest)`);
  if (verdict === 'drop') return { verdict };
  if (verdict === 'vendor') {
    const v = (load.vendor || {})[url];
    if (!v || !v.path) throw new InterpretError(`external URL is 'vendor' but manifest.load.vendor has no path: ${url}`);
    return { verdict, path: v.path, sha256: v.sha256 ?? null };
  }
  throw new InterpretError(`unknown load.external verdict '${verdict}' for ${url}`);
}

export function interpret(indexHtml, manifest, opts = {}) {
  const html = String(indexHtml);
  const load = (manifest && manifest.load) || {};
  const renderOnly = new Set(load.renderOnly || []);
  const plan = { id: manifest && manifest.id, title: null, links: [], scripts: [], onload: null, body: { html: '', attrs: {} }, dropped: [], skipped: [] };

  const bodyOpen = html.match(/<body\b([^>]*)>/i);
  const bodyStart = bodyOpen ? bodyOpen.index : -1;

  // ---- stylesheets (head and body, in order) ----------------------------------------------------
  const noComments = html.replace(/<!--[\s\S]*?-->/g, (c) => ' '.repeat(c.length));
  for (const m of noComments.matchAll(/<link\b([^>]*)>|<style\b([^>]*)>([\s\S]*?)<\/style>/gi)) {
    if (m[3] != null) { plan.links.push({ css: m[3] }); continue; }
    const attrs = parseAttrs(m[1]);
    if (!/\bstylesheet\b/i.test(attrs.rel || '') || !attrs.href) continue;
    const { href, rel, ...rest } = attrs;
    if (isExternal(href)) {
      const v = externalVerdict(href, manifest);
      if (v.verdict === 'drop') { plan.dropped.push(href); plan.links.push({ external: href, verdict: 'drop' }); }
      else plan.links.push({ external: href, verdict: 'vendor', path: v.path, attrs: rest });
    } else plan.links.push({ href, attrs: rest });
  }
  const t = noComments.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (t) plan.title = t[1].trim();

  // ---- scripts: the census's regex and rules ------------------------------------------------------
  let inline = 0;
  for (const m of noComments.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1]; const src = (attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (/type\s*=\s*["']module["']/i.test(attrs)) { plan.skipped.push({ file: src || 'inline-module', why: 'module' }); continue; }
    if (src) {
      if (isExternal(src)) {
        const v = externalVerdict(src, manifest);
        if (v.verdict === 'drop') plan.dropped.push(src);
        else plan.scripts.push({ vendor: { url: src, path: v.path, sha256: v.sha256 } });
        continue;
      }
      const rel = normalizeSrc(src);
      if (LOADER_RE.test(rel)) {
        const prefix = loaderPrefixOf(opts.loaderSource) ?? load.modFilesPrefix ?? 'js/';
        plan.scripts.push({ modFilesSlot: true, loader: rel, prefix });
        continue;
      }
      plan.scripts.push(renderOnly.has(rel) ? { src: rel, renderOnly: true } : { src: rel });
    } else if (m[2].trim()) {
      // html offset of the inline script, so the body markup below can drop it
      plan.scripts.push({ inline: html.slice(m.index, m.index + m[0].length).replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, ''), name: `inline#${++inline}` });
    }
  }

  // ---- body -----------------------------------------------------------------------------------------
  if (bodyOpen) {
    const attrs = parseAttrs(bodyOpen[1]);
    plan.onload = attrs.onload ?? null;
    delete attrs.onload;
    plan.body.attrs = attrs;
    const after = html.slice(bodyStart + bodyOpen[0].length);
    const close = after.search(/<\/body\s*>/i);
    plan.body.html = (close >= 0 ? after.slice(0, close) : after).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  }
  return plan;
}

/** The plan's script list in the manifest's `load.scripts` vocabulary: relative paths, `inline#n`, the slot. */
export const scriptNames = (plan) => plan.scripts.filter((s) => !s.vendor).map((s) => s.modFilesSlot ? '<modFiles>' : s.inline != null ? s.name : s.src);

/**
 * The execution order the page and the harness both follow: static entries in index order, then the modFiles
 * (read from the live `modInfo.modFiles` by the caller) where a slot was seen. Returns {static, slot}.
 */
export function executionOrder(plan) {
  const slot = plan.scripts.find((s) => s.modFilesSlot) || null;
  return { static: plan.scripts.filter((s) => !s.modFilesSlot), slot };
}
export const modFilePaths = (slot, modFiles) => (slot ? (modFiles || []).map((f) => normalizePath(slot.prefix + f)) : []);
