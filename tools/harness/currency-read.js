// The planner-script `tools/currency-data.mjs` runs in each game's global scope (boot.mjs --planner-script): the C1
// currency reader over every buyable of the game (loader/tmt-planner.js, `readCurrencies`). Harness-only — the
// rollback it scores with cannot run in the page. Returns plain JSON.
return { rows: tmtLoader.planner.readCurrencies({}) };
