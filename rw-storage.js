// rw-storage.js — shared localStorage layer for the Running Writings apps.
//
// One key per app:  rw.<appId>.v1  →  {"remember": true|false, "state": {...}|null}
//
// - `remember` is the per-app "Remember settings" preference. It is always stored,
//   even when it is false, so the toggle stays off on the next visit.
// - `state` is whatever the app hands to save(); it is only stored while
//   `remember` is true.
// - Every app on apps.runningwritings.com shares one origin, so each app MUST use
//   its own appId (use the gallery id from apps.js: 'race-pace-calculator',
//   'gap-calculator', 'track-wind-calculator', ...).
// - load() can import a legacy cookie once (the apps used to keep state in
//   cookies) and then deletes it, so nothing is lost for returning visitors.
//
// This file is copied verbatim into every app repo (like apps.js and
// app-gallery.js). Keep the copies identical.
//
// Usage:
//   <script src="rw-storage.js?v=..." defer></script>   (before scripts.js)
//   const saved = RWStorage.load('gap-calculator', { legacyCookie: 'gapCalc' });
//   // saved.remember → boolean, saved.state → object or null
//   RWStorage.save('gap-calculator', stateObject, rememberFlag);
//   RWStorage.clear('gap-calculator');   // drops the state, keeps the preference

(function () {
  const KEY_PREFIX = 'rw.';
  const KEY_SUFFIX = '.v1';

  function keyFor(appId) {
    if (typeof appId !== 'string' || !appId) throw new Error('RWStorage: appId is required');
    return KEY_PREFIX + appId + KEY_SUFFIX;
  }

  function readRecord(appId) {
    try {
      const raw = window.localStorage.getItem(keyFor(appId));
      if (!raw) return null;
      const rec = JSON.parse(raw);
      return rec && typeof rec === 'object' ? rec : null;
    } catch (e) {
      return null;
    }
  }

  function writeRecord(appId, remember, state) {
    const rec = { remember: remember !== false, state: remember !== false && state && typeof state === 'object' ? state : null };
    try {
      window.localStorage.setItem(keyFor(appId), JSON.stringify(rec));
      return true;
    } catch (e) {
      return false; // private mode / quota / disabled storage: the app still works, it just won't remember
    }
  }

  function readCookie(name) {
    const parts = document.cookie ? document.cookie.split(';') : [];
    for (let i = 0; i < parts.length; i++) {
      const c = parts[i].trim();
      if (c.indexOf(name + '=') === 0) {
        try { return decodeURIComponent(c.substring(name.length + 1)); } catch (e) { return null; }
      }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  }

  // One-time import of the pre-localStorage cookie. Returns a record or null.
  function migrateLegacyCookie(appId, cookieName) {
    const raw = readCookie(cookieName);
    if (raw == null) return null;
    let state = null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') state = parsed;
    } catch (e) {
      state = null;
    }
    deleteCookie(cookieName);
    if (!state) return null;
    // The old cookies carried the opt-out inside the state object
    const remember = !(state.remember_settings === false || state.remember_pace === false);
    writeRecord(appId, remember, state);
    return { remember: remember, state: remember ? state : null };
  }

  const RWStorage = {
    /**
     * Load { remember, state } for an app. `remember` defaults to true.
     * `state` is null when nothing is stored, the record is malformed, or the
     * user opted out. Pass { legacyCookie: 'name' } to import an old cookie once.
     */
    load: function (appId, opts) {
      let rec = readRecord(appId);
      if (!rec && opts && opts.legacyCookie) {
        const migrated = migrateLegacyCookie(appId, opts.legacyCookie);
        if (migrated) return migrated;
      }
      if (!rec) return { remember: true, state: null };
      const remember = rec.remember !== false;
      const state = remember && rec.state && typeof rec.state === 'object' ? rec.state : null;
      return { remember: remember, state: state };
    },

    /** Save the app's state. When `remember` is false only the preference is kept. */
    save: function (appId, state, remember) {
      return writeRecord(appId, remember, state);
    },

    /** Drop the saved state but keep the remember preference. */
    clear: function (appId) {
      const rec = readRecord(appId);
      return writeRecord(appId, rec ? rec.remember !== false : true, null);
    },

    /** Read the remember preference without touching the state. */
    remember: function (appId) {
      const rec = readRecord(appId);
      return rec ? rec.remember !== false : true;
    },

    /** Remove the record entirely (used by tests / a future "forget everything"). */
    remove: function (appId) {
      try { window.localStorage.removeItem(keyFor(appId)); } catch (e) { /* ignore */ }
    }
  };

  window.RWStorage = RWStorage;
})();
