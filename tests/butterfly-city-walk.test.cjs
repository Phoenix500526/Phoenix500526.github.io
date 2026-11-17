const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

test('city walk works without controls and respects visibility and reduced motion', t => {
  const dom = new JSDOM('<section class="ph-city-walk"><div class="ph-walk-scene" data-street="/street.png" data-dog="/dog.png"><div class="ph-dog-sprite"></div></div></section>', { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const { document } = window;
  let onIntersection, onMotionChange, hidden = false;
  const media = { matches: false, addEventListener: (_, callback) => { onMotionChange = callback; } };
  window.matchMedia = () => media;
  window.IntersectionObserver = class {
    constructor(callback) { onIntersection = callback; }
    observe() {}
  };
  Object.defineProperty(document, 'hidden', { get: () => hidden });
  window.eval(fs.readFileSync(path.join(__dirname, '../preview/butterfly/source/js/city-walk.js'), 'utf8'));
  const walk = document.querySelector('.ph-city-walk');
  const scene = document.querySelector('.ph-walk-scene');
  const running = () => walk.classList.contains('is-walking');
  assert.equal(scene.style.backgroundImage, '');
  assert.equal(running(), false);
  onIntersection([{ isIntersecting: true }]);
  assert.ok(scene.style.backgroundImage.includes('/street.png'));
  assert.equal(running(), true);
  onIntersection([{ isIntersecting: false }]);
  assert.equal(running(), false);
  onIntersection([{ isIntersecting: true }]);
  assert.equal(running(), true);
  hidden = true;
  document.dispatchEvent(new window.Event('visibilitychange'));
  assert.equal(running(), false);
  hidden = false;
  document.dispatchEvent(new window.Event('visibilitychange'));
  assert.equal(running(), true);
  media.matches = true;
  onMotionChange();
  assert.equal(running(), false);
  media.matches = false;
  onMotionChange();
  onIntersection([{ isIntersecting: false }]);
  assert.equal(running(), false);
});
