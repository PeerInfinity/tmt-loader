// The REQUEST verdict for gate E1 (embed mode, S4; docs/embed.md) — alone in a dependency-free module, like
// loadverdict.mjs, so the `units` job (no `npm ci`) can test it.
//
// On an author's page there are three kinds of request, and each has its own rule:
//   · the GAME's origin — the author's own files. Anything the page asks of its own site is the game's business,
//     except that it must not FAIL unless the manifest declares it (load.known.missingAssets / missingScripts), and
//     `tmt-loader.json` may be asked for only when the tag says `data-settings`;
//   · the LOADER's origin — the loader's files. EXACTLY the set the resolved features need (below), nothing more:
//     ⛔ a feature that is not ON asks for nothing, and a feature that is not LOADED is never on; and never a game
//     file (`gamePath`) from the loader's site — an author's page has its own;
//   · the INTERNET stand-in — the game's own external URLs (vue from a CDN, a font), routed by the harness to the
//     vendored copy or an empty answer. Only URLs the manifest's `load.external` lists.
import { gamePath } from './lib.mjs';

/** The loader files an author's page may request, for the flags it resolved. */
// (shipq-2) `queues`: the table IN FORCE ships an enabled queue (its `queues` section) — the page then asks for the queue
// runner, `loader/tmt-queue.js`, once (attach.mjs); a table without one, or no table at all, asks for nothing more.
export function declaredLoaderFiles({ mobile, navbar, automation }, { id = null, auto = null, currency = false, fromFile = false, queues = false } = {}) {
  const want = new Set(['v1/embed.js', 'loader/embed.mjs', 'loader/flags.mjs', 'loader/attach.mjs', 'loader/options.js']);
  if (mobile) want.add('loader/mobile.css');
  if (navbar || mobile) for (const f of ['loader/navbar.css', 'loader/layerlist.css', 'loader/navbar.js', 'loader/layerlist.js']) want.add(f);
  if (automation) {
    want.add('loader/tmt-auto.js');
    if (queues) want.add('loader/tmt-queue.js');
    if (id) {
      if (!fromFile) want.add(`manifests/${id}.json`);
      if (auto && !fromFile) want.add(auto);
      want.add('games-data/index.json');
      if (currency) want.add(`games-data/${id}.json`);
    }
  }
  return want;
}

/**
 * judgeEmbed({urls, failed, loaderBase, gameBase, external, declared, settings, missing})
 *   urls      every request URL the page made (Playwright's per-page list)
 *   failed    "<url> <why>" strings for failed requests
 *   declared  the Set declaredLoaderFiles returned
 *   external  the manifest's load.external (url → verdict)
 *   settings  true when the tag says data-settings
 *   missing   paths (under the game) the manifest declares missing
 * → {ok, loaderAsked, undeclared, missingDeclared, gameFromLoader, externalUndeclared, failedBad, settingsAsked}
 */
export function judgeEmbed({ urls, failed, loaderBase, gameBase, external = {}, declared, settings = false, missing = [] }) {
  const L = new URL(loaderBase), G = new URL(gameBase);
  const pathUnder = (u, base) => { try { const x = new URL(u); if (x.origin !== base.origin || !x.pathname.startsWith(base.pathname)) return null; return x.pathname.slice(base.pathname.length); } catch { return null; } };
  const loaderAsked = [...new Set(urls.map((u) => pathUnder(u, L)).filter((p) => p !== null))].sort();
  const undeclared = loaderAsked.filter((p) => !declared.has(p));
  // the loader's games directory, spelled through the seam: an author's page must never reach for a hosted copy
  const gameFromLoader = loaderAsked.filter((p) => p.startsWith(gamePath('', '').replace(/\/+$/, '/')));
  const externalUndeclared = [...new Set(urls.filter((u) => pathUnder(u, L) === null && pathUnder(u, G) === null && !/^(data|blob):/.test(u)
    && !(u in external)))];
  const settingsAsked = urls.some((u) => pathUnder(u, G) === 'tmt-loader.json');
  const miss = new Set(missing);
  const failedBad = failed.filter((f) => {
    const u = String(f).split(' ')[0];
    const gp = pathUnder(u, G);
    if (gp !== null && miss.has(gp)) return false;
    if (gp === 'tmt-loader.json' && settings && / HTTP 404$/.test(String(f))) return false;   // asked for, and not there: the tag's settings apply
    if (/net::ERR_ABORTED/.test(String(f)) && !failed.some((g) => g !== f && String(g).split(' ')[0] === u)) return false;   // teardown (loadverdict.mjs)
    return true;
  });
  const ok = undeclared.length === 0 && gameFromLoader.length === 0 && externalUndeclared.length === 0 && failedBad.length === 0
    && (settings || !settingsAsked);
  return { ok, loaderAsked, undeclared, missingDeclared: [...declared].filter((p) => !loaderAsked.includes(p)).sort(), gameFromLoader,
    externalUndeclared, failedBad, settingsAsked };
}
