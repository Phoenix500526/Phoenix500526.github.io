const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

async function fixture(t) {
  const dom = new JSDOM('<span id="busuanzi_value_site_uv">加载中…</span><span id="busuanzi_value_site_pv">加载中…</span>', {
    runScripts: 'outside-only', url: 'https://phoenix500526.github.io/'
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  await new Promise(resolve => window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  const timers = new Map();
  let nextId = 0;
  window.setTimeout = (fn, delay) => { timers.set(++nextId, { fn, delay }); return nextId; };
  window.clearTimeout = id => timers.delete(id);
  const advance = delay => {
    for (const [id, timer] of [...timers]) if (timer.delay === delay) {
      timers.delete(id);
      timer.fn();
    }
  };
  const client = process.env.SITE_STATS_SCRIPT || path.join(__dirname, '../preview/butterfly/source/js/site-stats.js');
  window.eval(fs.readFileSync(client, 'utf8'));
  const request = () => window.document.querySelector('script');
  const callback = script => new URL(script.src).searchParams.get('jsonpCallback');
  const values = () => [...window.document.querySelectorAll('span')].map(element => element.textContent);
  return { window, timers, advance, request, callback, values };
}

test('statistics retries a failed JSONP request and stops after success', async t => {
  const f = await fixture(t);
  const failed = f.request();
  assert.equal(new URL(failed.src).origin, 'https://busuanzi.ibruce.info');
  failed.dispatchEvent(new f.window.Event('error'));
  f.advance(1000);
  const retry = f.request();
  assert.ok(retry && retry !== failed, 'a failed request must create a fresh retry');
  assert.equal(f.window[f.callback(failed)], undefined);
  f.window[f.callback(retry)]({ site_uv: 0, site_pv: 42 });
  assert.deepEqual(f.values(), ['0', '42']);
  assert.equal(f.request(), null);
  assert.equal(f.timers.size, 0);
  assert.equal(f.window[f.callback(retry)], undefined);
});

test('statistics stops after three failed requests without inventing counts', async t => {
  const f = await fixture(t);
  for (let attempt = 1; attempt <= 3; attempt++) {
    assert.ok(f.request());
    f.request().dispatchEvent(new f.window.Event('error'));
    f.advance(attempt * 1000);
  }
  assert.deepEqual(f.values(), ['暂不可用', '暂不可用']);
  assert.equal(f.request(), null);
  assert.equal(f.timers.size, 0);
});

test('a slow successful response replaces the timeout status without another count', async t => {
  const f = await fixture(t);
  const pending = f.request();
  f.advance(8000);
  assert.deepEqual(f.values(), ['暂不可用', '暂不可用']);
  assert.equal(f.request(), pending);
  assert.equal(f.timers.size, 0);
  f.window[f.callback(pending)]({ site_uv: 12, site_pv: 34 });
  assert.deepEqual(f.values(), ['12', '34']);
  assert.equal(f.request(), null);
});

test('statistics rejects malformed counts without retrying a completed request', async t => {
  const f = await fixture(t);
  f.window[f.callback(f.request())]({ site_uv: '<img src=x>', site_pv: -1 });
  assert.deepEqual(f.values(), ['暂不可用', '暂不可用']);
  assert.equal(f.window.document.querySelector('img'), null);
  assert.equal(f.timers.size, 0);
});
