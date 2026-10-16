/* security.js: SECURITY.md
   Registers itself on window.Templates and is loaded when the file is opened. */
(function () {
  function lines(s) { return String(s || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean); }
  window.Templates = window.Templates || {};
  window.Templates.security = {
    id: 'security',
    file: 'SECURITY.md',
    label: 'SECURITY.md',
    blurb: 'Tells people which versions get fixes and how to report a vulnerability privately. GitHub shows this file on your repository\u2019s Security tab.',
    fields: [
      { id: 'supported', label: 'Supported versions (one per line)', type: 'textarea', default: '1.x' },
      { id: 'unsupported', label: 'Unsupported versions (one per line)', type: 'textarea', default: '< 1.0' },
      { id: 'private', label: 'Offer GitHub private vulnerability reporting', type: 'checkbox', default: true },
      { id: 'ack', label: 'Acknowledge within (business days)', type: 'text', default: '3' },
      { id: 'fixdays', label: 'Aim to fix within (days)', type: 'text', default: '90' },
      { id: 'credit', label: 'Offer to credit reporters', type: 'checkbox', default: true },
      { id: 'harbor', label: 'Include a good-faith safe-harbor note', type: 'checkbox', default: false }
    ],
    check: function (v) {
      var m = [];
      if (!v.email && !(v.private && v.repo)) m.push('Add a contact email, or your repository URL for private reporting, so people can reach you.');
      if (v.private && !v.repo) m.push('Add your repository URL above to include the private reporting link.');
      return m;
    },
    generate: function (v) {
      var L = ['# Security Policy', '', '## Supported versions', '',
        'Security fixes are provided for the versions marked below.', '',
        '| Version | Supported |', '| ------- | --------- |'];
      var sup = lines(v.supported), uns = lines(v.unsupported);
      sup.forEach(function (x) { L.push('| ' + x + ' | Yes |'); });
      uns.forEach(function (x) { L.push('| ' + x + ' | No |'); });
      if (!sup.length && !uns.length) L.push('| latest release | Yes |');
      L.push('', '## Reporting a vulnerability', '',
        '**Please don\u2019t report security vulnerabilities through public issues, discussions or pull requests.**', '',
        'Report it privately instead:', '');
      var ways = 0;
      if (v.private && v.repo) { L.push('- Use GitHub\u2019s private vulnerability reporting: [report a vulnerability](' + v.repo + '/security/advisories/new).'); ways++; }
      if (v.email) { L.push('- Email ' + v.email + '.'); ways++; }
      if (!ways) L.push('- Email <your security contact address>.');
      L.push('', 'Please include as much of the following as you can:', '',
        '- A description of the problem and its impact',
        '- Steps to reproduce it, or a proof of concept',
        '- The affected version, and your environment',
        '- Any ideas for a fix', '',
        '## What to expect', '',
        '- We will acknowledge your report within ' + (v.ack || '3') + ' business days.',
        '- We will confirm whether it is a valid issue and keep you updated on progress.',
        '- For confirmed vulnerabilities we aim to release a fix within ' + (v.fixdays || '90') + ' days, depending on severity and complexity.',
        v.credit ? '- When the fix is released we will publish a security advisory and, if you wish, credit you for the find.' : '- When the fix is released we will publish a security advisory.', '',
        '## Disclosure policy', '',
        'We follow coordinated disclosure. Please give us a reasonable chance to fix the problem before you share details publicly, and we will tell you when it is safe to do so.');
      if (v.harbor) {
        L.push('', '## Safe harbor', '',
          'We will not pursue action against researchers who act in good faith: they avoid privacy violations and service disruption, only test against their own accounts or data, and report what they find to us promptly.');
      }
      return L.join('\n') + '\n';
    }
  };
})();
