const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

test('mobile navigation contains focus and restores the opener on every close path', async () => {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="sidebar"><div id="menu-mask"></div><div id="sidebar-menus"><a href="/">首页</a><a href="/archives/">归档</a></div></div>
    <div id="body-wrap"><nav id="nav" class="hide-menu"><a class="nav-site-title" href="/">博客</a><div id="toggle-menu"><button aria-expanded="false">菜单</button></div></nav><a href="/article/">文章</a></div>
    <div id="rightside"><button>回到顶部</button></div>
  </body>`, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost:4187/' });
  const { window } = dom;
  const { document } = window;
  await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  // JSDOM has no layout; all controls in this fixture have a visible rectangle.
  window.HTMLElement.prototype.getClientRects = () => [{}];
  const menu = document.getElementById('sidebar-menus');
  const button = document.querySelector('#toggle-menu button');
  const mask = document.getElementById('menu-mask');
  // Native Butterfly owns the open class and overlay; our enhancement observes it.
  button.addEventListener('click', () => menu.classList.add('open'));
  mask.addEventListener('click', () => menu.classList.remove('open'));
  const script = process.env.BUTTERFLY_SCRIPT || path.join(__dirname, '../preview/butterfly/source/js/phoenix.js');
  window.eval(fs.readFileSync(script, 'utf8'));
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const press = (target, key, shiftKey = false) => target.dispatchEvent(new window.KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
  const settle = async () => { await Promise.resolve(); await new Promise(resolve => window.requestAnimationFrame(resolve)); };
  try {
    assert.equal(menu.inert, true);
    button.focus(); button.click(); await settle();
    const close = menu.querySelector('button');
    const last = menu.querySelector('a:last-child');
    assert.equal(document.activeElement, close);
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(document.getElementById('body-wrap').inert, true);
    assert.equal(document.getElementById('rightside').inert, true);
    press(close, 'Tab', true); assert.equal(document.activeElement, last);
    press(last, 'Tab'); assert.equal(document.activeElement, close);
    for (const dismiss of [() => close.click(), () => mask.click(), () => press(close, 'Escape')]) {
      dismiss(); await settle();
      assert.equal(menu.classList.contains('open'), false);
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      assert.equal(document.getElementById('body-wrap').inert, false);
      assert.equal(document.activeElement, button);
      button.click(); await settle();
    }
    // Butterfly also closes its drawer when resizing back to a desktop menu.
    button.getClientRects = () => [];
    document.getElementById('nav').classList.remove('hide-menu'); await settle();
    assert.equal(menu.classList.contains('open'), false);
    assert.equal(document.activeElement, document.querySelector('.nav-site-title'));
  } finally { window.close(); }
});
