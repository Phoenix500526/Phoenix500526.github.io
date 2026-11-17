const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pug = require('pug');
const yaml = require('js-yaml');
const { JSDOM } = require('jsdom');

test('Giscus starts asynchronously before scrolling and loads its iframe eagerly', t => {
  const root = path.join(__dirname, '..');
  const theme = yaml.load(fs.readFileSync(path.join(root, '_config.butterfly.yml'), 'utf8')).theme_config;
  const html = pug.renderFile(path.join(root, 'preview/butterfly/layout/includes/third-party/comments/giscus.pug'), { theme });
  const dom = new JSDOM('<div id="giscus-wrap"></div>' + html, { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  let waitsForScroll = false;
  window.GLOBAL_CONFIG_SITE = { pageType: 'post' };
  window.phI18n = { language: 'en' };
  window.btf = {
    addGlobalFn() {},
    loadComment() { waitsForScroll = true; }
  };
  window.eval(window.document.querySelector('script').textContent);
  assert.equal(waitsForScroll, false, 'reading the article should allow comments to load in the background');
  const scripts = window.document.querySelectorAll('#giscus-wrap script');
  assert.equal(scripts.length, 1);
  const script = scripts[0];
  assert.equal(script.src, 'https://giscus.app/client.js');
  assert.ok(script.hasAttribute('async'));
  assert.equal(script.getAttribute('data-loading'), 'eager');
  assert.equal(script.getAttribute('data-mapping'), 'pathname');
  assert.equal(script.getAttribute('data-lang'), 'en');
});
