/* contributing.js: CONTRIBUTING.md
   Registers itself on window.Templates and is loaded when the file is opened. */
(function () {
  window.Templates = window.Templates || {};
  window.Templates.contributing = {
    id: 'contributing',
    file: 'CONTRIBUTING.md',
    label: 'CONTRIBUTING.md',
    blurb: 'Tells people how to report bugs, suggest ideas and send changes. Fill in your real commands so a newcomer can get running in minutes.',
    fields: [
      { id: 'install', label: 'Install command', type: 'text', placeholder: 'npm install' },
      { id: 'test', label: 'Test command', type: 'text', placeholder: 'npm test' },
      { id: 'lint', label: 'Lint or format command (optional)', type: 'text', placeholder: 'npm run lint' },
      { id: 'conventional', label: 'Ask for Conventional Commits', type: 'checkbox', default: true },
      { id: 'goodfirst', label: 'Point newcomers to "good first issue"', type: 'checkbox', default: true }
    ],
    check: function (v) {
      var m = [];
      if (!v.install && !v.test) m.push('Add your install and test commands so contributors can get started.');
      return m;
    },
    generate: function (v) {
      var L = [], code = function (c) { return ['', '   ```bash', '   ' + c, '   ```', '']; };
      var issues = v.repo ? '[Open an issue](' + v.repo + '/issues)' : 'Open an issue';
      L.push('# Contributing to ' + v.project, '',
        'Thanks for taking the time to contribute! This guide explains how to report problems, suggest ideas and send changes.', '',
        'By taking part in this project you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).', '',
        '## Ways to contribute', '',
        '- **Report a bug.** ' + issues + ' and tell us what you expected, what happened, and how to reproduce it.',
        '- **Suggest a feature.** Describe the problem you want to solve before proposing a solution, so we can find the best approach together.',
        '- **Improve the documentation.** Fixes to wording, examples and typos are welcome.',
        '- **Send code.** Follow the steps below.', '',
        '> **Found a security problem?** Please don\u2019t open a public issue. See [SECURITY.md](SECURITY.md).', '',
        '## Getting set up', '',
        '1. Fork the repository and clone your fork:');
      L.push.apply(L, code('git clone https://github.com/<your-username>/' + v.repoName + '.git\n   cd ' + v.repoName));
      if (v.install) { L.push('2. Install the dependencies:'); L.push.apply(L, code(v.install)); }
      else L.push('2. Install the project\u2019s dependencies.', '');
      if (v.test) { L.push('3. Run the tests to check that everything works:'); L.push.apply(L, code(v.test)); }
      else L.push('3. Run the tests to check that everything works.', '');
      L.push('## Making a change', '', '1. Create a branch from `' + v.branch + '`:');
      L.push.apply(L, code('git checkout -b my-change'));
      L.push('2. Make your change. Keep it focused: one pull request should do one thing.',
        '3. Add or update tests where it makes sense.',
        '4. Run the tests' + (v.lint ? ' and `' + v.lint + '`' : '') + ' before you push.',
        '5. Commit with a clear message' + (v.conventional ? ' (see below)' : '') + '.',
        '6. Push your branch and open a pull request against `' + v.branch + '`.', '',
        '## Pull request checklist', '',
        '- [ ] The change does one thing, and the description explains why',
        '- [ ] Tests pass locally',
        '- [ ] Docs and [CHANGELOG.md](CHANGELOG.md) are updated if behaviour changed',
        '- [ ] No secrets, tokens or personal data are included', '');
      if (v.conventional) {
        L.push('## Commit messages', '',
          'We use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): short summary`.', '',
          '```text', 'feat(parser): support nested lists', 'fix: handle empty input', 'docs: clarify the install steps', '```', '',
          'Common types are `feat`, `fix`, `docs`, `refactor`, `test` and `chore`.', '');
      }
      L.push('## Review process', '',
        'Maintainers review pull requests as time allows. We may ask for changes; please don\u2019t take that personally, it is how we keep the project healthy. If you haven\u2019t heard back in a week or so, a polite nudge on the pull request is welcome.', '');
      if (v.goodfirst) {
        L.push('## Your first contribution', '',
          'New here? Look for issues labelled `good first issue`' + (v.repo ? ' ([see the list](' + v.repo + '/labels/good%20first%20issue))' : '') + '. Comment on one to say you\u2019d like to take it, and ask questions if anything is unclear.', '');
      }
      L.push('## Licensing', '',
        'By contributing, you agree that your contributions will be licensed under the ' + v.licenseName + ', the same license as the project.');
      return L.join('\n') + '\n';
    }
  };
})();
