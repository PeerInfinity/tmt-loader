// ATTACH — the loader's own extras, put onto a page whose game is already there (S4, docs/embed.md).
//
// Split out of loader/page.js in S4. `boot()` there BUILDS a page from a game's index.html (interpret, vendor swap,
// save prefix, `<base href>` via `gameBase`) and then calls these two; loader/embed.mjs calls them on an AUTHOR'S OWN
// page, where the game built itself. The hosted page is boot + attach, in the order boot always used:
//   · attachStyles — the loader's stylesheets, after the game's own (equal specificity is broken by source order);
//   · attachScripts — after the game's scripts and before its `onload`: the automation table, the currency data and
//     the ladder door, loader/tmt-auto.js, loader/options.js, loader/navbar.js, loader/layerlist.js.
//
// ⛔ NOTHING HERE KNOWS WHERE A GAME'S FILES ARE. `gameBase` (the R8 seam) is boot's alone; an embed page has no game
// URL at all — the author's page IS the game. Every URL built here is the LOADER's (`ctx.abs`), resolved against the
// loader's own root: the page's directory on the hosted site, the entry script's tree on an author's page.
//
// ctx = {
//   T         window.tmtLoader (flags already resolved on it: T.mobile, T.navbar, T.automation)
//   id        the loader's game id, or null (an author's page that did not name one: no loader data for it)
//   abs       (path) => absolute URL of a loader file
//   fetchText (url, what) => Promise<string>, throwing by name on a non-2xx
//   table     how the automation table arrives: null (the derived defaults), {url, name} (fetched), or
//             {value, name} (already in hand — an author's own `tmt-loader.json`, R2)
//   crossOrigin  true on an author's page: the loader's scripts come from another origin, and without
//             `crossorigin` a browser MUTES their errors ("Script error.", no filename), so a script that threw could
//             not be told from one that loaded. The hosted page leaves it unset — behaviour unchanged.
//   contract  true = loader/tmt-auto.js is inserted even without automation (the hosted page: it carries the
//             harness contract — tick, stateJSON, profile('off') — on every page). An author's page inserts it
//             only when automation is on: the contract is the harness's, and an author's player never needs it.
//   stop      () => boolean; true once the page has given up waiting (embed's time limit) — nothing more is inserted
// }

/** One <script>, awaited. Moved verbatim from page.js (S4); see the comment there on `skippable`. */
export function makeInsertScript(T, { crossOrigin = false } = {}) {
  return function insertScript(attrs, file, { skippable = false } = {}) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.async = false; // the IDL property: insertion order is execution order
      let execError = null;
      let own = null; // the URL the script's own errors carry in ev.filename
      const onErr = (ev) => { if (!execError && own != null && ev.filename === own) execError = ev.error || new Error(ev.message); };
      window.addEventListener('error', onErr);
      const done = (err) => { window.removeEventListener('error', onErr); err ? reject(err) : resolve(); };
      const fail = () => execError && Object.assign(new Error(`${file}: ${execError.message}`), { cause: execError });
      if (attrs.inline != null) {
        own = location.href;
        s.text = attrs.inline;
        document.head.appendChild(s); // inline scripts execute synchronously on insertion
        done(fail());
        return;
      }
      s.addEventListener('load', () => done(fail()));
      s.addEventListener('error', () => {
        if (!skippable) return done(new Error(`${file}: failed to load ${s.src}`));
        T.skipped.push(file);
        console.warn(`tmt-loader: skipped ${file} (failed to load ${s.src}), as a browser skips a failed <script src>`);
        done();
      });
      if (crossOrigin) s.crossOrigin = 'anonymous';
      s.src = attrs.src;
      own = s.src; // resolved against <base>
      document.head.appendChild(s);
    });
  };
}

/** The loader's stylesheets, appended to <head> — after the game's own sheets on both pages. */
export function attachStyles({ T, abs }) {
  const sheet = (elId, file) => { const st = document.createElement('link'); st.rel = 'stylesheet'; st.id = elId; st.href = abs(file); document.head.appendChild(st); };
  if (T.mobile) {
    // the class the layout is scoped under. The hosted page already set it at module top, before the game's markup;
    // an author's page has its markup already, and this is the earliest it can be known (idempotent on the hosted one)
    document.documentElement.classList.add('tmt-mobile');
    sheet('tmt-loader-mobile-css', 'loader/mobile.css');
  }
  if (T.navbar) { sheet('tmt-loader-navbar-css', 'loader/navbar.css'); sheet('tmt-loader-layerlist-css', 'loader/layerlist.css'); }
}

/** The loader's scripts, after the game's and before its onload. */
export async function attachScripts(ctx) {
  const { T, id, abs, fetchText, table = null, contract = true } = ctx;
  const insertScript = ctx.insertScript || makeInsertScript(T, { crossOrigin: !!ctx.crossOrigin });
  const step = (name) => {
    if (ctx.stop && ctx.stop()) throw new Error(`gave up waiting (at ${name})`);
    T.step = name;
  };
  const AUTOMATION = T.automation;
  const NAVBAR = T.navbar;
  if (AUTOMATION && table && table.url) {
    // the per-game automation table (games-auto/<id>.json, C1): a JSON DOCUMENT, fetched and parsed into
    // tmtLoader.autoTable BEFORE tmt-auto.js runs, which validates it against its own schema when it derives the
    // features — before onload, so load() picks up the hooks and the au layer. ⛔ ORDER MATTERS and is unchanged from
    // the script it replaces; a table that does not parse fails the load here, by name, as a bad script did.
    step(`table ${table.name}`);
    const text = await fetchText(table.url, table.name);
    try { T.autoTable = JSON.parse(text); } catch (e) { throw new Error(`${table.name}: not JSON — ${e.message}`); }
    T.loaded.push(table.name);
  } else if (AUTOMATION && table && table.value !== undefined) {
    // (S4, R2) the AUTHOR's own table, already read with their tmt-loader.json — it replaces the loader's for this
    // game. Validated by tmt-auto.js exactly as a fetched one is.
    step(`table ${table.name}`);
    T.autoTable = table.value;
    T.loaded.push(table.name);
  }
  if (AUTOMATION) {
    // ---- the GENERATED currency data (C1, games-data/<id>.json) -------------------------------------------------------
    // Which field each buyable really pays in, scored harness-side by a rollback (tools/currency-data.mjs). EAGER here
    // — ⛔ a plain page fetches it only when its layer list is first OPENED (U13, the branch below), never at boot. EAGER, unlike the ladder, because tmt-auto.js reads it in its
    // decisions from the first tick, and node ≡ page parity needs the page to decide with exactly what the harness
    // reads. The INDEX says which games have a file (103 of 171), so a game without one makes no request that fails.
    // (S4) An author's page that named no loader game id has no file to look for, and asks for nothing.
    T.currencyData = null;
    if (id) {
      step('currency data games-data/index.json');
      const cIndex = JSON.parse(await fetchText(abs('games-data/index.json'), 'games-data/index.json'));
      if (cIndex && Array.isArray(cIndex.games) && cIndex.games.indexOf(id) >= 0) {
        step(`currency data games-data/${id}.json`);
        T.currencyData = JSON.parse(await fetchText(abs(`games-data/${id}.json`), `games-data/${id}.json`));
      }
    }
    // (U13) the layer list asks through the same door on both pages; here the answer is already in hand
    T.currencyAsked = Promise.resolve(T.currencyData);
    T.fetchCurrencyData = () => T.currencyAsked;
  } else if (NAVBAR) {
    // ---- (U13) THE SAME DATA FOR THE LAYER LIST, on a page without automation -----------------------------------
    // ⚖ user, 2026-09-20: fetched in layer-list mode too, LAZILY, on the Layers view's FIRST OPEN (layerlist.js
    // `show()` is the only caller). ⛔ LAZY IS THE ASSERTION, not a description: a page that never opens the list
    // makes exactly the requests it made before U13 — gate M1 counts `games-data/` requests on its never-opened
    // page, and G1's plain-page row still asserts none. The INDEX first, as automation does, so a game without a
    // file makes no request that can fail. `T.currencyData` stays UNDEFINED until the answer arrives (the list
    // abstains, `? / ?`), then holds the file or null; a failed fetch leaves null and costs the page nothing.
    // `T.currencyAsked` is the promise once asked, and null before — read by the gate, which must not trigger it.
    T.currencyAsked = null;
    T.fetchCurrencyData = () => {
      if (T.currencyAsked) return T.currencyAsked;
      T.currencyAsked = (async () => {
        if (!id) return (T.currencyData = null);   // (S4) no loader game id: nothing to ask for
        const r = await fetch(abs('games-data/index.json'), { cache: 'no-cache' });
        if (!r.ok) return (T.currencyData = null);
        const index = JSON.parse(await r.text());
        if (!index || !Array.isArray(index.games) || index.games.indexOf(id) < 0) return (T.currencyData = null);
        const g = await fetch(abs(`games-data/${id}.json`), { cache: 'no-cache' });
        return (T.currencyData = g.ok ? JSON.parse(await g.text()) : null);
      })().catch(() => (T.currencyData = null));
      return T.currencyAsked;
    };
  }
  if (AUTOMATION) {
    // ---- the LADDER, where this game has one (V3) ------------------------------------------------------------------
    // ⚠ TWO OF THE 171 GAMES HAVE A LADDER (`tools/harness/ladder/<id>.json`, ptr and something), and the Progress
    // timeline uses its mark NAMES as labels on the events that satisfy them. ⛔ `loader/tmt-auto.js` fetches nothing
    // itself — it never touches the DOM or the network, which is what `docs/contract.md` says — so the HOST hands it
    // the file, exactly as the host hands it the manifest and the options.
    //
    // ⛔⛔ AND IT IS LAZY, AND IT ASKS AN INDEX FIRST — BOTH MEASURED, by CI, on the first cut that did neither.
    // The first cut fetched `tools/harness/ladder/<id>.json` on every automation boot and pushed a note to
    // `T.skipped` on a 404. `G1 load — automation page` judges EVERY request a page makes: a failed request the
    // manifest does not declare is a RED, and `tmtLoader.skipped` must equal the manifest's declared list exactly.
    // Result: **169 of 171 games RED**, for a file 169 of them were never going to have. So the ladder is asked for
    // only when something actually wants it (the `Progress` subtab, or a progress event with the tracker armed),
    // and the INDEX says which games have one, so there is never a 404 to judge.
    T.fetchLadder = (function () {
      let asked = null;
      return function () {
        if (asked) return asked;
        asked = (async () => {
          if (!id) { T.ladder = null; return null; }   // (S4) no loader game id: no ladder to look for
          const r = await fetch(abs('tools/harness/ladder/index.json'), { cache: 'no-cache' });
          if (!r.ok) return null;
          const index = JSON.parse(await r.text());
          if (!index || !Array.isArray(index.games) || index.games.indexOf(id) < 0) { T.ladder = null; return null; }
          const g = await fetch(abs(`tools/harness/ladder/${id}.json`), { cache: 'no-cache' });
          if (!g.ok) return null;
          const L = JSON.parse(await g.text());
          if (L && Array.isArray(L.marks)) { T.ladder = L; return L; }
          return null;
        })().catch(() => null);
        return asked;
      };
    })();
  }
  if (contract || AUTOMATION) {
    step('script loader/tmt-auto.js');
    await insertScript({ src: abs('loader/tmt-auto.js') }, 'loader/tmt-auto.js');
    T.loaded.push('loader/tmt-auto.js');
  }
  if (AUTOMATION) {
    // ---- (log-1) THE STATE LOG, on demand (docs/log.md) -------------------------------------------------------------
    // ⚖ user, 2026-09-30: in memory, a size cap, a download; OFF unless switched on. ⛔ LAZY IS THE ASSERTION, as the
    // ladder's and the layer list's data are: a page that never switches it on requests neither `loader/log-hooks.json`
    // nor `loader/tmt-log.js`, stores nothing and runs none of it (G1 judges every request an automation page makes).
    // Two doors: the switch in the automation tab's developer details calls `T.fetchStateLog()`; `?autoOpt=log=1`
    // (the gates' lever, and a player's bookmark) loads it here and starts it once the game is ready.
    T.fetchStateLog = (function () {
      let asked = null;
      return function () {
        if (asked) return asked;
        asked = (async () => {
          T.logHooks = JSON.parse(await fetchText(abs('loader/log-hooks.json'), 'loader/log-hooks.json'));
          await insertScript({ src: abs('loader/tmt-log.js') }, 'loader/tmt-log.js');
          T.loaded.push('loader/tmt-log.js');
          return T.stateLog || null;
        })();
        asked.catch(() => { asked = null; });   // a failed fetch may be retried by the next press
        return asked;
      };
    })();
    const logOpt = T.options && T.options.log;
    if (logOpt !== undefined && logOpt !== '0' && logOpt !== 'false' && logOpt !== '') {
      step('script loader/tmt-log.js');
      await T.fetchStateLog();
      const go = () => { try { T.stateLog.setPage(true); } catch (e) { console.warn('tmt-loader: the state log did not start', e); } };
      if (T.ready) go(); else window.addEventListener('tmt-loader:ready', go, { once: true });
    }
  }
  // the OPTIONS SECTION (docs/options.md) — the only file here with no flag in front of it, and it has to be:
  // it is how a page that carries none of the flags offers them. It adds nothing to <head>, nothing to `player`
  // and no timer; its one element lives inside the game's own options tab, while that tab is open.
  step('script loader/options.js');
  await insertScript({ src: abs('loader/options.js') }, 'loader/options.js');
  T.loaded.push('loader/options.js');
  if (NAVBAR) {
    step('script loader/navbar.js');
    await insertScript({ src: abs('loader/navbar.js') }, 'loader/navbar.js');
    T.loaded.push('loader/navbar.js');
    document.documentElement.classList.add('tmt-navbar'); // the bar is installed; navbar.css hides the corner controls
    // the LAYER LIST (docs/mobile.md) — the bar's Layers button opens it. After navbar.js, which owns the button:
    // the entry stays hidden until `tmtLoader.layerListUI` exists, so a bar without this file is still a whole bar.
    step('script loader/layerlist.js');
    await insertScript({ src: abs('loader/layerlist.js') }, 'loader/layerlist.js');
    T.loaded.push('loader/layerlist.js');
  }
}
