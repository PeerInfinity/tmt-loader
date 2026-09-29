// The localStorage prefix shim (plan §3d). Installed on Storage.prototype BEFORE any game script runs, so every key
// a game uses is stored as `tmt-loader:<id>:<key>` wherever the engine builds the key (`modInfo.id` on 2.2.1,
// `getModID()` on 2.5+). `key(n)` / `length` / `clear()` see only that namespace. Values are never rewritten, so
// exportSave()/importSave() strings are the game's own.
//
// Used by the page (proto = Storage.prototype) and by the Node harness (proto = its in-memory Storage class).

export const prefixFor = (id) => `tmt-loader:${id}:`;

/** Every key in `store` under `prefix`, read with the RAW methods (never through the shim). */
export function rawKeys(raw, store, prefix = '') {
  const out = [];
  const n = raw.length.call(store);
  for (let i = 0; i < n; i++) {
    const k = raw.key.call(store, i);
    if (k !== null && k.startsWith(prefix)) out.push(k);
  }
  return out;
}

/** Captures the prototype's raw methods (before any patch) — the loader's own storage uses these. */
export function captureRaw(proto) {
  return {
    getItem: proto.getItem, setItem: proto.setItem, removeItem: proto.removeItem, key: proto.key, clear: proto.clear,
    length: Object.getOwnPropertyDescriptor(proto, 'length').get,
  };
}

export function installSavePrefix(proto, id) {
  if (proto.__tmtLoaderPrefix) throw new Error(`save-prefix shim already installed (${proto.__tmtLoaderPrefix})`);
  const prefix = prefixFor(id);
  const raw = captureRaw(proto);
  const ns = (store) => rawKeys(raw, store, prefix);
  const def = (name, value) => Object.defineProperty(proto, name, { value, writable: true, configurable: true, enumerable: true });
  def('getItem', function getItem(k) { return raw.getItem.call(this, prefix + String(k)); });
  def('setItem', function setItem(k, v) { return raw.setItem.call(this, prefix + String(k), v); });
  def('removeItem', function removeItem(k) { return raw.removeItem.call(this, prefix + String(k)); });
  def('key', function key(n) { const k = ns(this)[Number(n) | 0]; return k === undefined ? null : k.slice(prefix.length); });
  def('clear', function clear() { for (const k of ns(this)) raw.removeItem.call(this, k); });
  Object.defineProperty(proto, 'length', { get() { return ns(this).length; }, configurable: true, enumerable: true });
  Object.defineProperty(proto, '__tmtLoaderPrefix', { value: prefix });
  return {
    prefix, raw,
    /** {fullKey: value} of this game's namespace in `store`. */
    list(store) { const o = {}; for (const k of ns(store)) o[k] = raw.getItem.call(store, k); return o; },
    /** Removes this game's namespace from `store`; returns the number of keys removed. */
    clear(store) { const ks = ns(store); for (const k of ks) raw.removeItem.call(store, k); return ks.length; },
    /** Writes {fullKey: value} pairs raw (keys must carry this game's prefix). */
    seed(store, entries) {
      for (const [k, v] of Object.entries(entries || {})) {
        if (!k.startsWith(prefix)) throw new Error(`seed key outside ${prefix}: ${k}`);
        raw.setItem.call(store, k, v);
      }
    },
  };
}
