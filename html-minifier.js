/* html-minifier.js: HTML Minifier
   Removes comments and extra whitespace, tidies attributes, and minifies inline <style>, <script>
   and JSON script blocks using the CSS, JS and JSON minifiers. Registers Minify.html and Tools.html. */
(function () {
  window.Minify = window.Minify || {};
  window.Tools = window.Tools || {};

  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
  var RAW = { script: 1, style: 1, textarea: 1, pre: 1 };
  var BLOCK = {};
  ('address article aside base blockquote body br caption center col colgroup dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html legend li link main menu meta nav noscript ol optgroup option p script section style summary table tbody td template tfoot th thead title tr ul').split(' ').forEach(function (t) { BLOCK[t] = 1; });
  var BOOL = {}; ('allowfullscreen async autofocus autoplay checked controls defer disabled formnovalidate hidden inert ismap itemscope loop multiple muted nomodule novalidate open playsinline readonly required reversed selected').split(' ').forEach(function (a) { BOOL[a] = 1; });
  var JSON_TYPES = /^(application\/(ld\+)?json|importmap|speculationrules)$/i;
  var JS_TYPES = /^(|module|(text|application)\/(x-)?(javascript|ecmascript))$/i;

  function parseAttrs(s) {
    var re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g, a = [], m;
    while ((m = re.exec(s))) a.push({ n: m[1], v: m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]) });
    return a;
  }

  function tokenize(src) {
    var toks = [], i = 0, n = src.length, buf = '';
    function flush() { if (buf) { toks.push({ k: 'text', v: buf }); buf = ''; } }
    while (i < n) {
      var lt = src.indexOf('<', i);
      if (lt < 0) { buf += src.slice(i); break; }
      buf += src.slice(i, lt); i = lt;
      var e;
      if (src.substr(i, 4) === '<!--') {
        e = src.indexOf('-->', i + 4); e = e < 0 ? n : e + 3; flush(); toks.push({ k: 'comment', v: src.slice(i, e) }); i = e; continue;
      }
      if (src.substr(i, 9) === '<![CDATA[') {
        e = src.indexOf(']]>', i); e = e < 0 ? n : e + 3; buf += src.slice(i, e); i = e; continue;
      }
      if (/^<![a-z]/i.test(src.substr(i, 3)) || src.substr(i, 2) === '<?') {
        e = src.indexOf('>', i); e = e < 0 ? n : e + 1; flush(); toks.push({ k: 'doctype', v: src.slice(i, e) }); i = e; continue;
      }
      var cl = /^<\/([a-zA-Z][^\s>\/]*)[^>]*>/.exec(src.slice(i, i + 200));
      if (cl) { flush(); toks.push({ k: 'close', name: cl[1].toLowerCase() }); i += cl[0].length; continue; }
      var m = /^<([a-zA-Z][^\s\/>]*)/.exec(src.slice(i, i + 100));
      if (!m) { buf += '<'; i++; continue; }
      var j = i + m[0].length;
      while (j < n && src[j] !== '>') {
        if (src[j] === '"' || src[j] === "'") { var q = src.indexOf(src[j], j + 1); if (q < 0) { j = n; break; } j = q; }
        j++;
      }
      var attrStr = src.slice(i + m[0].length, j), name = m[1].toLowerCase();
      flush();
      var tok = { k: 'open', name: name, attrs: parseAttrs(attrStr), self: /\/\s*$/.test(attrStr) && !/=\s*[^\s"']*\/\s*$/.test(attrStr) };
      toks.push(tok); i = j + 1;
      if (RAW[name] && !tok.self) {
        var re = new RegExp('</' + name + '\\s*>', 'i'), rest = src.slice(i), mm = re.exec(rest);
        var idx = mm ? mm.index : rest.length;
        toks.push({ k: 'raw', name: name, v: rest.slice(0, idx) });
        if (mm) { toks.push({ k: 'close', name: name }); i += idx + mm[0].length; } else i = n;
      }
    }
    flush();
    return toks;
  }

  function attrValue(v, o) {
    if (v === '') return '=""';
    if (o.unquote && /^[^\s"'=<>`]+$/.test(v) && !/\/$/.test(v)) return '=' + v;
    if (v.indexOf('"') < 0) return '="' + v + '"';
    if (v.indexOf("'") < 0) return "='" + v + "'";
    return '="' + v.replace(/"/g, '&quot;') + '"';
  }

  function openTag(t, o) {
    var out = '<' + t.name;
    t.attrs.forEach(function (a) {
      var n = a.n, ln = n.toLowerCase(), v = a.v;
      if (v !== undefined && o.attrs) {
        if (ln === 'class') { v = v.trim().replace(/\s+/g, ' '); if (v === '') return; }
        else if (ln === 'style') {
          if (window.Minify.css && !/[{}]/.test(v)) { try { v = window.Minify.css('x{' + v + '}', { colors: true, zeros: true }).replace(/^x\{|\}$/g, ''); } catch (e) {} }
          else v = v.trim().replace(/\s+/g, ' ');
          if (v === '') return;
        }
        else if (ln === 'href' || ln === 'src' || ln === 'action') v = v.trim();
        if (v.toLowerCase() === ln || (v === '' && BOOL[ln])) { out += ' ' + n; return; }
        if (t.name === 'script' && ln === 'type' && /^(text|application)\/javascript$/i.test(v)) return;
        if (t.name === 'script' && ln === 'language') return;
        if ((t.name === 'style' || t.name === 'link') && ln === 'type' && /^text\/css$/i.test(v)) return;
      }
      out += v === undefined ? ' ' + n : ' ' + n + attrValue(v, o);
    });
    return out + (t.self && !VOID[t.name] ? '/>' : '>');
  }

  function rawContent(open, v, o) {
    var name = open.name;
    if (name === 'style' && o.css && window.Minify.css) {
      try { return window.Minify.css(v, { bang: true, colors: true, zeros: true, empty: true }); } catch (e) {}
    }
    if (name === 'script') {
      var type = '', hasSrc = false;
      open.attrs.forEach(function (a) { if (a.n.toLowerCase() === 'type') type = (a.v || '').trim(); if (a.n.toLowerCase() === 'src') hasSrc = true; });
      if (!hasSrc && o.js && window.Minify.js && JS_TYPES.test(type)) { try { return window.Minify.js(v, { license: true }); } catch (e) {} }
      if (!hasSrc && o.js && window.Minify.json && JSON_TYPES.test(type)) { try { return window.Minify.json(v, { jsonc: false }); } catch (e) {} }
    }
    return name === 'style' || name === 'script' ? v.trim() : v;
  }

  function minify(src, o) {
    o = o || {};
    var toks = tokenize(String(src));
    if (o.comments) {
      toks = toks.filter(function (t) { return t.k !== 'comment' || /^<!--\s*(\[if|<!\[endif|!)/i.test(t.v) || /^<!--\[if/i.test(t.v); });
      var merged = [];
      toks.forEach(function (t) { var l = merged[merged.length - 1]; if (t.k === 'text' && l && l.k === 'text') l.v += t.v; else merged.push({ k: t.k, v: t.v, name: t.name, attrs: t.attrs, self: t.self }); });
      toks = merged;
    }
    var edge = function (t) { return !t || ((t.k === 'open' || t.k === 'close') && BLOCK[t.name]) || t.k === 'doctype' || t.k === 'comment'; };
    var out = '', lastOpen = null;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (t.k === 'open') { out += openTag(t, o); lastOpen = t; }
      else if (t.k === 'close') out += '</' + t.name + '>';
      else if (t.k === 'raw') out += rawContent(lastOpen, t.v, o);
      else if (t.k === 'comment') out += t.v;
      else if (t.k === 'doctype') out += /^<!doctype\s+html\s*>$/i.test(t.v) ? '<!doctype html>' : t.v;
      else {
        var v = t.v;
        if (o.collapse) {
          v = v.replace(/[ \t\r\n\f]+/g, ' ');
          var prev = toks[i - 1], next = toks[i + 1];
          if (edge(prev)) v = v.replace(/^ /, '');
          if (edge(next)) v = v.replace(/ $/, '');
        }
        out += v;
      }
    }
    return out;
  }

  window.Minify.html = minify;
  window.Tools.html = {
    id: 'html', name: 'HTML Minifier', ext: 'html', accept: '.html,.htm,text/html',
    blurb: 'Removes comments and extra whitespace, tidies attributes, and minifies inline CSS, JavaScript and JSON. Whitespace that affects how text sits next to inline elements, and everything inside <pre> and <textarea>, is left alone.',
    options: [
      { id: 'comments', label: 'Remove comments (keeps IE conditional comments)', default: true },
      { id: 'collapse', label: 'Collapse whitespace', default: true },
      { id: 'attrs', label: 'Tidy attributes (drop redundant ones, disabled="disabled" to disabled)', default: true },
      { id: 'css', label: 'Minify inline CSS', default: true },
      { id: 'js', label: 'Minify inline JavaScript and JSON', default: true },
      { id: 'unquote', label: 'Remove quotes around simple attribute values', default: false }
    ],
    sample: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Demo page</title>\n  <style type="text/css">\n    /* page styles */\n    body { margin: 0px; font: 16px/1.5 sans-serif; }\n    .btn  { color: #ffffff; background: #800080; }\n  </style>\n</head>\n<body>\n  <!-- main heading -->\n  <h1 class="title   big">  Hello,   <em>world</em>!  </h1>\n\n  <p>\n    Read the <a href=" /docs ">docs</a> or\n    <a href="/about">learn more</a>.\n  </p>\n\n  <input type="checkbox" checked="checked" disabled="disabled">\n  <pre>  keep\n     this   spacing </pre>\n\n  <script type="text/javascript">\n    // greet the user\n    function hi(name) {\n      console.log("Hello, " + name);\n    }\n    hi("world");\n  </script>\n</body>\n</html>\n',
    prepare: function () { return Promise.all([App.load('css'), App.load('js'), App.load('json')]); },
    minify: minify,
    render: function (el) { App.toolUI(el, this); }
  };
})();
