// The planner-script `tools/harness/facts.mjs` runs in each game's global scope (boot.mjs --planner-script): every
// fact kind at this state (loader/tmt-planner.js, `extractFacts`; docs/facts.md). Harness-only — the probes roll back.
// facts.mjs prepends `var FACTS_OPTS = {…};`. Returns plain JSON.
return tmtLoader.planner.extractFacts(typeof FACTS_OPTS === 'object' && FACTS_OPTS ? FACTS_OPTS : {});
