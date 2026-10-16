(function () {
  'use strict';

  var tool = document.querySelector('body > .wrap');
  if (!tool) return;

  var titleNode = tool.querySelector('h1');
  var title = titleNode ? titleNode.textContent.trim() : document.title;
  var descriptionNode = document.querySelector('meta[name="description"]');
  var description = descriptionNode ? descriptionNode.content : '';
  if (!description) {
    var tag = tool.querySelector('.tag');
    description = tag ? tag.textContent.trim() : 'A practical tool for your everyday development work.';
  }
  var guide = {
  "what": "A hash generator computes a fixed-length digest from text or file bytes. A digest can help compare data, but is not encryption.",
  "how": "Choose a supported algorithm, enter text or select a file, and generate the digest. Compare it with a trusted expected value to verify integrity.",
  "input": "Text: hello\\nAlgorithm: SHA-256",
  "output": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  "uses": [
    "Checking whether a downloaded file matches a published digest",
    "Comparing content fingerprints",
    "Generating hashes for non-sensitive test data"
  ],
  "faqs": [
    {
      "q": "Is a hash reversible encryption?",
      "a": "No. Hashing produces a digest and is not a reversible encryption method."
    },
    {
      "q": "Which algorithm should I use for integrity checks?",
      "a": "Use a modern cryptographic hash such as SHA-256 when the publisher provides it. MD5 and SHA-1 are not recommended for security-sensitive collision resistance."
    },
    {
      "q": "Does a matching hash prove a download is safe?",
      "a": "It confirms the bytes match that digest. It does not establish that the publisher or file is trustworthy."
    }
  ],
  "how2Title": "How do you verify a downloaded file?",
  "how2": "Generate a digest for the file and compare it with a digest published by a trusted source over a trusted channel."
};

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  var style = document.createElement('style');
  style.textContent =
    ':root{--site-plum:#59247f;--site-plum-dark:#321344;--site-plum-light:#9060c2;--site-snow:#fbf9ff;--site-muted:#8f879c;--site-border:rgba(87,47,116,.14);--site-ink:#261a30;--site-lilac:#eee4f8;--site-shadow:0 18px 55px rgba(42,17,62,.12)}' +
    'html{scroll-behavior:smooth}body{height:auto!important;min-height:100%;overflow-x:hidden!important;overflow-y:auto!important;background:var(--site-snow)!important;color:var(--site-ink)!important;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;line-height:1.5!important;-webkit-font-smoothing:antialiased}' +
    '#ecosystemHeader{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:68px;padding:10px max(22px,calc((100vw - 1160px)/2));margin:0;border:0;border-bottom:1px solid var(--site-border);background:rgba(251,249,255,.94);backdrop-filter:blur(12px)}' +
    '.ecosystem-brand{display:flex;align-items:center;gap:10px;color:var(--site-plum-dark);font-size:17px;font-weight:780;letter-spacing:-.04em;text-decoration:none;white-space:nowrap}.ecosystem-mark{width:31px;height:31px;display:grid;place-items:center;border-radius:10px 10px 10px 3px;background:var(--site-plum-dark);color:#fff;box-shadow:3px 3px 0 #d7c0e9;font-size:14px}.ecosystem-brand small{display:block;color:var(--site-muted);font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;line-height:1.1}' +
    '.ecosystem-links{display:flex;align-items:center;gap:22px}.ecosystem-links a{color:#65566f;font-size:12px;font-weight:600;text-decoration:none}.ecosystem-links a:hover{color:var(--site-plum);text-decoration:underline;text-underline-offset:3px}.ecosystem-links .ecosystem-coffee{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border-radius:7px;background:var(--site-plum);color:#fff;box-shadow:0 4px 0 rgba(50,19,68,.12)}.ecosystem-links .ecosystem-coffee:hover{background:var(--site-plum-dark);text-decoration:none}' +
    '#ecosystemHome{width:min(1160px,calc(100% - 44px));margin:0 auto;padding:60px 0 72px;overflow:hidden}.ecosystem-hero-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:42px;align-items:center}.ecosystem-eyebrow,.ecosystem-kicker{display:inline-flex;align-items:center;gap:9px;color:var(--site-plum);font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.ecosystem-eyebrow:before{content:"";width:20px;height:2px;background:var(--site-plum-light)}' +
    '.ecosystem-hero-copy h2{font-size:clamp(38px,5vw,62px);line-height:1.02;letter-spacing:-.065em;color:var(--site-plum-dark);margin:18px 0 17px;font-weight:780}.ecosystem-hero-copy p{max-width:48ch;margin:0 0 23px;color:#6b6073;font-size:15px;line-height:1.75}.ecosystem-actions{display:flex;flex-wrap:wrap;gap:10px}.ecosystem-button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border:1px solid var(--site-plum);border-radius:7px;background:var(--site-plum);color:#fff;font-family:inherit;font-size:12px;font-weight:700;line-height:1.3;text-decoration:none;cursor:pointer;box-shadow:0 4px 0 rgba(50,19,68,.1);transition:transform .18s,background .18s}.ecosystem-button:hover{transform:translateY(-2px);background:var(--site-plum-dark)}.ecosystem-button.secondary{border-color:var(--site-border);background:#fff;color:var(--site-plum-dark);box-shadow:none}.ecosystem-button.secondary:hover{background:#f3ebfa}' +
    '.ecosystem-proof{margin-top:18px;color:var(--site-muted);font-size:10px}.ecosystem-proof:before{content:"";display:inline-block;width:6px;height:6px;margin:0 8px 1px 0;border-radius:50%;background:#6caa7c}' +
    '.ecosystem-visual{position:relative;min-width:0;padding:12px 8px 16px 14px}.ecosystem-visual:before{content:"";position:absolute;inset:4% 0 1% 9%;z-index:-1;border-radius:42% 35% 39% 32%;background:#eee3f7;transform:rotate(2deg)}.ecosystem-window{overflow:hidden;border:6px solid #24192c;border-radius:13px;background:#17121e;box-shadow:0 24px 48px rgba(42,17,62,.2);transform:rotate(.7deg)}.ecosystem-window-top{height:30px;display:flex;align-items:center;gap:5px;padding:0 10px;background:#261c30}.ecosystem-dot{width:7px;height:7px;border-radius:50%;background:#786b82}.ecosystem-address{height:16px;display:flex;align-items:center;flex:1;margin-left:9px;padding:0 8px;border-radius:4px;background:#352740;color:#d4c8dc;font-size:8px}.ecosystem-window-body{min-height:270px;padding:22px;background:linear-gradient(135deg,#e7d7f4,#f8f3fc 62%,#dfcdeb);color:#3a204b}.ecosystem-window-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.ecosystem-window-title{font-size:16px;font-weight:750;letter-spacing:-.04em}.ecosystem-window-subtitle{margin-top:4px;color:#806c8e;font-size:9px}.ecosystem-state{padding:4px 8px;border:1px solid rgba(89,36,127,.17);border-radius:20px;background:rgba(255,255,255,.7);color:#715d7d;font-size:8px;font-weight:700;white-space:nowrap}.ecosystem-preview{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.ecosystem-preview-panel{min-height:112px;padding:12px;border:1px solid rgba(89,36,127,.16);border-radius:8px;background:rgba(255,255,255,.83)}.ecosystem-preview-label{margin-bottom:10px;color:#89769a;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.ecosystem-preview-line{height:6px;width:88%;margin:8px 0;border-radius:5px;background:#e7ddec}.ecosystem-preview-line.short{width:57%}.ecosystem-preview-action{display:inline-flex;margin-top:8px;padding:5px 9px;border-radius:5px;background:var(--site-plum);color:white;font-size:8px;font-weight:700}.ecosystem-window-foot{display:flex;justify-content:space-between;align-items:center;margin-top:13px;color:#715d7d;font-size:8px}.ecosystem-window-foot span:first-child:before{content:"";display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:#6caa7c}' +
    '#ecosystemHome,#ecosystemTool{scroll-margin-top:78px}#ecosystemTool{border-top:1px solid var(--site-border);background:#fff}.ecosystem-tool-heading{width:min(1160px,calc(100% - 44px));margin:0 auto;padding:38px 0 12px}.ecosystem-tool-heading .ecosystem-kicker{color:var(--site-plum-light)}.ecosystem-tool-heading h2{margin:8px 0 5px;color:var(--site-plum-dark);font-size:clamp(25px,3vw,34px);letter-spacing:-.05em}.ecosystem-tool-heading p{margin:0;color:#756b80;font-size:13px}.ecosystem-tool-body{--primary:#59247f;--primary-bg:#fbf9ff;--secondary-bg:#59247f;--secondary-text:#fff;--soft:#756b80;--line:rgba(87,47,116,.18);--panel:#f3edf8;--err:#b00020;--color-bg:#fbf9ff;--color-surface:#fff;--color-text:#261a30;--color-text-secondary:#756b80;--color-accent:#c7a7e0;--color-border:rgba(87,47,116,.18);--color-muted:#f3edf8;--color-danger:#c74440;--color-success:#347a52}.ecosystem-tool-body>.wrap{width:min(1280px,calc(100% - 44px))!important;max-width:1280px!important;height:auto!important;min-height:650px;padding:16px 0 30px!important;margin:0 auto!important}.ecosystem-tool-body .grid,.ecosystem-tool-body .panes,.ecosystem-tool-body .shell,.ecosystem-tool-body .main,.ecosystem-tool-body #view{min-height:430px}.ecosystem-tool-body .links{display:none}.ecosystem-tool-body header{backdrop-filter:none}.ecosystem-tool-body :focus-visible{outline-color:#9060c2}.ecosystem-tool-body .home{padding-top:12px}' +
    '#ecosystemFooter{border-top:1px solid var(--site-border);padding:20px 22px;background:var(--site-snow);color:#756b80;text-align:center;font-size:12px}#ecosystemFooter a{color:var(--site-plum);font-weight:700;text-decoration:none}#ecosystemFooter a:hover{text-decoration:underline;text-underline-offset:3px}.ecosystem-heart{color:#9060c2}' +
    '@media(max-width:900px){#ecosystemHome{padding:45px 0 55px}.ecosystem-hero-grid{grid-template-columns:1fr;gap:25px}.ecosystem-hero-copy p{max-width:62ch}.ecosystem-visual{width:min(680px,100%);margin:0 auto}.ecosystem-window-body{min-height:240px}.ecosystem-tool-body .grid,.ecosystem-tool-body .panes,.ecosystem-tool-body .shell,.ecosystem-tool-body .main,.ecosystem-tool-body #view{min-height:480px}}' +
    '@media(max-width:620px){#ecosystemHeader{min-height:62px;padding:9px 15px}.ecosystem-brand{font-size:15px}.ecosystem-mark{width:29px;height:29px}.ecosystem-links{gap:12px}.ecosystem-links a{font-size:11px}.ecosystem-links .ecosystem-about{display:none}.ecosystem-links .ecosystem-coffee{min-height:33px;padding:0 10px}#ecosystemHome,.ecosystem-tool-heading{width:calc(100% - 30px)}#ecosystemHome{padding:39px 0 48px}.ecosystem-hero-copy h2{font-size:44px}.ecosystem-window{border-width:5px}.ecosystem-window-body{min-height:220px;padding:16px}.ecosystem-preview{gap:7px;margin-top:16px}.ecosystem-preview-panel{min-height:95px;padding:9px}.ecosystem-tool-body>.wrap{width:calc(100% - 30px)!important;min-height:0;padding-top:12px!important}.ecosystem-tool-body .grid,.ecosystem-tool-body .panes,.ecosystem-tool-body .shell{grid-template-columns:minmax(0,1fr)!important;min-width:0}.ecosystem-tool-body .grid,.ecosystem-tool-body .panes,.ecosystem-tool-body .shell,.ecosystem-tool-body .main,.ecosystem-tool-body #view{min-height:0;min-width:0}.ecosystem-tool-body .side,.ecosystem-tool-body .out,.ecosystem-tool-body .pane{min-width:0}.ecosystem-tool-body .pane{min-height:280px}.ecosystem-tool-heading{padding-top:28px}}' +
    '.ecosystem-guide{width:min(1160px,calc(100% - 48px));margin:0 auto 50px;padding:30px;border:1px solid var(--site-border);border-radius:20px;background:#fff;box-shadow:var(--site-shadow)}.ecosystem-guide h2{margin:0 0 20px;color:var(--site-plum-dark);font-size:clamp(24px,3vw,34px);letter-spacing:-.035em}.ecosystem-guide h3{margin:0 0 8px;color:var(--site-plum-dark);font-size:18px}.ecosystem-guide p,.ecosystem-guide li{color:#5e5365;line-height:1.7}.ecosystem-guide p{margin:0 0 12px}.ecosystem-guide section{padding:18px 0;border-top:1px solid var(--site-border)}.ecosystem-guide .ecosystem-example{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ecosystem-guide pre{overflow:auto;margin:8px 0 0;padding:14px;border-radius:10px;background:#f7f3fb;color:#321344;font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere}.ecosystem-guide ul{margin:8px 0 0;padding-left:22px}.ecosystem-guide details{padding:13px 0;border-top:1px solid var(--site-border)}.ecosystem-guide summary{color:var(--site-plum-dark);font-weight:700;cursor:pointer}.ecosystem-guide details p{margin:8px 0 0}.ecosystem-guide details:last-child{border-bottom:1px solid var(--site-border)}@media(max-width:620px){.ecosystem-guide{width:calc(100% - 30px);padding:20px}.ecosystem-guide .ecosystem-example{grid-template-columns:1fr}}' +
    '@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ecosystem-button{transition:none}}';
  document.head.appendChild(style);

  var header = document.createElement('header');
  header.id = 'ecosystemHeader';
  header.innerHTML =
    '<a class="ecosystem-brand" href="#" aria-label="MicroService Tools home"><span class="ecosystem-mark" aria-hidden="true">M</span><span>MicroService Tools<small>Small tools. Thoughtfully made.</small></span></a>' +
    '<div class="ecosystem-links"><a class="ecosystem-about" href="https://about.imtharvesh.me" target="_blank" rel="noopener">About Me</a><a class="ecosystem-coffee" href="https://buymeacoffee.com/tharveshmuhaideen" target="_blank" rel="noopener">Buy me a coffee</a></div>';

  var home = document.createElement('section');
  home.id = 'ecosystemHome';
  home.setAttribute('aria-labelledby', 'ecosystemTitle');
  home.innerHTML =
    '<div class="ecosystem-hero-grid"><div class="ecosystem-hero-copy">' +
      '<div class="ecosystem-eyebrow">A focused tool for your workflow</div>' +
      '<h2 id="ecosystemTitle">' + escapeHtml(title) + '</h2>' +
      '<p>' + escapeHtml(description) + '</p>' +
      '<div class="ecosystem-actions"><button type="button" class="ecosystem-button" data-scroll-tool>Open the tool <span aria-hidden="true">&nbsp;↓</span></button><a class="ecosystem-button secondary" href="https://about.imtharvesh.me" target="_blank" rel="noopener">About Me <span aria-hidden="true">&nbsp;↗</span></a></div>' +
      '<div class="ecosystem-proof">Runs right here in your browser</div>' +
    '</div><div class="ecosystem-visual" aria-hidden="true"><div class="ecosystem-window">' +
      '<div class="ecosystem-window-top"><i class="ecosystem-dot"></i><i class="ecosystem-dot"></i><i class="ecosystem-dot"></i><div class="ecosystem-address">MicroService Tools&nbsp; / &nbsp;' + escapeHtml(title) + '</div></div>' +
      '<div class="ecosystem-window-body"><div class="ecosystem-window-heading"><div><div class="ecosystem-window-title">' + escapeHtml(title) + '</div><div class="ecosystem-window-subtitle">A clear space to get your task done.</div></div><span class="ecosystem-state">READY IN BROWSER</span></div>' +
      '<div class="ecosystem-preview"><div class="ecosystem-preview-panel"><div class="ecosystem-preview-label">Your workspace</div><div class="ecosystem-preview-line"></div><div class="ecosystem-preview-line short"></div><div class="ecosystem-preview-line"></div></div><div class="ecosystem-preview-panel"><div class="ecosystem-preview-label">A useful result</div><div class="ecosystem-preview-line"></div><div class="ecosystem-preview-line short"></div><span class="ecosystem-preview-action">Ready when you are</span></div></div>' +
      '<div class="ecosystem-window-foot"><span>Designed to stay simple</span><span>MicroService Tools</span></div></div></div></div></div>';

  var section = document.createElement('section');
  section.id = 'ecosystemTool';
  section.setAttribute('aria-labelledby', 'ecosystemToolTitle');
  var sectionHeading = document.createElement('div');
  sectionHeading.className = 'ecosystem-tool-heading';
  sectionHeading.innerHTML =
    '<div class="ecosystem-kicker">The tool</div><h2 id="ecosystemToolTitle">' + escapeHtml(title) + '</h2><p>Use the complete tool below. Your existing options and actions are unchanged.</p>';
  var toolBody = document.createElement('div');
  toolBody.className = 'ecosystem-tool-body';
  tool.parentNode.insertBefore(header, tool);
  tool.parentNode.insertBefore(home, tool);
  tool.parentNode.insertBefore(section, tool);
  section.appendChild(sectionHeading);
  section.appendChild(toolBody);
  toolBody.appendChild(tool);

  var guideSection = document.createElement('section');
  guideSection.className = 'ecosystem-guide';
  guideSection.setAttribute('aria-labelledby', 'ecosystemGuideTitle');
  guideSection.innerHTML =
    '<h2 id="ecosystemGuideTitle">A quick guide to ' + escapeHtml(title) + '</h2>' +
    '<section><h3>What is this tool?</h3><p>' + escapeHtml(guide.what) + '</p></section>' +
    '<section><h3>How do you use it?</h3><p>' + escapeHtml(guide.how) + '</p></section>' +
    '<section><h3>' + escapeHtml(guide.how2Title) + '</h3><p>' + escapeHtml(guide.how2) + '</p></section>' +
    '<section><h3>Example input and output</h3><div class="ecosystem-example"><div><strong>Input</strong><pre><code>' + escapeHtml(guide.input) + '</code></pre></div><div><strong>Output</strong><pre><code>' + escapeHtml(guide.output) + '</code></pre></div></div></section>' +
    '<section><h3>Common use cases</h3><ul>' + guide.uses.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul></section>' +
    '<section><h3>Frequently asked questions</h3>' + guide.faqs.map(function (item) { return '<details><summary>' + escapeHtml(item.q) + '</summary><p>' + escapeHtml(item.a) + '</p></details>'; }).join('') + '</section>';
  section.appendChild(guideSection);

  var structuredData = document.createElement('script');
  structuredData.type = 'application/ld+json';
  structuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: title,
        description: description,
        url: window.location.origin + window.location.pathname,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires a modern web browser with JavaScript enabled',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map(function (item) {
          return {
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a }
          };
        })
      }
    ]
  });
  document.head.appendChild(structuredData);

  var footer = document.createElement('footer');
  footer.id = 'ecosystemFooter';
  footer.innerHTML = 'MicroService Tools <span aria-hidden="true">•</span> Made With <span class="ecosystem-heart" aria-label="love">💙</span> <span aria-hidden="true">•</span> By <a href="https://about.imtharvesh.me" target="_blank" rel="noopener">Tharvesh Muhaideen A</a>';
  section.parentNode.insertBefore(footer, section.nextSibling);

  header.querySelector('.ecosystem-brand').addEventListener('click', function (event) {
    event.preventDefault();
    home.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  header.querySelector('.ecosystem-coffee').setAttribute('aria-label', 'Buy me a coffee');
  document.querySelectorAll('[data-scroll-tool]').forEach(function (button) {
    button.addEventListener('click', function () {
      var currentTool = document.querySelector('#nav button[aria-current="page"]');
      if (window.App && typeof window.App.open === 'function' && currentTool && currentTool.getAttribute('data-id') === 'home') {
        window.App.open('html');
      }
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
