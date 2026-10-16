/* MIT.js: MIT License
   License text comes from the choosealicense.com / SPDX templates.
   Registers itself on window.Templates and draws its own page when opened. */
(function () {
  var TEXT = "MIT License\n\nCopyright (c) [year] [fullname]\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n";
  window.Templates = window.Templates || {};
  window.Templates.mit = {
    id: 'mit',
    name: "MIT License",
    filename: 'LICENSE',
    blurb: "Short and simple. Anyone can use, change and sell your code as long as they keep your copyright notice. A common default for libraries and tools.",
    summary: {"permissions": ["Commercial use", "Modification", "Distribution", "Private use"], "conditions": ["License and copyright notice"], "limitations": ["Liability", "Warranty"]},
    fields: [],
    ghTemplate: function (v) { return 'mit'; },
    text: function (v) {
      return TEXT.replace('[year]', v.year).replace('[fullname]', v.name || '[fullname]');
    },
    extras: function (v) {
      return null;
    },
    render: function (el) { App.licenseUI(el, this); }
  };
})();
