/* json-minifier.js: JSON Minifier
   Validates the JSON, then removes every space and line break outside of strings.
   Numbers and strings are copied exactly as written, so nothing is rounded or re-encoded.
   Registers Minify.json and Tools.json; the page is drawn when the tool is opened. */
(function () {
  window.Minify = window.Minify || {};
  window.Tools = window.Tools || {};

  // Same-length copy with comments and trailing commas blanked out, so error positions still line up.
  function clean(src) {
    var out = '', i = 0, n = src.length, e;
    while (i < n) {
      var c = src[i];
      if (c === '"') {
        var j = i + 1; while (j < n && src[j] !== '"') { if (src[j] === '\\') j++; j++; }
        out += src.slice(i, j + 1); i = j + 1;
      } else if (c === '/' && src[i + 1] === '/') {
        e = i; while (e < n && src[e] !== '\n' && src[e] !== '\r') e++;
        out += new Array(e - i + 1).join(' '); i = e;
      } else if (c === '/' && src[i + 1] === '*') {
        e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2;
        out += src.slice(i, e).replace(/[^\n\r]/g, ' '); i = e;
      } else { out += c; i++; }
    }
    var res = '', inStr = false;
    for (i = 0; i < out.length; i++) {
      c = out[i];
      if (inStr) { res += c; if (c === '\\') { res += out[++i] || ''; } else if (c === '"') inStr = false; continue; }
      if (c === '"') { inStr = true; res += c; continue; }
      if (c === ',') {
        var k = i + 1; while (k < out.length && /\s/.test(out[k])) k++;
        if (out[k] === '}' || out[k] === ']') { res += ' '; continue; }
      }
      res += c;
    }
    return res;
  }

  function squeeze(s) {
    var out = '', inStr = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (inStr) { out += c; if (c === '\\') out += s[++i] || ''; else if (c === '"') inStr = false; continue; }
      if (c === '"') { inStr = true; out += c; continue; }
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') continue;
      out += c;
    }
    return out;
  }

  // Small strict JSON checker that reports where the first problem is.
  function validate(s) {
    var i = 0, n = s.length;
    function ws() { while (i < n && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r')) i++; }
    function fail(msg, p) { var e = new Error(msg); e.pos = p === undefined ? i : p; throw e; }
    function str() {
      i++;
      while (i < n) {
        var c = s[i];
        if (c === '"') { i++; return; }
        if (c === '\\') {
          var d = s[i + 1];
          if (d && '"\\/bfnrt'.indexOf(d) > -1) i += 2;
          else if (d === 'u' && /^[0-9a-fA-F]{4}$/.test(s.substr(i + 2, 4))) i += 6;
          else fail('Bad escape sequence in a string');
        } else if (c < ' ') fail('Line break or control character inside a string');
        else i++;
      }
      fail('Unterminated string');
    }
    function num() {
      var m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i, i + 400));
      if (!m) fail('Invalid number');
      i += m[0].length;
    }
    function val() {
      ws();
      if (i >= n) fail('Unexpected end of input');
      var c = s[i];
      if (c === '{') {
        i++; ws(); if (s[i] === '}') { i++; return; }
        for (;;) {
          ws(); if (i >= n) fail('Unexpected end of input');
          if (s[i] !== '"') fail('Expected a double-quoted property name');
          str(); ws();
          if (s[i] !== ':') fail(i >= n ? 'Unexpected end of input' : "Expected ':' after the property name");
          i++; val(); ws();
          if (s[i] === ',') { i++; continue; }
          if (s[i] === '}') { i++; return; }
          fail(i >= n ? 'Unexpected end of input' : "Expected ',' or '}'");
        }
      }
      if (c === '[') {
        i++; ws(); if (s[i] === ']') { i++; return; }
        for (;;) {
          val(); ws();
          if (s[i] === ',') { i++; continue; }
          if (s[i] === ']') { i++; return; }
          fail(i >= n ? 'Unexpected end of input' : "Expected ',' or ']'");
        }
      }
      if (c === '"') return str();
      if (c === '-' || (c >= '0' && c <= '9')) return num();
      var lit = /^(true|false|null)/.exec(s.slice(i, i + 5));
      if (lit) { i += lit[0].length; return; }
      fail("Unexpected character '" + c + "'");
    }
    try { val(); ws(); if (i < n) fail('Unexpected content after the end of the JSON'); }
    catch (e) { if (e.pos === undefined) throw e; return { pos: e.pos, msg: e.message }; }
    return null;
  }

  function sortKeys(v) {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === 'object') { var o = Object.create(null); Object.keys(v).sort().forEach(function (k) { o[k] = sortKeys(v[k]); }); return o; }
    return v;
  }

  function minify(src, o) {
    o = o || {};
    var text = String(src).replace(/^\uFEFF/, '');
    if (!text.trim()) return '';
    var cleaned = o.jsonc ? clean(text) : text;
    var err = validate(cleaned);
    if (err) {
      var lines = cleaned.slice(0, err.pos).split(/\r\n?|\n/), line = lines.length, col = lines[lines.length - 1].length + 1;
      throw new Error('Invalid JSON at line ' + line + ', column ' + col + '. ' + err.msg + '.');
    }
    return o.sort ? JSON.stringify(sortKeys(JSON.parse(cleaned))) : squeeze(cleaned);
  }

  window.Minify.json = minify;
  window.Tools.json = {
    id: 'json', name: 'JSON Minifier', ext: 'json', accept: '.json,.jsonc,application/json',
    blurb: 'Checks your JSON is valid, then removes all the whitespace. Numbers and strings are copied exactly as written. Errors point to the line and column.',
    options: [
      { id: 'jsonc', label: 'Allow comments and trailing commas (JSONC)', default: true },
      { id: 'sort', label: 'Sort keys A to Z (re-serialises; very large numbers may lose precision)', default: false }
    ],
    sample: '{\n  // App settings\n  "name": "demo-service",\n  "version": "1.2.0",\n  "port": 8080,\n  "debug": false,\n  "limits": { "maxUsers": 12345678901234567890, "ratio": 0.50 },\n  "tags": [ "api", "internal", ],\n  "note": "keeps   spaces  inside strings"\n}\n',
    minify: minify,
    render: function (el) { App.toolUI(el, this); }
  };
})();
