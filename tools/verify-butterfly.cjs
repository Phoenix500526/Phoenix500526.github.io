const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');
const { unescapeHTML } = require('hexo-util');
const moment = require('moment-timezone');
const { createHash } = require('node:crypto');

const mode = process.argv[2] || 'preview';
if (!['preview', 'production'].includes(mode)) throw new Error('Use preview or production.');
const root = path.resolve(__dirname, '..');
const output = path.join(root, mode === 'preview' ? '.preview-butterfly' : 'public');
const origin = mode === 'preview' ? 'http://localhost:4187' : 'https://phoenix500526.github.io';
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(dir, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  });
}
const pages = files(output);
const styleHash = createHash('sha256').update(fs.readFileSync(path.join(output, 'css/phoenix.css'))).digest('hex').slice(0, 12);
const posts = files(path.join(root, 'source/_posts')).filter(file => file.endsWith('.md'))
  .map(file => frontMatter.parse(fs.readFileSync(file, 'utf8'))).filter(post => post.published !== false);
const contentDate = value => {
  const date = new Date(value);
  const targetOffset = moment.tz.zone('Asia/Shanghai').utcOffset(date.getTime());
  return new Date(date.getTime() - (date.getTimezoneOffset() - targetOffset) * 60000).toISOString();
};
const dates = new Map(posts.map(post => [post.title, contentDate(post.updated || post.date)]));
let articleCount = 0;
for (const file of pages) {
  const relative = path.relative(output, file);
  check(!['db.json', '_multiconfig.yml', '.env'].includes(path.basename(file)), `Build state in artifact: ${relative}`);
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('href="/css/phoenix.css')) {
    check(html.includes(`href="/css/phoenix.css?v=${styleHash}"`) && !html.includes('href="/css/phoenix.css"'), `Stale stylesheet cache key: ${relative}`);
  }
  if (mode === 'preview') check(!html.includes('busuanzi.ibruce.info') && !html.includes('src="/js/site-stats.js"'), `Analytics enabled in preview: ${relative}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  check(canonical && canonical[1].startsWith(origin + '/'), `Invalid canonical: ${relative}`);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  check(mode === 'preview' ? noindex : !noindex, `Wrong indexing policy: ${relative}`);
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"\s]*)"/g)) {
    if (url.startsWith('//')) continue;
    const target = path.join(output, decodeURIComponent(url.split(/[?#]/)[0]));
    check(fs.existsSync(target), `Missing local target: ${relative} -> ${url}`);
  }
  if (/^\d{4}[\\/]\d{2}[\\/]\d{2}[\\/]/.test(relative)) {
    articleCount++;
    const title = unescapeHTML(html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '');
    const updated = html.match(/<meta property="article:modified_time" content="([^"]+)"/)?.[1];
    check(dates.has(title), `Unknown article title: ${relative}`);
    check(updated && new Date(updated).toISOString() === dates.get(title), `Unstable updated date: ${relative}`);
  }
}
const sleepPost = path.join(output, '2020/11/04/睡眠的奥秘-——-关于睡眠，你可能不知道的事/index.html');
const homepage = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
check(homepage.includes('id="website-info-title"'), 'Missing website info card');
if (mode === 'production') {
  for (const metric of ['site_uv', 'site_pv']) {
    check(homepage.includes(`id="busuanzi_value_${metric}"`), `Missing statistics value: ${metric}`);
  }
  for (const file of [path.join(output, 'index.html'), sleepPost]) {
    const html = fs.readFileSync(file, 'utf8');
    check((html.match(/src="\/js\/site-stats\.js"/g) || []).length === 1, `Expected one statistics client: ${path.relative(output, file)}`);
    check(!html.includes('busuanzi.pure.mini.js'), `Duplicate statistics provider client: ${path.relative(output, file)}`);
  }
} else {
  check(!homepage.includes('id="busuanzi_value_') && homepage.includes('本地不统计'), 'Wrong preview statistics state');
}
check(fs.existsSync(sleepPost) && fs.readFileSync(sleepPost, 'utf8').includes('id="R90睡眠法-amp-达芬奇睡眠法"'), 'Missing legacy sleep article anchor');
check(articleCount === posts.length, `Post count: ${articleCount}, expected ${posts.length}`);
for (const name of ['categories/index.html', 'tags/index.html', 'archives/index.html', '404.html', 'search.json', 'atom.xml', 'sitemap.xml']) {
  check(fs.existsSync(path.join(output, name)), `Missing required output: ${name}`);
}
const alias = path.join(output, 'categories/skynet码剖析/index.html');
check(fs.existsSync(alias), 'Missing legacy skynet category redirect');
if (fs.existsSync(alias)) {
  const html = fs.readFileSync(alias, 'utf8');
  check(/http-equiv="refresh"/i.test(html) && html.includes(encodeURI('/categories/skynet源码剖析/')), 'Invalid category redirect');
}
for (const name of ['atom.xml', 'sitemap.xml']) {
  const xml = fs.readFileSync(path.join(output, name), 'utf8');
  check(xml.includes(origin), `Wrong feed/sitemap origin: ${name}`);
  if (mode === 'production') check(!/(?:href="|<loc>|<id>)http:\/\/localhost/.test(xml), `Local URL in ${name}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS ${mode}: ${articleCount} posts; metadata, dates, redirects, internal paths and artifact isolation verified.`);
}
