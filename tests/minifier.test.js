const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = vm.createContext({ window: {} });
const directory = path.join(__dirname, '..');

['css-minifier.js', 'js-minifier.js', 'json-minifier.js', 'html-minifier.js'].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(directory, file), 'utf8'), context, { filename: file });
});

const { Minify, Tools } = context.window;

Object.keys(Tools).forEach((id) => {
  const tool = Tools[id];
  const options = Object.fromEntries(tool.options.map((option) => [option.id, option.default]));
  const output = tool.minify(tool.sample, options);

  assert.ok(output.length > 0, `${id} sample should produce output`);
  assert.ok(Buffer.byteLength(output) < Buffer.byteLength(tool.sample), `${id} sample should be smaller`);
});

assert.match(Minify.json('{"large":12345678901234567890}', { jsonc: false }), /12345678901234567890/);
assert.throws(
  () => Minify.json('{\r\n  "x": }', { jsonc: false }),
  /Invalid JSON at line 2, column 8/
);
assert.throws(
  () => Minify.json('{\r  "x": }', { jsonc: false }),
  /Invalid JSON at line 2, column 8/
);

const sorted = Minify.json('{"z":1,"__proto__":{"polluted":true},"a":2}', { jsonc: false, sort: true });
const sortedValue = JSON.parse(sorted);
assert.deepStrictEqual(Object.keys(sortedValue), ['__proto__', 'a', 'z']);
assert.strictEqual(sortedValue.__proto__.polluted, true);
assert.strictEqual({}.polluted, undefined);

const asiInput = 'function f(){return\n5;} f()';
assert.strictEqual(new Function(Minify.js(asiInput, {}))(), undefined);

const css = Minify.css('a { content: "  x ; #ffffff"; background: url( "x y.png" ); color: #aabbcc; }', {
  bang: true, colors: true, zeros: true, empty: true
});
assert.ok(css.includes('"  x ; #ffffff"'));
assert.ok(css.includes('url("x y.png")'));
assert.ok(css.includes('color:#abc'));

const html = Minify.html('<pre> x  \n y </pre>', {
  comments: true, collapse: true, attrs: true, css: true, js: true, unquote: false
});
assert.strictEqual(html, '<pre> x  \n y </pre>');

console.log('Minifier regression checks passed.');
