'use strict';

const { readFileSync } = require('node:fs');
const path = require('node:path');

const preview = readFileSync(path.join(hexo.theme_dir, 'assets/city-walk/street-preview.webp'));
hexo.extend.helper.register('ph_city_walk_preview', () => `data:image/webp;base64,${preview.toString('base64')}`);
