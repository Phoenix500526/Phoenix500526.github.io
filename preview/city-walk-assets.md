# City walk preview assets

Generated with the built-in imagegen tool for the local blog preview.
The two original PNGs are retained as source masters. The page uses smaller WebP derivatives.

- `butterfly/source/img/city-walk/street.png`: 1536 × 1024; day above, night below.
- `butterfly/source/img/city-walk/dog.png`: 1254 × 1254 with alpha; four frames in a 2 × 2 grid.
- `butterfly/source/img/city-walk/street.webp`: 1320 × 880, quality 82, for the clear street.
- `butterfly/source/img/city-walk/dog.webp`: 336 × 336, lossless with alpha; 168px frames for the 84px display size.
- `butterfly/assets/city-walk/street-preview.webp`: 192 × 128, quality 50. A build helper embeds this small day/night atlas in the homepage HTML, so it needs no separate image request.
- Rendering: CSS background positions select the atlas regions; transforms move and mirror the character.
- Motion starts only when the scene is visible, pauses in background tabs, and respects reduced-motion preferences. There are no visible playback controls.
- The inline street is visible immediately, including with JavaScript disabled. After the page load event, the two full-size WebPs load with low priority even while offscreen. When both decode, they replace the preview and reveal the dog. If either fails, the static preview remains visible.
- The scene appears only on the first homepage. Article and archive pages keep their existing footer.

## Rebuild optimized assets

Run from the repository root with `cwebp` (generated with version 1.6.0):

```sh
cwebp -quiet -resize 1320 880 -q 82 -m 6 -sharp_yuv preview/butterfly/source/img/city-walk/street.png -o preview/butterfly/source/img/city-walk/street.webp
cwebp -quiet -resize 336 336 -lossless -m 6 preview/butterfly/source/img/city-walk/dog.png -o preview/butterfly/source/img/city-walk/dog.webp
cwebp -quiet -resize 192 128 -q 50 -m 6 preview/butterfly/source/img/city-walk/street.png -o preview/butterfly/assets/city-walk/street-preview.webp
```

## Generation prompts

### city

Create a production pixel-art background texture atlas for a cozy personal programmer blog footer. Output a landscape PNG canvas exactly 1536 x 1024 pixels. The canvas contains EXACTLY TWO seamless panoramic strips stacked edge-to-edge: upper half y=0..511 is daytime, lower half y=512..1023 is the EXACT SAME street at night. Each strip is 1536 x 512, no borders or captions, absolutely identical architecture and ground coordinates. Flat side-on 2D view, charming high quality 16-bit pixel art, hard crisp square pixels, no smooth gradients, no isometric perspective. Quiet small city neighborhood: cream and terracotta low-rise buildings, a little blue-roof bookshop, leafy street trees, a wooden bench, lampposts, distant muted skyline. NO PEOPLE, NO ANIMALS, NO CHARACTERS, NO TEXT, NO LOGOS, NO SIGNS WITH LETTERS. Top 35% of each strip is sky and distant skyline; middle 45% buildings and trees; bottom 20% a continuous flat side-on pale stone sidewalk with a narrow road along the bottom edge, left and right ground edges match. Day palette warm cream sky, sage trees, brick, dusty blue. Night palette deep warm navy/charcoal sky, subdued architecture, lit amber windows and lampposts, tiny pixel stars and crescent moon. Keep street detail uncluttered and legible when scaled to 660 x 220 per strip. No dog: a separately animated dog will walk on the sidewalk. Two equally sized horizontal panels that touch precisely at the midpoint, not four panels. Game-ready background atlas, not a website mockup.

### dog

Generate a game-ready transparent PNG sprite sheet of an original adorable small WHITE DOG with floppy BLACK ears and a navy/royal BLUE ribbed knit beanie with folded cuff, tiny blue scarf, large expressive black nose. Cozy understated 16-bit pixel art, crisp hard square pixel clusters and dark charcoal outline, not painterly, not 3D. Exactly 1024 x 1024 transparent canvas subdivided into a strict invisible 2x2 grid of FOUR equal 512x512 cells. Four frames of ONE coherent side-view WALK CYCLE FACING RIGHT, bipedal little dog walking calmly, paws swinging, tail lightly wagging. Identical character design, size, cap and facial expression in every frame. Each character full body centered horizontally in its cell, approximately 320 px wide and 360 px high, identical baseline at cell y=440, hat top at y=80. Frame 1 top-left left foot forward, frame 2 top-right feet passing, frame 3 bottom-left right foot forward, frame 4 bottom-right feet passing opposite. All four in precisely same side-on orientation facing RIGHT. Alternate feet and arm positions visibly but keep head position stable. The only content in each cell is the dog. Actual alpha transparency across all background and all gutters; no floor, no shadows, no checkerboard, no tile outlines, no labels, no extra objects. Four well aligned animation frames, no cropping, exactly four dogs. This is a sprite sheet for CSS steps animation, not a contact sheet or a mockup.
