const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const flush = () => new Promise(resolve => setImmediate(resolve));

function setup(t, readyState = 'loading') {
  const dom = new JSDOM('<section class="ph-city-walk"><div class="ph-walk-scene" style="--ph-street-preview: url(data:image/webp;base64,preview)" data-street="/street.webp" data-dog="/dog.webp"><div class="ph-dog-sprite"></div></div></section>', { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const images = [];
  let onIntersection;
  const media = { matches: false, addEventListener: (_, callback) => { media.change = callback; } };
  window.matchMedia = () => media;
  window.IntersectionObserver = class {
    constructor(callback) { onIntersection = callback; }
    observe() {}
  };
  window.Image = class {
    decode() {
      return new Promise((resolve, reject) => images.push({ src: this.src, priority: this.fetchPriority, resolve, reject }));
    }
  };
  const state = { hidden: false };
  Object.defineProperty(window.document, 'hidden', { get: () => state.hidden });
  Object.defineProperty(window.document, 'readyState', { value: readyState });
  window.eval(fs.readFileSync(path.join(__dirname, '../preview/butterfly/source/js/city-walk.js'), 'utf8'));
  const walk = window.document.querySelector('.ph-city-walk');
  const scene = window.document.querySelector('.ph-walk-scene');
  const intersect = visible => onIntersection([{ isIntersecting: visible }]);
  const loaded = () => window.dispatchEvent(new window.Event('load'));
  return { window, images, media, state, walk, scene, intersect, loaded, running: () => walk.classList.contains('is-walking') };
}

test('city walk preloads after page load and waits for both decoded images', async t => {
  const s = setup(t);
  assert.equal(s.images.length, 0, 'decorative images must not compete with initial page resources');
  s.intersect(true);
  assert.equal(s.running(), false);
  s.loaded();
  assert.deepEqual(s.images.map(i => i.src).sort(), ['/dog.webp', '/street.webp']);
  assert.ok(s.images.every(i => i.priority === 'low'));
  s.images.find(i => i.src === '/dog.webp').resolve();
  await flush();
  assert.equal(s.images.length, 2, 'background loading starts only once');
  assert.equal(s.running(), false, 'a fast dog must wait for the slow street');
  assert.equal(s.walk.classList.contains('is-ready'), false);
  assert.equal(s.scene.style.backgroundImage, '');
  assert.ok(s.scene.style.getPropertyValue('--ph-street-preview').includes('data:image/webp'));
  s.images.find(i => i.src === '/street.webp').resolve();
  await flush();
  assert.equal(s.walk.classList.contains('is-ready'), true);
  assert.ok(s.scene.style.backgroundImage.includes('/street.webp'));
  assert.equal(s.running(), true);
  s.intersect(false);
  assert.equal(s.running(), false);
  s.intersect(true);
  assert.equal(s.running(), true);
  s.state.hidden = true;
  s.window.document.dispatchEvent(new s.window.Event('visibilitychange'));
  assert.equal(s.running(), false);
  s.state.hidden = false;
  s.window.document.dispatchEvent(new s.window.Event('visibilitychange'));
  assert.equal(s.running(), true);
  s.media.matches = true;
  s.media.change();
  assert.equal(s.running(), false);
});

test('city walk loads offscreen even when the page has already finished loading', async t => {
  const s = setup(t, 'complete');
  assert.equal(s.images.length, 2);
  s.images.forEach(i => i.resolve());
  await flush();
  assert.equal(s.walk.classList.contains('is-ready'), true);
  assert.equal(s.running(), false);
  s.intersect(true);
  assert.equal(s.running(), true);
});

test('city walk retains the inline street when a full-size image fails', async t => {
  const s = setup(t);
  s.loaded();
  s.intersect(true);
  s.images[0].reject(new Error('Image download failed'));
  s.images[1].resolve();
  await flush();
  assert.equal(s.walk.hidden, false);
  assert.equal(s.walk.classList.contains('is-ready'), false);
  assert.equal(s.scene.style.backgroundImage, '');
  assert.ok(s.scene.style.getPropertyValue('--ph-street-preview').includes('data:image/webp'));
  assert.equal(s.running(), false);
});
