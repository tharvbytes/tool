/* license.js: LICENSE
   Uses the same license templates as the Template Generator (MIT.js, apache.js, gnu-gpl.js, bsd3.js).
   The one you pick above is loaded on demand. */
(function () {
  window.Templates = window.Templates || {};
  window.Templates.license = {
    id: 'license',
    file: 'LICENSE',
    label: 'LICENSE',
    blurb: 'The full text of the license you picked above, with your name and year filled in. Choose the license in the Project panel.',
    fields: [],
    prepare: function (v) { return App.load(App.LICENSES[v.license].tpl); },
    check: function (v) {
      var m = [];
      if (!v.owner) m.push('Add your name or organisation so the copyright line is complete.');
      if (v.license === 'gpl' || v.license === 'apache') m.push('For ' + v.licenseName + ', the copyright line goes in a header at the top of each source file. Use the Template Generator for that snippet.');
      return m;
    },
    generate: function (v) {
      var m = App.LICENSES[v.license];
      return window.Templates[m.tpl].text({ name: v.owner, year: v.year, variant: m.variant || '3' });
    }
  };
})();
