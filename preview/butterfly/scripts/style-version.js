'use strict';

const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const css = readFileSync(path.join(hexo.theme_dir, 'source/css/phoenix.css'));
const languageScript = readFileSync(path.join(hexo.theme_dir, 'source/js/ui-language.js'));
const languageVersion = createHash('sha256').update(languageScript).digest('hex').slice(0, 12);
const version = createHash('sha256').update(css).digest('hex').slice(0, 12);

// A new stylesheet must not reuse the previous release's browser cache entry.
hexo.extend.filter.register('after_render:html', html => html.replaceAll(
  'href="/css/phoenix.css"',
  `href="/css/phoenix.css?v=${version}"`
).replaceAll(
  'src="/js/ui-language.js"',
  `src="/js/ui-language.js?v=${languageVersion}"`
));
