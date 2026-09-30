// LINK MODE — play a game straight from its author's repository (S5; docs/link.md is the reader's document).
//
//   index.html?repo=<owner>/<name>[@<commit>][&source=pages|cdn|hosted]
//
// loader/page.js BOOTS the page exactly as it boots a hosted game (interpret, vendor swap, save prefix, `<base href>`,
// then attach.mjs, unchanged); what link mode changes is WHERE the game's files come from — the R8 seam's `gameBase`
// takes a source — and which manifest describes them. This file is the part of that which needs no browser: the link's
// grammar, the game's id, the order the sources are tried in, the manifest for a repository the loader has never
// listed. Every function that reaches the network takes `fetch` as an argument, so the unit
// tests (loader/link.test.mjs, `node:` builtins only — the `units` job installs nothing) drive them with fakes.
//
// ⚖ The rulings this implements (tmt-repo-split-plan.md): R3 — the author's own GitHub Pages, then jsDelivr at a
// resolved commit, then the loader's hosted copy; the CDN is supported and never the only source. R9 — a pinned link
// (`@<commit>`) is what the census will make. D1 — a game the loader lists keeps its manifest id, so its saves carry
// over; any other repository gets an id made from `owner/name`. D5 — a declined game loads, with its reason shown.
// D8 — the author's tmt-loader.json, read through the chosen source, cached for the session. ⚖ D2 (user,
// 2026-09-29): NO LICENCE CHECK in link mode — every listed fork's licence text is MIT, and a fork of TMT carries TMT's
// MIT licence; so there is no policy switch, no licence notice and no API request for it.

export class LinkError extends Error {
  constructor(message) { super(message); this.name = 'LinkError'; }
}

export const SOURCES = ['pages', 'cdn', 'hosted'];
export const SOURCE_NAMES = { pages: "the author's own site (GitHub Pages)", cdn: 'jsDelivr', hosted: "the loader's own copy" };
// jsDelivr refuses a single file over 20 MB (measured, S0 item 3: HTTP 403 "File size exceeded the configured limit
// of 20 MB."), so a game that needs one cannot come from it whole.
export const CDN_FILE_LIMIT = 20 * 1024 * 1024;
export const GITHUB_API = 'https://api.github.com/';
export const CDN = 'https://cdn.jsdelivr.net/gh/';
export const CDN_DATA = 'https://data.jsdelivr.com/v1/packages/gh/';

// GitHub's own rules: an owner is 1–39 of [A-Za-z0-9-] (no leading hyphen); a repository name [A-Za-z0-9._-].
const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NAME = /^[A-Za-z0-9._-]{1,100}$/;
const COMMIT = /^[0-9a-f]{7,40}$/;

/** `owner/name[@commit]` → {owner, name, repo, commit|null}; a LinkError in plain words otherwise. */
export function parseRepo(s) {
  const text = String(s == null ? '' : s).trim();
  const m = /^([^/@\s]+)\/([^/@\s]+?)(?:\.git)?(?:@([^/@\s]+))?$/.exec(text);
  if (!m) throw new LinkError(`"${text}" is not a repository. The link should say ?repo=owner/name, for example ?repo=Jacorb90/Prestige-Tree`);
  const [, owner, name, commit] = m;
  if (!OWNER.test(owner)) throw new LinkError(`"${owner}" is not a GitHub user or organisation name`);
  if (!NAME.test(name) || name === '.' || name === '..') throw new LinkError(`"${name}" is not a GitHub repository name`);
  if (commit !== undefined && !COMMIT.test(commit.toLowerCase())) {
    throw new LinkError(`"@${commit}" is not a commit. After the @ the link takes a commit id (7 to 40 of 0-9 and a-f); leave it out to play the latest version`);
  }
  return { owner, name, repo: `${owner}/${name}`, commit: commit === undefined ? null : commit.toLowerCase() };
}

/** `&source=` → one of SOURCES, or null (try them in order). */
export function parseSource(s) {
  if (s == null || s === '') return null;
  const v = String(s).toLowerCase();
  if (!SOURCES.includes(v)) throw new LinkError(`&source=${s} is not a source. It can be pages (the author's own site), cdn (jsDelivr) or hosted (the loader's copy)`);
  return v;
}

const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

/** The loader's listing entry for a repository (manifests/index.json rows: {id, name, repo}), or null. */
export const knownGame = (index, repo) => (Array.isArray(index) ? index.find((g) => g && same(g.repo, repo)) : null) || null;
/** The declined record (manifests/declined.json rows: {repo, short, reason}), or null. */
export const declinedGame = (declined, repo) => (Array.isArray(declined) ? declined.find((g) => g && same(g.repo, repo)) : null) || null;

/**
 * ⚖ D1 — the game's id, which is also its save namespace (`tmt-loader:<id>:`, loader/shims/save-prefix.js).
 * A listed game keeps its manifest id, so a player's hosted save IS its link-mode save. Any other repository:
 * `gh--<owner>--<name>`, lower-cased, every character outside [a-z0-9-] a hyphen. The automation table's schema allows
 * exactly [a-z0-9-]; a manifest id never starts with `gh--`; and a GitHub owner cannot contain `--`, so the owner/name
 * split is never ambiguous. (Two names that differ only in `.`/`_` vs `-` would share an id — noted, not handled.)
 */
export function linkId(parsed, index) {
  const k = knownGame(index, parsed.repo);
  if (k) return { id: k.id, known: true, name: k.name || null };
  const part = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return { id: `gh--${part(parsed.owner)}--${part(parsed.name)}`, known: false, name: null };
}

/**
 * The order the sources are tried in.
 *   · forced (`&source=`): that one alone;
 *   · UNPINNED (the latest): the author's Pages → jsDelivr at the latest commit → the hosted copy (⚖ R3's order);
 *   · PINNED (`@<commit>`, what the census makes, R9): jsDelivr at that commit → the hosted copy → the author's Pages
 *     LAST — a Pages site serves whatever its author last published and cannot be asked for a commit, so it cannot
 *     keep a pin; it is still a source (R3: the CDN is never the only one), and the page says it is not the pinned one.
 * The hosted copy is offered only for a game the loader lists.
 */
export function sourceOrder({ pinned, known, force = null }) {
  if (force) return [force];
  const order = pinned ? ['cdn', 'hosted', 'pages'] : ['pages', 'cdn', 'hosted'];
  return order.filter((s) => s !== 'hosted' || known);
}

/** An author's GitHub Pages address: `<owner>.github.io/<name>/`, or the site root for a `<owner>.github.io` repository. */
export function pagesBase(owner, name) {
  const host = `${owner.toLowerCase()}.github.io`;
  return same(name, host) ? `https://${host}/` : `https://${host}/${name}/`;
}
/** jsDelivr's copy of a repository at ONE commit (immutable there for a year; `@<branch>` would be cached a week). */
export const cdnBase = (owner, name, commit) => `${CDN}${owner}/${name}@${commit}/`;

// ---------------------------------------------------------------- the manifest

/** A manifest's external-URL verdicts for a page it did not see: the loader's vendored copy, or leave it out. */
export function deriveExternal(html, vendorIndex = {}) {
  const external = {}, vendor = {}, notes = [];
  const text = String(html).replace(/<!--[\s\S]*?-->/g, '');
  const urls = [];
  for (const m of text.matchAll(/<script\b([^>]*)>/gi)) {
    if (/type\s*=\s*["']module["']/i.test(m[1])) continue;
    const src = (m[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (src) urls.push(src);
  }
  for (const m of text.matchAll(/<link\b([^>]*)>/gi)) {
    if (!/\brel\s*=\s*["']?[^"'>]*stylesheet/i.test(m[1])) continue;
    const href = (m[1].match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (href) urls.push(href);
  }
  for (const u of urls) {
    if (!/^(https?:)?\/\//i.test(u) || u in external) continue;
    const v = vendorFor(u, vendorIndex);
    if (v) { external[u] = 'vendor'; vendor[u] = v.entry; if (v.near) notes.push(`${u} is played with the loader's copy of Vue ${v.version}`); }
    else { external[u] = 'drop'; notes.push(`${u} is left out (the loader does not load files from other sites)`); }
  }
  return { external, vendor, notes };
}

/**
 * The vendored copy for an external URL: an exact entry of vendor/index.json, else — for Vue 2.6.x / 2.7.x only — the
 * vendored copy of that minor version (a patch release of the same library; `near`). Anything else: none.
 */
export function vendorFor(url, vendorIndex = {}) {
  const exact = vendorIndex[url];
  if (exact) return { entry: exact, near: false };
  const m = /\bvue@(2\.[67])\.\d+\b/i.exec(url);
  if (!m) return null;
  for (const [u, e] of Object.entries(vendorIndex)) {
    const v = /\bvue@(2\.[67]\.\d+)\b/i.exec(u);
    if (v && v[1].startsWith(m[1] + '.')) return { entry: e, near: true, version: v[1] };
  }
  return null;
}

/** The manifest for a repository the loader has never listed: just what interpret() needs. */
export function deriveManifest({ id, parsed, commit, html, vendorIndex }) {
  const d = deriveExternal(html, vendorIndex);
  return {
    manifest: { schema: 1, id, name: parsed.repo, upstream: { repo: parsed.repo, commit: commit || null }, entry: 'index.html',
      load: { external: d.external, vendor: d.vendor }, derived: true },
    notes: d.notes,
  };
}

/**
 * A listed game's manifest against a page it may not have seen (the author's current site): its own verdicts stay
 * exactly as declared (its fixes intact); a URL it does not name gets the derived verdict. Returns a COPY.
 */
export function withDerived(manifest, html, vendorIndex) {
  const load = manifest.load || {};
  const d = deriveExternal(html, vendorIndex);
  const extra = Object.keys(d.external).filter((u) => !(u in (load.external || {})));
  if (!extra.length) return { manifest, notes: [] };
  const external = { ...(load.external || {}) }, vendor = { ...(load.vendor || {}) };
  for (const u of extra) { external[u] = d.external[u]; if (d.vendor[u]) vendor[u] = d.vendor[u]; }
  return { manifest: { ...manifest, load: { ...load, external, vendor } }, notes: d.notes.filter((n) => extra.some((u) => n.startsWith(u))) };
}

/** Whether a page needs vendor/index.json at all: it names an external URL its manifest has no verdict for. */
export function needsVendorIndex(html, manifest) {
  const known = (manifest && manifest.load && manifest.load.external) || {};
  return Object.keys(deriveExternal(html, {}).external).some((u) => !(u in known));
}

// ---------------------------------------------------------------- the network (fetch injected)

/** A session cache (sessionStorage-shaped: getItem/setItem), or none. Failures cost the cache, never the load. */
export function sessionCache(store) {
  return {
    get(k) { try { const v = store && store.getItem(k); return v ? JSON.parse(v) : undefined; } catch { return undefined; } },
    set(k, v) { try { if (store) store.setItem(k, JSON.stringify(v)); } catch { /* no cache: asked again next time */ } },
  };
}

/**
 * "Latest" → a commit, through GitHub's API (`commits/HEAD`, `Accept: application/vnd.github.sha` → the bare sha).
 * 60 requests an hour per address, unauthenticated: the answer is cached for the tab's session, and a link that
 * carries `@<commit>` never calls this at all.
 */
export async function resolveLatest(parsed, { fetch, cache }) {
  const key = `tmt-loader:link:latest:${parsed.repo.toLowerCase()}`;
  const c = cache.get(key);
  if (c && COMMIT.test(c)) return { commit: c, cached: true };
  const url = `${GITHUB_API}repos/${parsed.owner}/${parsed.name}/commits/HEAD`;
  let r;
  try { r = await fetch(url, { headers: { Accept: 'application/vnd.github.sha' } }); }
  catch (e) { throw new LinkError(`GitHub did not answer when asked for the latest version (${e && e.message})`); }
  if (!r.ok) throw new LinkError(r.status === 403 || r.status === 429
    ? 'GitHub would not say which version is the latest: it allows 60 questions an hour from one address, and that is used up'
    : r.status === 404 ? 'GitHub has no such repository (or it is private)' : `GitHub answered HTTP ${r.status} when asked for the latest version`);
  const sha = (await r.text()).trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new LinkError('GitHub\'s answer for the latest version was not a commit id');
  cache.set(key, sha);
  return { commit: sha, cached: false };
}

/**
 * Files jsDelivr would refuse (over CDN_FILE_LIMIT) in a repository at one commit, or null when that cannot be told.
 * First the loader's own record (link/cdn-over-limit.json — measured over the roster's tested commits), then jsDelivr's
 * listing API — asked only when the record does not cover that commit (which itself declines a repository over 50 MB — then: null, and the page loads from the CDN anyway).
 */
export async function cdnOverLimit(parsed, commit, { fetch, recorded = null, covered = false }) {
  const rec = recorded && recorded.files && Object.entries(recorded.files).find(([k]) => same(k, `${parsed.repo}@${commit}`));
  if (rec) return { files: rec[1], from: 'record' };
  // `covered`: a listed game at its manifest's commit — the record was measured over exactly those, so absent = none
  if (covered) return { files: [], from: 'record' };
  try {
    const r = await fetch(`${CDN_DATA}${parsed.owner}/${parsed.name}@${commit}?structure=flat`);
    if (!r.ok) return { files: null, from: `listing HTTP ${r.status}` };
    const j = await r.json();
    const files = (j.files || []).filter((f) => f && f.size > CDN_FILE_LIMIT).map((f) => String(f.name).replace(/^\//, ''));
    return { files, from: 'listing' };
  } catch (e) { return { files: null, from: `listing failed (${e && e.message})` }; }
}

// ---------------------------------------------------------------- the seam's link half

/** The base URL of a game's files at a link-mode source (the page's `gameBase(id, source)` calls this). */
export function linkBase(source) {
  if (source.kind === 'pages') return source.final || pagesBase(source.owner, source.name);
  if (source.kind === 'cdn') return cdnBase(source.owner, source.name, source.commit);
  throw new Error(`linkBase: no link base for a "${source.kind}" source (the hosted copy is gameBase(id))`);
}

// ---------------------------------------------------------------- resolving a link into a page to build

const short = (c) => (c ? String(c).slice(0, 7) : '?');

/**
 * Everything boot() needs to build a link-mode page: {id, manifest, gameHref, plan, table, link}. deps = {
 *   params      URLSearchParams of the page
 *   fetch       the browser's fetch (or a fake)
 *   cache       sessionCache(sessionStorage)
 *   abs         (path) => a loader file's URL
 *   gameBase    (id, source|null) => the game's base URL — THE R8 SEAM, page side
 *   interpret, executionOrder   from interpret.mjs
 *   status      (text) => void — what the page says while it works (plain words)
 * }
 * Throws a LinkError whose message is the whole story in plain words when nothing can be loaded.
 */
export async function resolveLink(deps) {
  const holder = {};
  try { return await resolveInner(deps, holder); }
  catch (e) { if (e && typeof e === 'object') e.link = holder.link || null; throw e; }
}
async function resolveInner(deps, holder) {
  const { params, fetch, cache, abs, gameBase, interpret, executionOrder, status = () => {} } = deps;
  const parsed = parseRepo(params.get('repo'));
  const force = parseSource(params.get('source'));
  const link = { repo: parsed.repo, requested: parsed.commit, pinned: !!parsed.commit, force, id: null, known: false, declined: null,
    source: null, commit: null, tried: [], notices: [], warnings: [], api: [] };
  holder.link = link;
  const getText = async (url, what) => {
    let r;
    try { r = await fetch(url, { cache: 'no-cache' }); } catch (e) { throw new LinkError(`${what}: no answer (${e && e.message})`); }
    if (!r.ok) throw new LinkError(`${what}: HTTP ${r.status}`);
    return { text: await r.text(), url: r.url || url };
  };
  const loaderJSON = async (p) => JSON.parse((await getText(abs(p), p)).text);

  status(`Looking up ${parsed.repo}…`);
  const [index, declined] = await Promise.all([loaderJSON('manifests/index.json'), loaderJSON('manifests/declined.json')]);
  const who = linkId(parsed, index);
  Object.assign(link, { id: who.id, known: who.known });
  const listed = who.known ? await loaderJSON(`manifests/${who.id}.json`) : null;
  const d = declinedGame(declined, parsed.repo);
  if (d) {
    link.declined = { short: d.short, reason: d.reason };
    link.warnings.push(`The loader does not list this game (${d.short}): ${d.reason}`);
  }

  let vendorIndex = null;
  const vendor = async () => (vendorIndex ??= await loaderJSON('vendor/index.json'));
  let recorded = null;
  let latest = null;
  const order = sourceOrder({ pinned: link.pinned, known: who.known, force });

  for (let k = 0; k < order.length; k++) {
    const kind = order[k];
    const rest = order.slice(k + 1);
    const next = rest.length ? ` Trying ${SOURCE_NAMES[rest[0]]} instead.` : '';
    const attempt = { source: kind, ok: false, why: null, commit: null };
    link.tried.push(attempt);
    try {
      let source = null, commit = null;
      if (kind === 'cdn') {
        commit = parsed.commit;
        if (!commit) {
          status(`Asking GitHub which version of ${parsed.repo} is the latest…`);
          latest ??= await resolveLatest(parsed, { fetch: countingApi(fetch, link), cache });
          commit = latest.commit;
        }
        recorded ??= await loaderJSON('link/cdn-over-limit.json').catch(() => ({}));
        const covered = !!listed && listed.upstream && same(listed.upstream.commit, commit);
        const big = await cdnOverLimit(parsed, commit, { fetch, recorded, covered });
        if (big.files && big.files.length) {
          const what = `jsDelivr does not serve files over 20 MB, and this game has ${big.files.length}: ${big.files.join(', ')}`;
          if (rest.includes('hosted')) throw new LinkError(what);
          link.warnings.push(`${what} — they will not load.`);
        }
        source = { kind, owner: parsed.owner, name: parsed.name, commit };
      } else if (kind === 'pages') {
        source = { kind, owner: parsed.owner, name: parsed.name };
      } else {
        commit = listed.upstream && listed.upstream.commit;
      }
      attempt.commit = commit;
      status(`Loading ${parsed.repo} from ${SOURCE_NAMES[kind]}${commit ? ` (version ${short(commit)})` : ''}…`);
      const entry = (listed && listed.entry) || 'index.html';
      const got = await getText(new URL(entry, gameBase(who.id, source)).href, `the game's ${entry}`);
      // Pages may redirect (a custom domain): the game's files are wherever its index.html really came from
      if (source && kind === 'pages') { const dir = new URL('.', got.url).href; if (dir !== linkBase(source)) source.final = dir; }
      const gameHref = gameBase(who.id, source);
      let manifest, notes;
      if (listed) {
        const needs = needsVendorIndex(got.text, listed);
        ({ manifest, notes } = needs ? withDerived(listed, got.text, await vendor()) : { manifest: listed, notes: [] });
      } else ({ manifest, notes } = deriveManifest({ id: who.id, parsed, commit, html: got.text, vendorIndex: await vendor() }));
      let plan;
      try { plan = interpret(got.text, manifest); }
      catch (e) { throw new LinkError(`its page could not be read (${e && e.message})`); }
      if (!plan.scripts.length) throw new LinkError(`its ${entry} has no scripts — there is no game there`);
      const slot0 = executionOrder(plan).slot;
      if (slot0) plan = interpret(got.text, manifest, { loaderSource: (await getText(new URL(slot0.loader, gameHref).href, slot0.loader)).text });

      attempt.ok = true;
      Object.assign(link, { source: kind, commit });
      if (kind === 'pages') link.notices.push(link.pinned
        ? `This is the author's site as it is now, which may not be version ${short(parsed.commit)} that the link asks for.`
        : 'This is the author\'s site as it is now.');
      if (kind === 'hosted' && link.pinned && !same(String(commit).slice(0, parsed.commit.length), parsed.commit)) {
        link.warnings.push(`The loader's copy is version ${short(commit)}, not version ${short(parsed.commit)} that the link asks for.`);
      }
      link.notices.push(...notes);
      if (k > 0) link.notices.push(`Loaded from ${SOURCE_NAMES[kind]} because ${link.tried.slice(0, k).map((t) => `${SOURCE_NAMES[t.source]}: ${t.why}`).join('; ')}.`);

      // ⚖ D8 / R2 — the author's own tmt-loader.json, beside their index.html, through this same source
      const table = await authorTable({ base: gameHref, fetch, cache, id: who.id, link });
      return { id: who.id, manifest, gameHref, plan, table, link };
    } catch (e) {
      attempt.why = e instanceof LinkError ? e.message : String((e && e.message) || e);
      if (rest.length) status(`${SOURCE_NAMES[kind]} did not work: ${attempt.why}.${next}`);
    }
  }
  throw new LinkError(`${parsed.repo} could not be loaded from any source.\n` +
    link.tried.map((t) => `  · ${SOURCE_NAMES[t.source]}: ${t.why}`).join('\n'));
}

/** Counts the GitHub API requests on `link.api` (gate L1: a pinned link makes none, "latest" one, cached). */
function countingApi(fetch, link) {
  return (url, opts) => { link.api.push(String(url)); return fetch(url, opts); };
}

/**
 * The author's tmt-loader.json (docs/embed.md's format), beside the game's index.html at the chosen source; cached for
 * the tab's session (as embed mode does). Only `autoTable` is in force in link mode — the page's features follow the
 * player's choices exactly as on the hosted page. Returns the table for attach.mjs, or null.
 */
async function authorTable({ base, fetch, cache, id, link }) {
  const url = new URL('tmt-loader.json', base).href;
  const key = `tmt-loader:settings:${url}`;
  let file = cache.get(key);
  if (file === undefined) {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (r.ok) { file = JSON.parse(await r.text()); cache.set(key, file); } else file = null;
    } catch { file = null; }
  }
  link.settings = file ? { url, keys: Object.keys(file) } : null;
  if (!file || typeof file !== 'object' || file.autoTable === undefined) return null;
  const t = file.autoTable;
  const value = t && typeof t === 'object' && !Array.isArray(t) && t.id === undefined ? { id, ...t } : t;
  return { value, name: 'tmt-loader.json#autoTable' };
}
