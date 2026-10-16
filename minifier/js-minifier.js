/* js-minifier.js: JavaScript Minifier
   Safe minifier: removes comments and unneeded whitespace. It keeps a line break wherever removing it
   could change behaviour (automatic semicolon insertion) and never renames variables.
   Registers Minify.js and Tools.js; the page is drawn when the tool is opened. */
(function () {
  window.Minify = window.Minify || {};
  window.Tools = window.Tools || {};

  var PUNCT = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**'];
  var KW = { 'return': 1, 'typeof': 1, 'instanceof': 1, 'in': 1, 'of': 1, 'new': 1, 'delete': 1, 'void': 1, 'throw': 1, 'case': 1, 'do': 1, 'else': 1, 'yield': 1, 'await': 1 };
  var NUM = /^(?:0[xXoObB][\da-fA-F_]+n?|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?)/;
  var IDENT = /^[A-Za-z_$\u0080-\uffff\\][\w$\u0080-\uffff\\]*/;
  var NLRE = /[\n\r\u2028\u2029]/;
  var isW = function (ch) { return /[\w$\\]/.test(ch) || ch.charCodeAt(0) > 127; };

  function scanString(s, i) {
    var q = s[i], j = i + 1;
    while (j < s.length && s[j] !== q) { if (s[j] === '\\') j++; if (/[\n\r]/.test(s[j]) && s[j - 1] !== '\\') throw new Error('Unterminated string'); j++; }
    if (j >= s.length) throw new Error('Unterminated string');
    return j + 1;
  }
  function scanTemplate(s, i) {
    var j = i + 1;
    while (j < s.length) {
      var c = s[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '`') return j + 1;
      if (c === '$' && s[j + 1] === '{') {
        var d = 1; j += 2;
        while (j < s.length && d) {
          var x = s[j];
          if (x === '{') d++; else if (x === '}') d--;
          else if (x === '"' || x === "'") { j = scanString(s, j); continue; }
          else if (x === '`') { j = scanTemplate(s, j); continue; }
          else if (x === '/' && s[j + 1] === '/') { while (j < s.length && s[j] !== '\n') j++; continue; }
          else if (x === '/' && s[j + 1] === '*') { j = s.indexOf('*/', j + 2); if (j < 0) throw new Error('Unterminated comment'); j += 2; continue; }
          j++;
        }
        continue;
      }
      j++;
    }
    throw new Error('Unterminated template literal');
  }
  function regexAllowed(last) {
    if (!last) return true;
    if (last.t === 'n' || last.t === 's' || last.t === 'r') return false;
    if (last.t === 'i') return !!KW[last.v];
    return !(last.v === ')' || last.v === ']' || last.v === '++' || last.v === '--');
  }

  function tokenize(src, o) {
    var toks = [], i = 0, n = src.length, nl = false, last = null;
    function push(t, v) { var k = { t: t, v: v, nl: nl }; nl = false; toks.push(k); if (t !== 'c') last = k; }
    function keepable(cm) { return o.license && (/^\/[*\/]!/.test(cm) || /@(license|preserve|cc_on)\b/i.test(cm)); }
    if (src.slice(0, 2) === '#!') { var e0 = src.search(/[\n\r]/); if (e0 < 0) e0 = n; push('c', src.slice(0, e0)); i = e0; }
    while (i < n) {
      var c = src[i], c2 = src[i + 1], m;
      if (c === ' ' || c === '\t' || c === '\v' || c === '\f' || c === '\u00a0' || c === '\ufeff') { i++; continue; }
      if (NLRE.test(c)) { nl = true; i++; continue; }
      if (c === '/' && c2 === '/') {
        var e = i; while (e < n && !NLRE.test(src[e])) e++;
        var lc = src.slice(i, e);
        if (keepable(lc)) { push('c', lc); nl = true; }
        i = e; continue;
      }
      if (c === '/' && c2 === '*') {
        var e2 = src.indexOf('*/', i + 2); if (e2 < 0) throw new Error('Unterminated comment');
        var bc = src.slice(i, e2 + 2);
        if (keepable(bc)) { push('c', bc); nl = true; }
        else if (NLRE.test(bc)) nl = true;
        i = e2 + 2; continue;
      }
      if (c === '"' || c === "'") { var se = scanString(src, i); push('s', src.slice(i, se)); i = se; continue; }
      if (c === '`') { var te = scanTemplate(src, i); push('s', src.slice(i, te)); i = te; continue; }
      if (c === '/' && regexAllowed(last)) {
        var j = i + 1, cls = false, ok = false;
        while (j < n) {
          var ch = src[j];
          if (NLRE.test(ch)) break;
          if (ch === '\\') { j += 2; continue; }
          if (ch === '[') cls = true; else if (ch === ']') cls = false;
          else if (ch === '/' && !cls) { ok = true; break; }
          j++;
        }
        if (ok) {
          j++; while (j < n && /[a-z]/i.test(src[j])) j++;
          push('r', src.slice(i, j)); i = j; continue;
        }
      }
      var rest = src.slice(i, i + 64);
      if ((c >= '0' && c <= '9') || (c === '.' && c2 >= '0' && c2 <= '9')) {
        m = NUM.exec(src.slice(i, i + 80)); if (m) { push('n', m[0]); i += m[0].length; continue; }
      }
      if (c === '#' && IDENT.test(src.slice(i + 1, i + 2))) {
        m = IDENT.exec(src.slice(i + 1, i + 200)); push('i', '#' + m[0]); i += 1 + m[0].length; continue;
      }
      m = IDENT.exec(rest.length < 64 ? rest : src.slice(i, i + 400));
      if (m) { push('i', m[0]); i += m[0].length; continue; }
      var hit = null;
      for (var p = 0; p < PUNCT.length; p++) {
        if (rest.indexOf(PUNCT[p]) === 0) { hit = PUNCT[p]; break; }
      }
      if (hit === '?.' && src[i + 2] >= '0' && src[i + 2] <= '9') hit = null;
      if (hit) { push('p', hit); i += hit.length; continue; }
      push('p', c); i++;
    }
    return toks;
  }

  function needSpace(a, b) {
    var x = a.v[a.v.length - 1], y = b.v[0];
    if (isW(x) && isW(y)) return true;
    if ((x === '+' && y === '+') || (x === '-' && y === '-')) return true;
    if (x === '/' && (y === '/' || y === '*')) return true;
    if (a.t === 'n' && y === '.') return true;
    if (a.t === 'r' && isW(y)) return true;
    if ((x === '<' && y === '!') || (x === '-' && y === '>')) return true;
    return false;
  }
  var PREV_OK = '{([,;:?=<>*%&|^~!+-./';
  var NEXT_OK = ')]},;:?=.*/%&|^<>+-([';
  function canDrop(a, b) {
    if (a.t === 'p' && a.v !== '++' && a.v !== '--' && PREV_OK.indexOf(a.v[a.v.length - 1]) > -1) return true;
    if (b.t === 'p' && b.v !== '++' && b.v !== '--' && NEXT_OK.indexOf(b.v[0]) > -1) return true;
    if (a.v === '}' && b.t === 'i' && /^(else|catch|finally)$/.test(b.v)) return true;
    return false;
  }

  function minify(src, o) {
    o = o || {};
    var toks = tokenize(String(src), o), out = '', prev = null;
    for (var k = 0; k < toks.length; k++) {
      var t = toks[k];
      if (t.t === 'c') { out += (out && out.charAt(out.length - 1) !== '\n' ? '\n' : '') + t.v + '\n'; prev = null; continue; }
      if (prev) {
        if (t.nl && !canDrop(prev, t)) out += '\n';
        else if (needSpace(prev, t)) out += ' ';
      }
      out += t.v; prev = t;
    }
    return out.replace(/\n+$/, '');
  }

  window.Minify.js = minify;
  window.Tools.js = {
    id: 'js', name: 'JavaScript Minifier', ext: 'js', accept: '.js,.mjs,text/javascript',
    blurb: 'Removes comments and unneeded whitespace without changing what your code does. It keeps a line break wherever removing it could alter behaviour, and it does not rename variables.',
    options: [
      { id: 'license', label: 'Keep license comments (/*! */, @license, @preserve)', default: true }
    ],
    sample: '/*! greet.js v1.0 | MIT */\n// Say hello to someone\nfunction greet(name, punctuation = "!") {\n  const message = `Hello, ${name}${punctuation}`; // build it\n  if (message.length > 0) {\n    console.log(message);\n  }\n  return message\n}\n\nconst names = ["Asha", "Ravi"]\nnames.forEach((n) => {\n  greet(n)\n})\n',
    minify: minify,
    render: function (el) { App.toolUI(el, this); }
  };
})();
