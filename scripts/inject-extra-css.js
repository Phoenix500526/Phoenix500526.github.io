/**
 * Inject site-level CSS overrides (independent of the active theme).
 *
 * Why: the blog ships custom CSS (`source/css/img-fix.css`) that fixes
 * responsive image rules the active theme doesn't get right. Editing the
 * theme's head template to add a `<link>` would tie the customisation to
 * that theme — swapping themes later would silently drop it.
 *
 * Instead, this Hexo `after_render:html` filter injects the `<link>` into
 * every rendered HTML page right before `</head>`. Theme-agnostic: works as
 * long as the new theme's templates have a `</head>` tag (every theme does).
 *
 * To add another site-level stylesheet later: drop the file in
 * `source/css/<name>.css` and add its name to the list below.
 */

const STYLES = [
  'css/img-fix.css',
];

hexo.extend.filter.register('after_render:html', function (html) {
  const root = hexo.config.root || '/';
  const links = STYLES
    .map((path) => `<link rel="stylesheet" href="${root}${path}">`)
    .join('\n');
  return html.replace('</head>', `${links}\n</head>`);
});
