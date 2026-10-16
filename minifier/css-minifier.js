/* css-minifier.js: CSS Minifier
   Removes comments and whitespace, shortens colours and zero values, drops empty rules.
   Registers Minify.css and Tools.css; the page is drawn when the tool is opened. */
(function () {
  window.Minify = window.Minify || {};
  window.Tools = window.Tools || {};

  // Pull out strings, url(...) and escapes so later steps can't touch them.
  function protect(src, o) {
    var keep = [], cmark = {}, out = '', i = 0, n = src.length;
    function tok(s) { keep.push(s); return '\uE000' + (keep.length - 1) + '\uE001'; }
    while (i < n) {
      var c = src[i];
      if (c === '/' && src[i + 1] === '*') {
        var e = src.indexOf('*/', i + 2); if (e < 0) e = n - 2;
        var cm = src.slice(i, e + 2);
        if (o.bang && cm[2] === '!') { out += tok(cm + '\n'); cmark[keep.length - 1] = true; } else out += ' ';
        i = e + 2;
      } else if (c === '"' || c === "'") {
        var j = i + 1;
        while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
        out += tok(src.slice(i, j + 1)); i = j + 1;
      } else if (c === '\\') {
        out += tok(src.slice(i, i + 2)); i += 2;
      } else if ((c === 'u' || c === 'U') && /^url\(/i.test(src.substr(i, 4)) && !/[\w-]/.test(src[i - 1] || ' ')) {
        var k = i + 4; while (/\s/.test(src[k] || '')) k++;
        if (src[k] === '"' || src[k] === "'") { out += src.substr(i, 4); i += 4; }
        else {
          var m = k; while (m < n && src[m] !== ')') { if (src[m] === '\\') m++; m++; }
          out += tok('url(' + src.slice(k, m).trim() + ')'); i = m + 1;
        }
      } else { out += c; i++; }
    }
    return { code: out, keep: keep, cmark: cmark };
  }

  function prelude(p) {
    p = p.replace(/\s+/g, ' ');
    if (p[0] === '@') {
      return p.replace(/\s*,\s*/g, ',').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*:\s*/g, ':');
    }
    return p.replace(/\s*([,>~+])\s*/g, '$1').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
      .replace(/\[\s+/g, '[').replace(/\s+\]/g, ']').replace(/\s*([~|^$*]?=)\s*/g, '$1');
  }

  function decl(s, o) {
    var i = s.indexOf(':');
    if (i < 0) return s.replace(/\s+/g, ' ');
    var prop = s.slice(0, i).trim(), val = s.slice(i + 1).trim().replace(/\s+/g, ' ');
    if (!prop && !val) return '';
    if (prop.slice(0, 2) === '--') return prop + ':' + val;
    val = val.replace(/\s*,\s*/g, ',').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*!\s*important/ig, '!important');
    if (o.zeros && prop.toLowerCase() !== 'flex' && !/(calc|clamp|min|max|var|env|attr)\(/i.test(val)) {
      val = val.replace(/(^|[\s,(\/])-?(?:0*\.0+|0+(?:\.0+)?)(?:px|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pt|pc|q)(?![\w%.-])/gi, '$10');
    }
    val = val.replace(/(^|[\s,(\/:])(-?)0+\.(\d)/g, '$1$2.$3');
    if (o.colors) {
      val = val.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?:([0-9a-f])\4)?(?![0-9a-f\w])/gi, function (m, a, b, c, d) { return '#' + a + b + c + (d || ''); });
    }
    return prop + ':' + val;
  }

  function minify(src, o) {
    o = o || {};
    var p = protect(String(src), o), code = p.code, res = '', stmt = '', depth = 0, starts = [], needSemi = false;
    function flushDecl(s) {
      s = s.trim(); if (!s) return;
      var d = decl(s, o); if (!d) return;
      res += (needSemi ? ';' : '') + d; needSemi = true;
    }
    for (var i = 0; i < code.length; i++) {
      var c = code[i];
      if (c === '(') depth++; else if (c === ')') depth = Math.max(0, depth - 1);
      if (depth === 0 && (c === '{' || c === '}' || c === ';')) {
        if (c === '{') {
          if (needSemi) { res += ';'; needSemi = false; }
          starts.push(res.length);
          res += prelude(stmt.trim()) + '{';
        } else if (c === '}') {
          flushDecl(stmt);
          var st = starts.pop();
          if (o.empty && res.charAt(res.length - 1) === '{' && st !== undefined) res = res.slice(0, st);
          else res += '}';
          needSemi = false;
        } else {
          var s = stmt.trim();
          if (s) {
            if (s[0] === '@') { res += (needSemi ? ';' : '') + s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',') + ';'; needSemi = false; }
            else flushDecl(s);
          }
        }
        stmt = '';
      } else stmt += c;
    }
    if (stmt.trim()) res += stmt.trim();
    return res.replace(/\uE000(\d+)\uE001( ?)/g, function (m, i, sp) { return p.keep[+i] + (p.cmark[+i] ? '' : sp); }).replace(/^\s+|\s+$/g, '');
  }

  window.Minify.css = minify;
  window.Tools.css = {
    id: 'css', name: 'CSS Minifier', ext: 'css', accept: '.css,text/css',
    blurb: 'Strips comments and whitespace, shortens colours and zero values, and removes empty rules. Strings and url() values are never touched.',
    options: [
      { id: 'bang', label: 'Keep /*! license */ comments', default: true },
      { id: 'colors', label: 'Shorten hex colours (#aabbcc to #abc)', default: true },
      { id: 'zeros', label: 'Drop units from zero (0px to 0)', default: true },
      { id: 'empty', label: 'Remove empty rules', default: true }
    ],
    sample: '/*! Demo v1.0 | MIT */\n/* Layout */\n.card {\n  margin: 0px auto;\n  padding: 0.5em 1.25rem;\n  color: #ffffff;\n  background: #FF8800 url( "bg.png" ) no-repeat;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n}\n\n.card > .title , .card a:hover {\n  font: 700 16px/1.5 "Helvetica Neue", Arial, sans-serif;\n  transition: color .2s ease-in-out , background .2s;\n}\n\n.unused { }\n\n@media (min-width : 600px) {\n  .card { width: calc(100% - 2rem); }\n}\n',
    minify: minify,
    render: function (el) { App.toolUI(el, this); }
  };
})();
