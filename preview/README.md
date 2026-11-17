# Butterfly local preview

The approved direction is a warm technical reading room: Manjusaka's two-column
layout, paper/ink/rust colors, a small curated introduction and quiet reading tools.
This preview does not change `_config.yml`, posts, production URLs, or deployment.

## Run

```sh
npm ci
npm run butterfly:build
npm run butterfly:serve
```

Open http://localhost:4187. The server binds only to 127.0.0.1.
Stop it with Ctrl+C. The serve command builds and serves the generated files.
After editing an override, run `npm run butterfly:build` and refresh the browser.

The pinned official npm theme is copied into ignored `themes/butterfly-preview`;
`preview/butterfly` is overlaid on it. CSS, scripts, icon fonts, image zoom, and
MathJax are local. Generated pages and the preview database live in
`.preview-butterfly`. Neither old theme nor the earlier redesign is overwritten.

## Design decisions

1. **Atmosphere:** warm paper, typographic hierarchy, compact technical cards.
2. **Palette:** paper `oklch(94.5% .012 78)`, ink `oklch(25% .018 65)`, rust
   `oklch(49% .12 42)`; corresponding warm dark tokens.
3. **Type:** local Iowan/Palatino/Song titles, system sans body, system monospace.
4. **Components:** 10px cards, 6px code blocks, 4px controls; visible focus states.
5. **Layout:** 1180px shell, 280px sidebar, 30px gap; article text around 790px.
6. **Depth:** thin rules and restrained shadow; no backdrop blur or gradients.
7. **Content:** real posts and local diagrams, complete titles, bounded summaries.
8. **Responsive:** sidebar becomes author footer below 900px; at 600px navigation
   collapses, covers move above text, and the article title becomes 28px.
9. **Interaction:** native Butterfly search, TOC, copy, code expansion/fullscreen,
   reading mode and zoom; keyboard enhancements and reduced-motion overrides.

Editorial choices live in `butterfly/scripts/phoenix.js`: featured titles,
summaries, selected covers and topic labels. Cards without a cover remain valid.
The skynet category typo is normalized in preview data only. Series lists use
publication order and do not claim a pedagogical chapter order. Article dates
show publication only, avoiding misleading file-modification timestamps.

The custom templates override homepage, article, navigation, sidebar and footer;
the remaining pages and behaviors come from Butterfly. MathJax uses a small
local v3 configuration to match its pinned runtime instead of upstream's v4/v5
font loading. It loads only for posts with formula delimiters.

## Review before a future deployment

- Read an algorithm post, a long Libevent post, skynet diagrams and a nontechnical
  essay at desktop and 375px widths.
- Check chapter links, search matches/empty results, copy feedback, code expansion,
  image zoom, light/dark mode, menu and pagination.
- Verify all 78 post URLs and image references remain available.
- A future deployment requires a separate instruction and production config review.
