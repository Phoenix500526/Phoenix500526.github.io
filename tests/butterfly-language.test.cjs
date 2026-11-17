const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const script = fs.readFileSync(path.join(__dirname, '../preview/butterfly/source/js/ui-language.js'), 'utf8');

async function setup({ browserLanguage = 'en-US', saved, blocked = false, clock, quoteCatalog } = {}) {
  const dom = new JSDOM(`<!doctype html><html lang="zh-CN"><body>
    <nav id="nav"><a class="site-page" href="/about/">关于我</a>
      <button class="ph-language-switch" data-ui-language="en" aria-label="切换到英文"></button>
    </nav>
    <div id="sidebar-menus"><button class="ph-language-switch" data-ui-language="en" aria-label="切换到英文"></button></div>
    <section class="ph-intro"><h1 class="ph-daily-quote">默认句子</h1></section>
    <h1 class="post-title">关于我</h1><article id="article-container" lang="zh-CN"><h2>分类</h2><code>搜索</code></article>
    <p class="ph-summary">首页</p><a class="category-list-link">分类</a>
    <div class="ph-contributions" lang="en"><h2>Open source</h2></div>
    <section class="ph-webinfo"><dl><dd id="busuanzi_value_site_uv">加载中…</dd></dl></section>
    <div id="local-search-stats"></div><div id="local-search-results"><a>搜索</a></div>
    <button class="code-expand-btn" aria-label="展开完整代码"></button>
    <input class="untouched" placeholder="搜索文章">
    <div id="giscus-wrap"></div>
  </body></html>`, { runScripts: 'outside-only', url: 'http://localhost:4187/article/#section' });
  const { window } = dom;
  await new Promise(resolve => window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  Object.defineProperty(window.navigator, 'language', { value: browserLanguage });
  if (saved) window.localStorage.setItem('ph-ui-language', saved);
  if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } });
  if (clock) {
    const NativeDate = window.Date;
    window.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [clock.now])); }
    };
  }
  // Substitute only the quote data, exercising the unchanged browser logic.
  const catalogDeclaration = /const quotes = \{[\s\S]*?\n  \};/;
  if (quoteCatalog) assert.match(script, catalogDeclaration);
  const configuredScript = quoteCatalog
    ? script.replace(catalogDeclaration, () => `const quotes = ${JSON.stringify(quoteCatalog)};`)
    : script;
  window.eval(configuredScript);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  return dom;
}
const tick = () => new Promise(resolve => setImmediate(resolve));
const switchLanguage = (document, locale, scope = '#nav') => {
  if (document.documentElement.lang !== locale) document.querySelector(`${scope} .ph-language-switch`).click();
};

test('UI follows browser language, remembers explicit choice, and preserves content and URLs', async () => {
  const dom = await setup();
  const { window } = dom;
  const d = window.document;
  const preserved = ['.post-title', '#article-container', '.ph-summary', '.category-list-link', '.ph-contributions', '#local-search-results'];
  const originals = preserved.map(selector => d.querySelector(selector).outerHTML);
  try {
    assert.equal(d.documentElement.lang, 'en');
    assert.equal(d.querySelector('#nav a').textContent, 'About Me');
    for (const locale of ['zh-CN', 'en', 'zh-CN']) {
      switchLanguage(d, locale, '#sidebar-menus');
      assert.equal(d.documentElement.lang, locale);
      assert.equal(window.localStorage.getItem('ph-ui-language'), locale);
      assert.equal(d.querySelector('#nav a').textContent, locale === 'en' ? 'About Me' : '关于我');
      assert.equal(d.querySelector('#nav .ph-language-switch').dataset.uiLanguage, locale === 'en' ? 'zh-CN' : 'en');
      assert.equal(d.querySelector('#nav .ph-language-switch').getAttribute('aria-label'), locale === 'en' ? 'Switch to Chinese' : '切换到英文');
      assert.deepEqual(preserved.map(selector => d.querySelector(selector).outerHTML), originals);
      assert.equal(window.location.href, 'http://localhost:4187/article/#section');
    }
  } finally { await tick(); window.close(); }
  const nextPage = await setup({ browserLanguage: 'en-US', saved: 'zh-CN' });
  assert.equal(nextPage.window.document.documentElement.lang, 'zh-CN');
  nextPage.window.close();
});

test('Chinese variants default to Chinese; invalid or blocked storage does not break switching', async () => {
  for (const options of [{ browserLanguage: 'zh-TW', saved: 'invalid' }, { browserLanguage: 'zh-CN', blocked: true }]) {
    const dom = await setup(options);
    try {
      assert.equal(dom.window.document.documentElement.lang, 'zh-CN');
      switchLanguage(dom.window.document, 'en');
      assert.equal(dom.window.document.querySelector('#nav a').textContent, 'About Me');
    } finally { await tick(); dom.window.close(); }
  }
});

test('late search and statistics updates stay localized without translating results or numeric counts', async () => {
  const dom = await setup();
  const d = dom.window.document;
  try {
    const stats = d.querySelector('#busuanzi_value_site_uv');
    assert.equal(stats.textContent, 'Loading…');
    stats.textContent = '暂不可用';
    const result = d.createElement('div'); result.className = 'search-result-stats'; result.textContent = '共找到 3 篇文章';
    d.querySelector('#local-search-stats').append(result);
    await tick();
    assert.equal(stats.textContent, 'Unavailable');
    assert.equal(result.textContent, '3 articles found');
    result.textContent = '未找到符合您查询的内容：<img src=x onerror=alert(1)> $&';
    await tick();
    assert.equal(result.textContent, 'No results for: <img src=x onerror=alert(1)> $&');
    assert.equal(result.children.length, 0);
    stats.textContent = '12345'; await tick();
    switchLanguage(d, 'zh-CN');
    assert.equal(stats.textContent, '12345');
    assert.equal(result.textContent, '未找到符合您查询的内容：<img src=x onerror=alert(1)> $&');
    assert.equal(d.querySelector('#local-search-results a').textContent, '搜索');
    const expand = d.querySelector('.code-expand-btn');
    switchLanguage(d, 'en');
    expand.setAttribute('aria-label', '收起代码'); await tick();
    assert.equal(expand.getAttribute('aria-label'), 'Collapse code');
  } finally { await tick(); dom.window.close(); }
});

test('Giscus receives only a language update after lazy loading and on language switches', async () => {
  const dom = await setup();
  const { window } = dom;
  const d = window.document;
  try {
    const frame = d.createElement('iframe');
    d.querySelector('#giscus-wrap').append(frame);
    const calls = [];
    frame.contentWindow.postMessage = (message, origin) => calls.push({ lang: message.giscus.setConfig.lang, keys: Object.keys(message.giscus.setConfig), origin });
    await tick(); frame.dispatchEvent(new window.Event('load'));
    switchLanguage(d, 'zh-CN');
    assert.equal(calls.at(-2).lang, 'en');
    assert.deepEqual(calls.at(-1), { lang: 'zh-CN', keys: ['lang'], origin: 'https://giscus.app' });
    assert.equal(d.querySelector('#giscus-wrap iframe'), frame);
  } finally { await tick(); window.close(); }
});


test('daily quotes stay stable within a local day, across reloads and language switches', async () => {
  const clock = { now: new Date(2026, 10, 17, 0, 1).getTime() };
  const morning = await setup({ clock, blocked: true });
  const quote = dom => dom.window.document.querySelector('.ph-daily-quote').textContent;
  const switchTo = (dom, locale) => switchLanguage(dom.window.document, locale);
  let evening;
  try {
    const english = quote(morning);
    switchTo(morning, 'zh-CN');
    const chinese = quote(morning);
    assert.match(english, /^[A-Z]/);
    assert.match(chinese, /[\u4e00-\u9fff]/);
    clock.now = new Date(2026, 10, 17, 23, 59).getTime();
    evening = await setup({ clock });
    assert.equal(quote(evening), english);
    switchTo(evening, 'zh-CN');
    assert.equal(quote(evening), chinese);
    // No midnight replacement, even if the reader toggles languages afterward.
    clock.now = new Date(2026, 10, 18, 0, 1).getTime();
    switchTo(morning, 'en');
    assert.equal(quote(morning), english);
    switchTo(morning, 'zh-CN');
    assert.equal(quote(morning), chinese);
  } finally {
    await tick(); morning.window.close(); evening?.window.close();
  }
});

test('different dates select from all three supplied quotes in each language', async () => {
  const seen = { 'zh-CN': new Set(), en: new Set() };
  for (let day = 1; day <= 31; day++) {
    const dom = await setup({ clock: { now: new Date(2026, 11, day, 12).getTime() } });
    try {
      for (const locale of ['zh-CN', 'en']) {
        switchLanguage(dom.window.document, locale);
        seen[locale].add(dom.window.document.querySelector('.ph-daily-quote').textContent);
      }
    } finally { await tick(); dom.window.close(); }
  }
  assert.deepEqual([...seen['zh-CN']].sort(), [
    '真正的进步，不在于你记住了多少知识，而在于你的直觉发生了怎样的变化',
    '且视他人之疑目如盏盏鬼火，大胆去走你的夜路',
    '虽然行驶缓慢，但我们始终在前行的路上'
  ].sort());
  assert.deepEqual([...seen.en].sort(), [
    'We should consider every day lost on which we have not danced at least once.',
    'There are dark shadows on the earth, but its lights are stronger in the contrast.',
    "How do I best get to the top of this hill? Climb it, don't think it, and maybe you will."
  ].sort());
});


test('quote lists can grow independently and have different lengths', async () => {
  for (const [chineseCount, englishCount] of [[1, 5], [7, 2], [12, 19]]) {
    const quoteCatalog = {
      'zh-CN': Array.from({ length: chineseCount }, (_, i) => `中文语录 ${i + 1}`),
      en: Array.from({ length: englishCount }, (_, i) => `English quote ${i + 1}`)
    };
    const seen = { 'zh-CN': new Set(), en: new Set() };
    for (let day = 1; day <= 60; day++) {
      const dom = await setup({ quoteCatalog, clock: { now: new Date(2026, 0, day, 12).getTime() } });
      try {
        for (const locale of ['zh-CN', 'en']) {
          switchLanguage(dom.window.document, locale);
          const selected = dom.window.document.querySelector('.ph-daily-quote').textContent;
          assert.ok(quoteCatalog[locale].includes(selected), `${locale}: invalid quote ${selected}`);
          seen[locale].add(selected);
        }
      } finally { await tick(); dom.window.close(); }
    }
    // Added entries must be reachable, not just the original first three.
    for (const locale of ['zh-CN', 'en']) {
      const addedChoices = quoteCatalog[locale].slice(3);
      if (addedChoices.length) assert.ok(addedChoices.some(quote => seen[locale].has(quote)));
    }
  }
});
