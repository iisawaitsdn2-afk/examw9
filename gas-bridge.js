/* Pengganti google.script.run agar index.html bisa jalan di GitHub Pages.
   Isi GAS_URL dengan URL Web App Apps Script (yang berakhiran /exec). */
(function () {
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbyWd9-D51kfexBlKrk2jPtYGgAqYGQiXVkgjv4NXxA7ayMbbHoEgRxJIfe3ED850aR5/exec';
  if (window.google && google.script && google.script.run) return; // sedang di dalam Apps Script
  function make(ok, fail) {
    return new Proxy({}, {
      get: function (_, name) {
        if (name === 'withSuccessHandler') return function (f) { return make(f, fail); };
        if (name === 'withFailureHandler') return function (f) { return make(ok, f); };
        if (name === 'withUserObject') return function () { return make(ok, fail); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // tanpa preflight CORS
            body: JSON.stringify({ fn: String(name), args: args }),
            redirect: 'follow'
          }).then(function (r) { return r.json(); }).then(function (j) {
            if (j && j.ok) { if (ok) ok(j.data); }
            else throw new Error((j && j.error) || 'Kesalahan server');
          }).catch(function (e) { if (fail) fail(e); });
        };
      }
    });
  }
  window.google = { script: { run: make(null, null) } };
})();
