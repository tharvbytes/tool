/* changelog.js: CHANGELOG.md (Keep a Changelog 1.1.0 format)
   Registers itself on window.Templates and is loaded when the file is opened. */
(function () {
  window.Templates = window.Templates || {};
  window.Templates.changelog = {
    id: 'changelog',
    file: 'CHANGELOG.md',
    label: 'CHANGELOG.md',
    blurb: 'A human-readable history of changes in the Keep a Changelog format, ready for your first release. Add a line under "Unreleased" as you work.',
    fields: [
      { id: 'version', label: 'First version', type: 'text', default: '0.1.0' },
      { id: 'date', label: 'Release date', type: 'text', default: new Date().toISOString().slice(0, 10) },
      { id: 'notes', label: 'What\u2019s in it (one per line)', type: 'textarea', default: 'Initial release.' },
      { id: 'tag', label: 'Git tag prefix', type: 'text', default: 'v' },
      { id: 'links', label: 'Add compare and release links', type: 'checkbox', default: true }
    ],
    check: function (v) {
      var m = [];
      if (!/^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/.test((v.version || '').trim())) m.push('Use a semantic version such as 0.1.0 or 1.0.0.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test((v.date || '').trim())) m.push('Write the date as YYYY-MM-DD.');
      if (v.links && !v.repo) m.push('Add your repository URL above to include the links.');
      return m;
    },
    generate: function (v) {
      var ver = (v.version || '0.1.0').trim(), date = (v.date || v.today).trim(), tag = (v.tag || '') + ver;
      var useLinks = v.links && v.repo;
      var notes = String(v.notes || '').split('\n').map(function (l) { return l.trim().replace(/^[-*]\s+/, ''); }).filter(Boolean);
      if (!notes.length) notes = ['Initial release.'];
      var L = ['# Changelog', '',
        'All notable changes to this project will be documented in this file.', '',
        'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),',
        'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).', '',
        useLinks ? '## [Unreleased]' : '## Unreleased', '',
        (useLinks ? '## [' + ver + ']' : '## ' + ver) + ' - ' + date, '', '### Added', ''];
      notes.forEach(function (n) { L.push('- ' + n); });
      if (useLinks) L.push('', '[Unreleased]: ' + v.repo + '/compare/' + tag + '...HEAD', '[' + ver + ']: ' + v.repo + '/releases/tag/' + tag);
      return L.join('\n') + '\n';
    }
  };
})();
