# Checkers 95 - asset pack

Win95-style art, music, SFX and a 3D Inspect viewer for `checkers95/index.html`.
Everything here was made with code (Python + Pillow/numpy/scipy, hand-written WebGL). There are no samples,
no third-party art and no copyrighted melodies. The generators are in `src/` (`src/build_all.sh` rebuilds the whole pack).

All paths below are **relative to the pack root**. The pack is meant to be copied to `checkers95/assets/`, so
`pieces/red_man.png` becomes `assets/pieces/red_man.png`, which matches `ASSETS.base = 'assets/'` in the game.

## Install into the game

```sh
cp -r checkers95-assets/. checkers95/assets/     # or unzip checkers95-assets.zip into checkers95/assets/
node checkers95/assets/make-manifest.cjs         # optional: the pack already ships a complete manifest.js
```

The game only uses a file if it appears in `assets/manifest.js`. The pack includes a complete
`manifest.js` in the same format that `make-manifest.cjs` writes. Copying the pack over the game's `assets/`
folder replaces the empty manifest and turns everything on. If you add or remove files later, re-run `make-manifest.cjs`.

The file names already match the game's `ASSETS` map:

| `ASSETS` key | file(s) in this pack |
|---|---|
| `pieces.red_man / red_king / black_man / black_king` | `pieces/<id>.png` (+ `@2x`), default = classic95 |
| `powerPiece` `pieces/powers/{id}.png` | `pieces/powers/red_king_bomb.png` and so on: 20 classic95 ids (+ `@2x`, `.svg`) |
| *(new, optional)* themed powers | `pieces/powers/{theme}/{id}.png` for `icons`, `pixel-gems`, `smiley` (+ `@2x`, `.svg`) |
| `tiles.light / dark` | `tiles/light.png`, `tiles/dark.png` |
| `icons.mine / hole / bin / binFull` | `icons/mine.png`, `icons/bsod_hole.png`, `icons/recycle_bin.png`, `icons/recycle_bin_full.png` |
| `icons.ad` | `popup_ad.png` (112x112 **content only**, no frame), also `popup_ad_3x2.png` (168x112) and variants `popup_ad_1..4[_3x2].png` (all with `@2x`) |
| `overlays.frozen / shieldBroken` | `overlays/frozen.png`, `overlays/shield_broken.png` |
| `music` | `audio/bg_loop.ogg` **only** (the mp3 and wav were removed; the extra list entries just fall through) |
| `sfx.*` -> **`audio/<name>.ogg`** (was `.wav`; same base names) | move, capture, king, win, lose, invalid, startup, mine, bsod, popup, popup_close, restore, teleport, power_shield, power_bomb, power_speed, power_ghost, power_freeze (+ extra `select`) |
| `inspect.js / inspect.css` | `inspect.js`, `inspect.css` |
| `wallpaper` (currently `null`) | set it to `'screens/wallpaper_teal_1280x800.png'` to use the wallpaper |

### Pop-up ads
`popup_ad*.png` files are **ad content only**: no window frame, title bar or buttons, because the game draws its own Win95 frame with a working X.
Each one is a playful made-up ad in retro web-ad style:

| Variant | 112x112 (2x2 squares) | 168x112 (3x2 squares) |
|---|---|---|
| 1. "You are visitor #1,000,000!" (also the default `popup_ad.png` / `popup_ad_3x2.png`) | `popup_ad_1.png` | `popup_ad_1_3x2.png` |
| 2. "FREE RAM! Download 64 MB" | `popup_ad_2.png` | `popup_ad_2_3x2.png` |
| 3. "HOT SINGLES ...checkers pieces in your area!" | `popup_ad_3.png` | `popup_ad_3_3x2.png` |
| 4. "BONK THE BUG! Hit it & WIN a FREE King!" | `popup_ad_4.png` | `popup_ad_4_3x2.png` |

All of them also come as `@2x`. To show a random one: `'popup_ad_' + (1 + Math.floor(Math.random()*4)) + (wide ? '_3x2' : '') + '.png'`.

### Notes for Game Maker (found in an integration test with the current index.html)
* With the pack installed, the game reports the assets as in use, and the inspect hook (`window.CheckersInspect.open(id)`) works as a modal over the board.
* The piece PNGs are **56x56 including the drop shadow** (the disc is about 44px, like the CSS disc). The game's `.pc` is 44x44 with `background-size:contain`,
  so the art is shrunk to about 79% and gets blurry. When image pieces are active, add something like
  `.pc{width:56px;height:56px;border-radius:0;image-rendering:pixelated}` (and keep the selection outline on a wrapper). The pieces then line up 1:1 with the 56px squares.
* Power-piece PNGs already include the emblem and crown, so hiding `.emb` and `::after` (which `applyAssets()` already does) is correct.

## Piece themes

There are four themes, and each one has `red_man`, `red_king`, `white_man`, `white_king`, `black_man` and `black_king` as a 56px PNG, a 112px `@2x` PNG and an `.svg`.
The `white_*` files are the optional **White vs Black** colour scheme (ivory pieces; see *Side / turn indicator* below):

| Theme | Folder | Look |
|---|---|---|
| classic95 (default) | `pieces/classic95/` | Bevelled plastic disc with an engraved ring pattern; kings get a gold pixel crown |
| icons | `pieces/icons/` | Win95 desktop-icon emblems: Red/White = floppy disk, Black = little monitor; kings add a crown |
| pixel-gems | `pieces/pixel-gems/` | Faceted ruby (or pearl) vs onyx discs with shine; kings add a crown and sparkles |
| smiley | `pieces/smiley/` | Red/White = happy face, Black = cool face with sunglasses; kings wear a crown |

`pieces/*.png` at the top level are copies of classic95, because that is what the game loads by default.
**To switch themes**, point the game's map at a theme folder, either at startup or from an Options menu:

```js
function setPieceTheme(theme){            // 'classic95' | 'icons' | 'pixel-gems' | 'smiley'
  ['red_man','red_king','black_man','black_king'].forEach(function(id){
    ASSETS.pieces[id] = 'pieces/' + theme + '/' + id + '.png';      // @2x is picked up automatically by applyAssets()
  });
  window.CHECKERS95_INSPECT_THEME = theme;   // Inspect viewer default theme
  // then re-run applyAssets() (or reload). The manifest already lists all theme files.
}
```

The SVGs reproduce the pixel art exactly (`shape-rendering="crispEdges"`), so they scale cleanly to any size.
Use `image-rendering: pixelated` when you scale the PNGs.

## Power pieces

Files are `pieces/powers/<color>_<man|king>_<power>.png` (+ `@2x`, `.svg`), `<color>` = `red`, `white` or `black`. Each one keeps the classic body and adds a thick
coloured ring with a glow, plus a centre emblem (kings also get a crown):

| Power | Colour | Emblem | Meaning |
|---|---|---|---|
| shield | `#1E6BFF` blue | shield | survives one capture |
| bomb | `#FF8C00` orange | bomb | when captured, it explodes and removes adjacent enemy men; kings survive |
| speed | `#22CC44` green | lightning | can move 2 squares diagonally |
| ghost | `#9B4DFF` purple | ghost (piece is semi-transparent) | once per game, hops over one of its own adjacent pieces |
| freeze | `#00E5FF` cyan | snowflake | freezes adjacent enemies for 1 turn |

**Themed power pieces:** `pieces/powers/<theme>/<color>_<man|king>_<power>.png` (+ `@2x`, `.svg`) for `icons`, `pixel-gems` and `smiley`.
They use that theme's body (floppy/monitor, gem, smiley face) inside the same coloured ring and glow. The power emblem sits on a small dark badge at the bottom right,
so the theme's face stays visible. classic95 power pieces stay at `pieces/powers/<id>.png` (the default). Use it like this:

```js
ASSETS.powerPiece = theme === 'classic95' ? 'pieces/powers/{id}.png' : 'pieces/powers/' + theme + '/{id}.png';
```

See `powers_themes_preview.png`.

### Commodore 64 power set (`c64`)

`pieces/powers/c64/<red|white|black>_<man|king>_<power>.png` (56px, `@2x` 112px, `.svg`) is a power-pieces-only theme in C64 hardware-sprite style. See `c64_powers_preview.png`.
* Strict 16-colour Pepto palette. No anti-aliasing, no alpha blending and no glow gradients.
* Each piece is built from real C64 sprite parts on a 28x28 sprite-pixel grid, then scaled with nearest neighbour (x2 / x4):
  * a 24x21 **multicolour** body sprite: double-wide pixels, 3 colours = team light, team dark, power colour.
  * The glow is replaced by a chunky ring in the power colour.
  * A hi-res **8x8 PETSCII-style emblem**: shield, bomb with fuse, lightning, ghost, snowflake.
  * For kings, an 8x6 multicolour **chunky crown** (yellow/orange/white).
  * A black hi-res sprite for the outline and the emblem's drop shadow.
* Team colours: red = light red #9A6759 / red #68372B, white = white / light grey #959595, black = dark grey #444444 / black.
* Power colours: shield light blue #6C5EB5, bomb orange #6F4F25 (yellow spark), speed light green #9AD284, ghost purple #6F3D86, freeze cyan #70A4B2.
* **2-frame animations:** `pieces/powers/c64/power_<power>_anim.png` (+`@2x`).
  * Each one is a sprite sheet, 2 columns (frame 0 / frame 1) x 6 rows (red man, red king, white man, white king, black man, black king), 56px cells (112px in @2x).
  * Frame 1 flashes the ring into segments, and the bomb's fuse flickers.
  * Frame 0 is identical to the static PNG. Swap frames every ~250 ms:

```css
.pc.c64anim{background-size:112px 336px!important;animation:c64flash .5s steps(1) infinite}
@keyframes c64flash{50%{background-position-x:-56px}}
/* background-image: url(assets/pieces/powers/c64/power_bomb_anim.png); background-position-y: -(row*56)px */
```

* Overlays: `overlays/c64/frozen.png` (dithered ice frame, no alpha) and `overlays/c64/shield_broken.png` (white/black pixel crack).
* Use it like the other themed powers:

```js
ASSETS.powerPiece = 'pieces/powers/c64/{id}.png';
ASSETS.overlays.frozen = 'overlays/c64/frozen.png'; ASSETS.overlays.shieldBroken = 'overlays/c64/shield_broken.png';
```

* Inspect accepts it: `CheckersInspect.open('white_king_bomb', {theme:'c64'})`.
  * It shows no glow for this set.
  * Plain men and kings fall back to classic95.
  * The listbox has a "Commodore 64 power pieces" group.

Overlays to draw on top of a piece: `overlays/frozen.png` (ice tint) and `overlays/shield_broken.png` (shattered ring). See `powers_preview.png`.

## Side / turn indicator and White vs Black scheme (`ui/`)

Problem: in the current game it is not obvious which colour you play or whose turn it is. Contents of `ui/`:

* `ui/sides.js` + `ui/sides.css`: a drop-in module `window.CheckersSides`.
  * It has no dependencies, every class is prefixed `c95s-`, and images resolve relative to the script.
* Mockups at 1280x800, rendered from a patched copy of index.html. The game itself is untouched.
  * `ui/mockup_white_your_turn.png`: vs Computer, you are White, your turn.
  * `ui/mockup_black_computer_turn.png`: vs Computer, you are Black, the board is flipped, and the computer is thinking.
  * `ui/mockup_choose_side.png`: the Choose-your-side dialog.
* Crops of the parts: `ui/choose_side_dialog.png`, `ui/panel_active_you.png`, `ui/panel_inactive_computer.png`.
* Images:
  * `side_<red|white|black>_48.png` / `_32.png`: big panel / balloon icons.
  * `mini_<colour>_16.png`: captured-pieces row.
  * `turn_arrow_<right|left>_sheet.png`: 4-frame 16px bouncing arrow, also as single `_0.._3` frames.
  * `you_badge.png`: the "YOU" sticker.
  * `you_play_<colour>.png`: static "You play: (o) WHITE" labels.
  * `balloon_your_turn.png` / `balloon_computer_turn.png`: static balloon tooltips.
  * Everything has `@2x` versions.

**Design**
1. A sidebar to the right of the board holds two Win95 group-box panels: **top = opponent, bottom = you**. In two-player mode, bottom = Red/White and top = Black.
   * Each panel shows a 48px piece icon, the name (You / Computer / Player 1 = Black / Player 2), the piece and king count, and a "Captured:" sunken field with stacked 16px mini pieces.
   * The **active** panel gets a navy gradient caption with a bouncing yellow arrow and "Your turn". When the computer moves, it shows an hourglass and "Thinking...".
   * The **inactive** panel uses a grey caption, a 45% opacity icon and disabled-style embossed grey text.
2. A "YOU" sticker sits on your panel. Between the panels: `You play: (o) WHITE` and "(i) Black moves first."
3. A turn-change **balloon toast** ("Your turn!" / "Computer's turn..." with an hourglass) points at the active panel. It disappears after 2.2 s.
4. The **Choose your side** dialog has two big piece buttons (Red-or-White / Black, with "moves second" / "moves first"), a Colour scheme group (Red vs Black / White vs Black), a "Black moves first" note, and OK/Cancel.
   * Keys: Enter/Esc, arrow keys switch sides, and double-clicking a piece confirms.
5. **Orientation: the human's pieces are always at the bottom.** In `create()` Red/White already starts at the bottom (rows 5-7), so **flip the board only when the human plays Black** (the computer plays Red/White).
6. **Window title:**
   * `Checkers - You are White - Your turn`, `Checkers - You are Black - Computer's turn`, `Checkers - You are White - You win!`
   * Two players: `Checkers - Player 1 (Black) to move`.

**Wiring (about 15 lines in index.html)**

```html
<link rel="stylesheet" href="assets/ui/sides.css"><script src="assets/ui/sides.js"></script>
```
```js
// 1) layout: put the sidebar next to the board (once, at startup) and widen the window
var row=document.createElement('div');row.style.cssText='display:flex;gap:10px;width:100%';
var box=document.querySelector('#body > .in');box.parentNode.insertBefore(row,box);row.appendChild(box);
CheckersSides.mount(row);            // CSS: #main{left:calc(50% - 372px);width:744px} .c95s-side{justify-content:space-between}

// 2) colour scheme: keep the internal code 'r', only swap art + names
var SCHEME=opts.scheme||'red';       // 'red' | 'white'
NAME.r = SCHEME==='white' ? 'White' : 'Red';
// in setPieceTheme():  ASSETS.pieces[id]='pieces/'+t+'/'+(SCHEME==='white'?id.replace('red_','white_'):id)+'.png';
// in applyAssets() power loop:  var id=(x[0]==='red'&&SCHEME==='white'?'white':x[0])+'_'+t+'_'+pw;
// and use NAME.r instead of the literal 'Red' in #scount, the bins and the Computer <select>.

// 3) at the end of render():
var k={r:0,b:0};state.board.forEach(function(rw){rw.forEach(function(p){if(p&&p.k)k[p.c]++;});});
var human=aiColor?C.opp(aiColor):null;
var title=CheckersSides.update({turn:state.turn,human:human,scheme:SCHEME,
  count:{r:C.count(state,'r'),b:C.count(state,'b')},kings:k,
  captured:{r:12-C.count(state,'b'),b:12-C.count(state,'r')},     // pieces taken BY each side
  thinking:state.turn===aiColor,winner:state.winner});
document.querySelector('#dragbar span').textContent='\u25a0 '+title; document.title=title;
CheckersSides.flip($('wrap'), human==='b');                          // human always at the bottom

// 4) New Game when playing the computer -> ask first
CheckersSides.chooseSide({side:'r',scheme:SCHEME,onOK:function(side,scheme){
  opts.scheme=scheme;saveOpts();/* re-run setPieceTheme+applyAssets */ setAI(side==='r'?'b':'r'); newGame(); }});
```

Flip notes:
* `.c95s-flip` rotates `#wrap` 180 degrees and counter-rotates `.pc`, hole text, ads, mines and ice, so crowns stay upright.
* Clicks keep working because `data-r`/`data-c` don't change, and the hint SVG rotates with the board.
* During the 170 ms slide animation, `doMove()` overwrites the piece's transform. To keep the crown upright there too, append `rotate(180deg)` when flipped:
  `el.style.transform='translate(...)'+($('wrap').classList.contains('c95s-flip')?' rotate(180deg)':'')`.

API summary:
* `mount(el)`
* `update(info)` returns the title string.
* `toast(title,text,{icon:'r'|'w'|'b'|'hourglass',anchor,below,ms})`
* `chooseSide({side,scheme,onOK,onCancel})`
* `titleText(info)`
* `flip(el,on)`
* `colorName(side,scheme)`

## Using the assets in plain JS (if you're not using the ASSETS map)

```js
// 1) image pieces instead of CSS discs
var PIECE_IMG = {r:'assets/pieces/red_man.png', rk:'assets/pieces/red_king.png', b:'assets/pieces/black_man.png', bk:'assets/pieces/black_king.png'};
function pieceEl(p){ // p = {c:'r'|'b', k:bool, pw:null|'bomb'...}
  var e = document.createElement('div'); e.className = 'pc ' + p.c + (p.k ? ' k' : '');
  var src = p.pw ? 'assets/pieces/powers/' + (p.c==='r'?'red':'black') + '_' + (p.k?'king':'man') + '_' + p.pw + '.png' : PIECE_IMG[p.c + (p.k?'k':'')];
  e.style.cssText = 'width:56px;height:56px;background:url(' + src + ') center/56px no-repeat;image-rendering:pixelated;border-radius:0;box-shadow:none';
  return e;
}
// 2) tiles: .light{background:url(assets/tiles/light.png)} .dark{background:url(assets/tiles/dark.png)}

// 3) music loop + mute toggle; start only after the first user gesture (autoplay rules)
var music = new Audio('assets/audio/bg_loop.ogg');
music.loop = true; music.volume = 0.35;
var muted = localStorage.getItem('c95.mute') === '1';
document.addEventListener('pointerdown', function first(){ if(!muted) music.play().catch(function(){}); document.removeEventListener('pointerdown', first); });
function toggleMute(){ muted = !muted; localStorage.setItem('c95.mute', muted ? '1' : '0'); muted ? music.pause() : music.play().catch(function(){}); }

// 4) SFX (preloaded, overlapping-safe)
var SFX = {}; ['move','capture','king','invalid','win','lose','startup','mine','bsod','popup','popup_close','restore','teleport',
  'power_shield','power_bomb','power_speed','power_ghost','power_freeze'].forEach(function(n){ SFX[n] = new Audio('assets/audio/' + n + '.ogg'); });
function sfx(n, vol){ if(muted || !SFX[n]) return; var a = SFX[n].cloneNode(); a.volume = vol == null ? 0.7 : vol; a.play().catch(function(){}); }
```

All audio is Ogg Vorbis (44.1 kHz; the music is stereo, the SFX mono). I checked in Chrome that `bg_loop.ogg` decodes to exactly 3,528,000 samples (80.000 s, the same length as the source)
with a seam jump of 0.002, so it loops seamlessly and the WAV/MP3 were dropped. `<audio loop>` is fine; for a guaranteed sample-exact loop, use Web Audio:

```js
fetch('assets/audio/bg_loop.ogg').then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(buf => {
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(gain); src.start(); });
```

Safari before 17 can't decode Ogg Vorbis. If that matters, keep the game's built-in synth fallback.

**Music:** `bg_loop` is 80.00 s long (32 bars at 96 BPM, Fmaj7-Em7-Dm7-Cmaj7-Fmaj7-Em7-Dm7-G7sus progression). It's a mellow chiptune/early-MIDI
arrangement with pads, a triangle bass, a pulse arpeggio, a soft square lead with echo, bells and light drums. It's rendered circularly, so the end flows straight into the start
(the decoded seam jump is 0.002), with a peak of -2.9 dBFS and no clipping. All SFX peak between -0.2 and -9 dBFS with no clipping (`src/check_audio.py` decodes the OGGs and checks this).

## Inspect viewer (CS2-style 3D piece inspect)

`inspect.js` + `inspect.css` form a self-contained module in raw WebGL, with no CDN and no libraries. The piece art is embedded as data URIs, so it also works
from `file://`. The piece is drawn as a 3D coin: a bevelled cylinder with a ridged rim and plastic shading, with the art on the top face and the man art on the bottom.
Kings get a raised, metallic, voxel-extruded crown. Themed power ids use the themed power body, and power pieces get a pulsing coloured rim and glow (ghost pieces are see-through).

Controls: drag to rotate (with momentum), use the wheel or pinch to zoom, double-click to reset, and leave it idle for an auto-spin. **Inspect** (or the `I` key) plays a
flip + double-spin + settle flourish. `R` resets the view and `Esc` closes the dialog. The UI is a Win95 window titled "Inspect - Checkers 95" with a listbox of every piece
(4 themes, plus a power group that follows the selected theme; red and black, man and king), a description panel and a status bar.

```js
// The game loads assets/inspect.css + assets/inspect.js (paths are resolved from the script's own URL via document.currentScript).
CheckersInspect.open('black_man');                      // classic95 theme by default
CheckersInspect.open('red_king_bomb');                  // power piece (themes don't apply to powers)
CheckersInspect.open('red_king', {theme:'pixel-gems'}); // 'classic95' | 'icons' | 'pixel-gems' | 'smiley'
CheckersInspect.close();
```

| API | Description |
|---|---|
| `open(pieceId[, opts])` -> `true/false` | Opens (or retargets) the modal dialog. `pieceId` must match `^(red|black)_(man|king)(_(shield|bomb|speed|ghost|freeze))?$`. A bad id **returns `false` and logs a warning** (it does not throw). |
| `opts.theme` | `'classic95'` (default; `window.CHECKERS95_INSPECT_THEME` overrides the default) / `'icons'` / `'pixel-gems'` / `'smiley'`. It also applies to power ids: `open('red_king_bomb',{theme:'smiley'})` shows the smiley-body bomb king. |
| `opts.sound` | `true` plays `audio/teleport.ogg` on the flourish (default `false`, so the game controls sound) |
| `opts.flourish` | `false` skips the automatic intro flourish when opening |
| `opts.container` | A DOM element: mounts inline instead of as a modal overlay (used by `inspect.html`) |
| `opts.onClose` | Callback fired after `close()` |
| `close()` | Closes the dialog and stops rendering. Safe to call when it's already closed. |
| `isOpen()`, `inspect()` | Query the state / trigger the flourish |
| `list()`, `parseId(id)` | All 96 `{theme,id}` entries (4 themes x (4 basic + 20 power)) / parse an id into `{color,kind,power}` |

There are no CSS leaks: every class is prefixed `c95i-` and every rule is scoped under `.c95i-root`. The modal is a fixed full-page layer
(`z-index:1000`) that blocks clicks to the game while it's open, and the window can be dragged by its title bar. Only one WebGL context is created and reused. Without WebGL the dialog
still opens and shows a polite message. The standalone demo, `inspect.html`, accepts
`?piece=red_king&theme=icons` (plus `&yaw=..&pitch=..&dist=..` for a fixed pose, `&t=0..1` to freeze a flourish frame and `&mute`).
Screenshots: `inspect_screenshot.png`, `inspect_angles.png`, `inspect_flourish.gif` / `.mp4`.

## Every file (725 files)

| Path | Size / duration | Purpose |
|---|---|---|
| `pieces/black_king.png` | 56x56 | Default piece (classic95) |
| `pieces/black_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king.png` |
| `pieces/black_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king.png` |
| `pieces/black_man.png` | 56x56 | Default piece (classic95) |
| `pieces/black_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man.png` |
| `pieces/black_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man.png` |
| `pieces/red_king.png` | 56x56 | Default piece (classic95) |
| `pieces/red_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king.png` |
| `pieces/red_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king.png` |
| `pieces/red_man.png` | 56x56 | Default pieces (= classic95 copies). Game uses these via ASSETS.pieces |
| `pieces/red_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man.png` |
| `pieces/red_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man.png` |
| `pieces/white_king.png` | 56x56 | Default piece (classic95) |
| `pieces/white_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king.png` |
| `pieces/white_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king.png` |
| `pieces/white_man.png` | 56x56 | Default piece (classic95) |
| `pieces/white_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man.png` |
| `pieces/white_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man.png` |
| `pieces/classic95/black_king.png` | 56x56 | classic95 theme: black_king |
| `pieces/classic95/black_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king.png` |
| `pieces/classic95/black_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king.png` |
| `pieces/classic95/black_man.png` | 56x56 | classic95 theme: black_man |
| `pieces/classic95/black_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man.png` |
| `pieces/classic95/black_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man.png` |
| `pieces/classic95/red_king.png` | 56x56 | classic95 theme: red_king |
| `pieces/classic95/red_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king.png` |
| `pieces/classic95/red_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king.png` |
| `pieces/classic95/red_man.png` | 56x56 | classic95 theme: red_man |
| `pieces/classic95/red_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man.png` |
| `pieces/classic95/red_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man.png` |
| `pieces/classic95/white_king.png` | 56x56 | classic95 theme: white_king |
| `pieces/classic95/white_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king.png` |
| `pieces/classic95/white_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king.png` |
| `pieces/classic95/white_man.png` | 56x56 | classic95 theme: white_man |
| `pieces/classic95/white_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man.png` |
| `pieces/classic95/white_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man.png` |
| `pieces/icons/black_king.png` | 56x56 | icons theme: black_king |
| `pieces/icons/black_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king.png` |
| `pieces/icons/black_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king.png` |
| `pieces/icons/black_man.png` | 56x56 | icons theme: black_man |
| `pieces/icons/black_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man.png` |
| `pieces/icons/black_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man.png` |
| `pieces/icons/red_king.png` | 56x56 | icons theme: red_king |
| `pieces/icons/red_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king.png` |
| `pieces/icons/red_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king.png` |
| `pieces/icons/red_man.png` | 56x56 | icons theme: red_man |
| `pieces/icons/red_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man.png` |
| `pieces/icons/red_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man.png` |
| `pieces/icons/white_king.png` | 56x56 | icons theme: white_king |
| `pieces/icons/white_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king.png` |
| `pieces/icons/white_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king.png` |
| `pieces/icons/white_man.png` | 56x56 | icons theme: white_man |
| `pieces/icons/white_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man.png` |
| `pieces/icons/white_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man.png` |
| `pieces/pixel-gems/black_king.png` | 56x56 | pixel-gems theme: black_king |
| `pieces/pixel-gems/black_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king.png` |
| `pieces/pixel-gems/black_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king.png` |
| `pieces/pixel-gems/black_man.png` | 56x56 | pixel-gems theme: black_man |
| `pieces/pixel-gems/black_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man.png` |
| `pieces/pixel-gems/black_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man.png` |
| `pieces/pixel-gems/red_king.png` | 56x56 | pixel-gems theme: red_king |
| `pieces/pixel-gems/red_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king.png` |
| `pieces/pixel-gems/red_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king.png` |
| `pieces/pixel-gems/red_man.png` | 56x56 | pixel-gems theme: red_man |
| `pieces/pixel-gems/red_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man.png` |
| `pieces/pixel-gems/red_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man.png` |
| `pieces/pixel-gems/white_king.png` | 56x56 | pixel-gems theme: white_king |
| `pieces/pixel-gems/white_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king.png` |
| `pieces/pixel-gems/white_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king.png` |
| `pieces/pixel-gems/white_man.png` | 56x56 | pixel-gems theme: white_man |
| `pieces/pixel-gems/white_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man.png` |
| `pieces/pixel-gems/white_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man.png` |
| `pieces/smiley/black_king.png` | 56x56 | smiley theme: black_king |
| `pieces/smiley/black_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king.png` |
| `pieces/smiley/black_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king.png` |
| `pieces/smiley/black_man.png` | 56x56 | smiley theme: black_man |
| `pieces/smiley/black_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man.png` |
| `pieces/smiley/black_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man.png` |
| `pieces/smiley/red_king.png` | 56x56 | smiley theme: red_king |
| `pieces/smiley/red_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king.png` |
| `pieces/smiley/red_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king.png` |
| `pieces/smiley/red_man.png` | 56x56 | smiley theme: red_man |
| `pieces/smiley/red_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man.png` |
| `pieces/smiley/red_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man.png` |
| `pieces/smiley/white_king.png` | 56x56 | smiley theme: white_king |
| `pieces/smiley/white_king.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king.png` |
| `pieces/smiley/white_king@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king.png` |
| `pieces/smiley/white_man.png` | 56x56 | smiley theme: white_man |
| `pieces/smiley/white_man.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man.png` |
| `pieces/smiley/white_man@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man.png` |
| `pieces/powers/black_king_bomb.png` | 56x56 | Power piece black_king_bomb |
| `pieces/powers/black_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_bomb.png` |
| `pieces/powers/black_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_bomb.png` |
| `pieces/powers/black_king_freeze.png` | 56x56 | Power piece black_king_freeze |
| `pieces/powers/black_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_freeze.png` |
| `pieces/powers/black_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_freeze.png` |
| `pieces/powers/black_king_ghost.png` | 56x56 | Power piece black_king_ghost |
| `pieces/powers/black_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_ghost.png` |
| `pieces/powers/black_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_ghost.png` |
| `pieces/powers/black_king_shield.png` | 56x56 | Power piece black_king_shield |
| `pieces/powers/black_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_shield.png` |
| `pieces/powers/black_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_shield.png` |
| `pieces/powers/black_king_speed.png` | 56x56 | Power piece black_king_speed |
| `pieces/powers/black_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_speed.png` |
| `pieces/powers/black_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_speed.png` |
| `pieces/powers/black_man_bomb.png` | 56x56 | Power piece black_man_bomb |
| `pieces/powers/black_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_bomb.png` |
| `pieces/powers/black_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_bomb.png` |
| `pieces/powers/black_man_freeze.png` | 56x56 | Power piece black_man_freeze |
| `pieces/powers/black_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_freeze.png` |
| `pieces/powers/black_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_freeze.png` |
| `pieces/powers/black_man_ghost.png` | 56x56 | Power piece black_man_ghost |
| `pieces/powers/black_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_ghost.png` |
| `pieces/powers/black_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_ghost.png` |
| `pieces/powers/black_man_shield.png` | 56x56 | Power piece black_man_shield |
| `pieces/powers/black_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_shield.png` |
| `pieces/powers/black_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_shield.png` |
| `pieces/powers/black_man_speed.png` | 56x56 | Power piece black_man_speed |
| `pieces/powers/black_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_speed.png` |
| `pieces/powers/black_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_speed.png` |
| `pieces/powers/c64/black_king_bomb.png` | 56x56 | C64 power piece black_king_bomb |
| `pieces/powers/c64/black_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_bomb.png` |
| `pieces/powers/c64/black_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_bomb.png` |
| `pieces/powers/c64/black_king_freeze.png` | 56x56 | C64 power piece black_king_freeze |
| `pieces/powers/c64/black_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_freeze.png` |
| `pieces/powers/c64/black_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_freeze.png` |
| `pieces/powers/c64/black_king_ghost.png` | 56x56 | C64 power piece black_king_ghost |
| `pieces/powers/c64/black_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_ghost.png` |
| `pieces/powers/c64/black_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_ghost.png` |
| `pieces/powers/c64/black_king_shield.png` | 56x56 | C64 power piece black_king_shield |
| `pieces/powers/c64/black_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_shield.png` |
| `pieces/powers/c64/black_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_shield.png` |
| `pieces/powers/c64/black_king_speed.png` | 56x56 | C64 power piece black_king_speed |
| `pieces/powers/c64/black_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_speed.png` |
| `pieces/powers/c64/black_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_speed.png` |
| `pieces/powers/c64/black_man_bomb.png` | 56x56 | C64 power piece black_man_bomb |
| `pieces/powers/c64/black_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_bomb.png` |
| `pieces/powers/c64/black_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_bomb.png` |
| `pieces/powers/c64/black_man_freeze.png` | 56x56 | C64 power piece black_man_freeze |
| `pieces/powers/c64/black_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_freeze.png` |
| `pieces/powers/c64/black_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_freeze.png` |
| `pieces/powers/c64/black_man_ghost.png` | 56x56 | C64 power piece black_man_ghost |
| `pieces/powers/c64/black_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_ghost.png` |
| `pieces/powers/c64/black_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_ghost.png` |
| `pieces/powers/c64/black_man_shield.png` | 56x56 | C64 power piece black_man_shield |
| `pieces/powers/c64/black_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_shield.png` |
| `pieces/powers/c64/black_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_shield.png` |
| `pieces/powers/c64/black_man_speed.png` | 56x56 | C64 power piece black_man_speed |
| `pieces/powers/c64/black_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_speed.png` |
| `pieces/powers/c64/black_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_speed.png` |
| `pieces/powers/c64/power_bomb_anim.png` | 112x336 | 2-frame anim sheet (2 cols x 6 rows: red/white/black man/king) |
| `pieces/powers/c64/power_bomb_anim@2x.png` | 224x672 | 2x (nearest-neighbour) of `power_bomb_anim.png` |
| `pieces/powers/c64/power_freeze_anim.png` | 112x336 | 2-frame anim sheet (2 cols x 6 rows: red/white/black man/king) |
| `pieces/powers/c64/power_freeze_anim@2x.png` | 224x672 | 2x (nearest-neighbour) of `power_freeze_anim.png` |
| `pieces/powers/c64/power_ghost_anim.png` | 112x336 | 2-frame anim sheet (2 cols x 6 rows: red/white/black man/king) |
| `pieces/powers/c64/power_ghost_anim@2x.png` | 224x672 | 2x (nearest-neighbour) of `power_ghost_anim.png` |
| `pieces/powers/c64/power_shield_anim.png` | 112x336 | 2-frame anim sheet (2 cols x 6 rows: red/white/black man/king) |
| `pieces/powers/c64/power_shield_anim@2x.png` | 224x672 | 2x (nearest-neighbour) of `power_shield_anim.png` |
| `pieces/powers/c64/power_speed_anim.png` | 112x336 | 2-frame anim sheet (2 cols x 6 rows: red/white/black man/king) |
| `pieces/powers/c64/power_speed_anim@2x.png` | 224x672 | 2x (nearest-neighbour) of `power_speed_anim.png` |
| `pieces/powers/c64/red_king_bomb.png` | 56x56 | C64 power piece red_king_bomb |
| `pieces/powers/c64/red_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_bomb.png` |
| `pieces/powers/c64/red_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_bomb.png` |
| `pieces/powers/c64/red_king_freeze.png` | 56x56 | C64 power piece red_king_freeze |
| `pieces/powers/c64/red_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_freeze.png` |
| `pieces/powers/c64/red_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_freeze.png` |
| `pieces/powers/c64/red_king_ghost.png` | 56x56 | C64 power piece red_king_ghost |
| `pieces/powers/c64/red_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_ghost.png` |
| `pieces/powers/c64/red_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_ghost.png` |
| `pieces/powers/c64/red_king_shield.png` | 56x56 | C64 power piece red_king_shield |
| `pieces/powers/c64/red_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_shield.png` |
| `pieces/powers/c64/red_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_shield.png` |
| `pieces/powers/c64/red_king_speed.png` | 56x56 | C64 power piece red_king_speed |
| `pieces/powers/c64/red_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_speed.png` |
| `pieces/powers/c64/red_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_speed.png` |
| `pieces/powers/c64/red_man_bomb.png` | 56x56 | C64 power piece red_man_bomb |
| `pieces/powers/c64/red_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_bomb.png` |
| `pieces/powers/c64/red_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_bomb.png` |
| `pieces/powers/c64/red_man_freeze.png` | 56x56 | C64 power piece red_man_freeze |
| `pieces/powers/c64/red_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_freeze.png` |
| `pieces/powers/c64/red_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_freeze.png` |
| `pieces/powers/c64/red_man_ghost.png` | 56x56 | C64 power piece red_man_ghost |
| `pieces/powers/c64/red_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_ghost.png` |
| `pieces/powers/c64/red_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_ghost.png` |
| `pieces/powers/c64/red_man_shield.png` | 56x56 | C64 power piece red_man_shield |
| `pieces/powers/c64/red_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_shield.png` |
| `pieces/powers/c64/red_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_shield.png` |
| `pieces/powers/c64/red_man_speed.png` | 56x56 | C64 power piece red_man_speed |
| `pieces/powers/c64/red_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_speed.png` |
| `pieces/powers/c64/red_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_speed.png` |
| `pieces/powers/c64/white_king_bomb.png` | 56x56 | C64 power piece white_king_bomb |
| `pieces/powers/c64/white_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_bomb.png` |
| `pieces/powers/c64/white_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_bomb.png` |
| `pieces/powers/c64/white_king_freeze.png` | 56x56 | C64 power piece white_king_freeze |
| `pieces/powers/c64/white_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_freeze.png` |
| `pieces/powers/c64/white_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_freeze.png` |
| `pieces/powers/c64/white_king_ghost.png` | 56x56 | C64 power piece white_king_ghost |
| `pieces/powers/c64/white_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_ghost.png` |
| `pieces/powers/c64/white_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_ghost.png` |
| `pieces/powers/c64/white_king_shield.png` | 56x56 | C64 power piece white_king_shield |
| `pieces/powers/c64/white_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_shield.png` |
| `pieces/powers/c64/white_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_shield.png` |
| `pieces/powers/c64/white_king_speed.png` | 56x56 | C64 power piece white_king_speed |
| `pieces/powers/c64/white_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_speed.png` |
| `pieces/powers/c64/white_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_speed.png` |
| `pieces/powers/c64/white_man_bomb.png` | 56x56 | C64 power piece white_man_bomb |
| `pieces/powers/c64/white_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_bomb.png` |
| `pieces/powers/c64/white_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_bomb.png` |
| `pieces/powers/c64/white_man_freeze.png` | 56x56 | C64 power piece white_man_freeze |
| `pieces/powers/c64/white_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_freeze.png` |
| `pieces/powers/c64/white_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_freeze.png` |
| `pieces/powers/c64/white_man_ghost.png` | 56x56 | C64 power piece white_man_ghost |
| `pieces/powers/c64/white_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_ghost.png` |
| `pieces/powers/c64/white_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_ghost.png` |
| `pieces/powers/c64/white_man_shield.png` | 56x56 | C64 power piece white_man_shield |
| `pieces/powers/c64/white_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_shield.png` |
| `pieces/powers/c64/white_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_shield.png` |
| `pieces/powers/c64/white_man_speed.png` | 56x56 | C64 power piece white_man_speed |
| `pieces/powers/c64/white_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_speed.png` |
| `pieces/powers/c64/white_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_speed.png` |
| `pieces/powers/icons/black_king_bomb.png` | 56x56 | icons theme power piece black_king_bomb |
| `pieces/powers/icons/black_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_bomb.png` |
| `pieces/powers/icons/black_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_bomb.png` |
| `pieces/powers/icons/black_king_freeze.png` | 56x56 | icons theme power piece black_king_freeze |
| `pieces/powers/icons/black_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_freeze.png` |
| `pieces/powers/icons/black_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_freeze.png` |
| `pieces/powers/icons/black_king_ghost.png` | 56x56 | icons theme power piece black_king_ghost |
| `pieces/powers/icons/black_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_ghost.png` |
| `pieces/powers/icons/black_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_ghost.png` |
| `pieces/powers/icons/black_king_shield.png` | 56x56 | icons theme power piece black_king_shield |
| `pieces/powers/icons/black_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_shield.png` |
| `pieces/powers/icons/black_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_shield.png` |
| `pieces/powers/icons/black_king_speed.png` | 56x56 | icons theme power piece black_king_speed |
| `pieces/powers/icons/black_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_speed.png` |
| `pieces/powers/icons/black_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_speed.png` |
| `pieces/powers/icons/black_man_bomb.png` | 56x56 | icons theme power piece black_man_bomb |
| `pieces/powers/icons/black_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_bomb.png` |
| `pieces/powers/icons/black_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_bomb.png` |
| `pieces/powers/icons/black_man_freeze.png` | 56x56 | icons theme power piece black_man_freeze |
| `pieces/powers/icons/black_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_freeze.png` |
| `pieces/powers/icons/black_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_freeze.png` |
| `pieces/powers/icons/black_man_ghost.png` | 56x56 | icons theme power piece black_man_ghost |
| `pieces/powers/icons/black_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_ghost.png` |
| `pieces/powers/icons/black_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_ghost.png` |
| `pieces/powers/icons/black_man_shield.png` | 56x56 | icons theme power piece black_man_shield |
| `pieces/powers/icons/black_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_shield.png` |
| `pieces/powers/icons/black_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_shield.png` |
| `pieces/powers/icons/black_man_speed.png` | 56x56 | icons theme power piece black_man_speed |
| `pieces/powers/icons/black_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_speed.png` |
| `pieces/powers/icons/black_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_speed.png` |
| `pieces/powers/icons/red_king_bomb.png` | 56x56 | icons theme power piece red_king_bomb |
| `pieces/powers/icons/red_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_bomb.png` |
| `pieces/powers/icons/red_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_bomb.png` |
| `pieces/powers/icons/red_king_freeze.png` | 56x56 | icons theme power piece red_king_freeze |
| `pieces/powers/icons/red_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_freeze.png` |
| `pieces/powers/icons/red_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_freeze.png` |
| `pieces/powers/icons/red_king_ghost.png` | 56x56 | icons theme power piece red_king_ghost |
| `pieces/powers/icons/red_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_ghost.png` |
| `pieces/powers/icons/red_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_ghost.png` |
| `pieces/powers/icons/red_king_shield.png` | 56x56 | icons theme power piece red_king_shield |
| `pieces/powers/icons/red_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_shield.png` |
| `pieces/powers/icons/red_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_shield.png` |
| `pieces/powers/icons/red_king_speed.png` | 56x56 | icons theme power piece red_king_speed |
| `pieces/powers/icons/red_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_speed.png` |
| `pieces/powers/icons/red_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_speed.png` |
| `pieces/powers/icons/red_man_bomb.png` | 56x56 | icons theme power piece red_man_bomb |
| `pieces/powers/icons/red_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_bomb.png` |
| `pieces/powers/icons/red_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_bomb.png` |
| `pieces/powers/icons/red_man_freeze.png` | 56x56 | icons theme power piece red_man_freeze |
| `pieces/powers/icons/red_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_freeze.png` |
| `pieces/powers/icons/red_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_freeze.png` |
| `pieces/powers/icons/red_man_ghost.png` | 56x56 | icons theme power piece red_man_ghost |
| `pieces/powers/icons/red_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_ghost.png` |
| `pieces/powers/icons/red_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_ghost.png` |
| `pieces/powers/icons/red_man_shield.png` | 56x56 | icons theme power piece red_man_shield |
| `pieces/powers/icons/red_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_shield.png` |
| `pieces/powers/icons/red_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_shield.png` |
| `pieces/powers/icons/red_man_speed.png` | 56x56 | icons theme power piece red_man_speed |
| `pieces/powers/icons/red_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_speed.png` |
| `pieces/powers/icons/red_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_speed.png` |
| `pieces/powers/icons/white_king_bomb.png` | 56x56 | icons theme power piece white_king_bomb |
| `pieces/powers/icons/white_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_bomb.png` |
| `pieces/powers/icons/white_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_bomb.png` |
| `pieces/powers/icons/white_king_freeze.png` | 56x56 | icons theme power piece white_king_freeze |
| `pieces/powers/icons/white_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_freeze.png` |
| `pieces/powers/icons/white_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_freeze.png` |
| `pieces/powers/icons/white_king_ghost.png` | 56x56 | icons theme power piece white_king_ghost |
| `pieces/powers/icons/white_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_ghost.png` |
| `pieces/powers/icons/white_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_ghost.png` |
| `pieces/powers/icons/white_king_shield.png` | 56x56 | icons theme power piece white_king_shield |
| `pieces/powers/icons/white_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_shield.png` |
| `pieces/powers/icons/white_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_shield.png` |
| `pieces/powers/icons/white_king_speed.png` | 56x56 | icons theme power piece white_king_speed |
| `pieces/powers/icons/white_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_speed.png` |
| `pieces/powers/icons/white_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_speed.png` |
| `pieces/powers/icons/white_man_bomb.png` | 56x56 | icons theme power piece white_man_bomb |
| `pieces/powers/icons/white_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_bomb.png` |
| `pieces/powers/icons/white_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_bomb.png` |
| `pieces/powers/icons/white_man_freeze.png` | 56x56 | icons theme power piece white_man_freeze |
| `pieces/powers/icons/white_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_freeze.png` |
| `pieces/powers/icons/white_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_freeze.png` |
| `pieces/powers/icons/white_man_ghost.png` | 56x56 | icons theme power piece white_man_ghost |
| `pieces/powers/icons/white_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_ghost.png` |
| `pieces/powers/icons/white_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_ghost.png` |
| `pieces/powers/icons/white_man_shield.png` | 56x56 | icons theme power piece white_man_shield |
| `pieces/powers/icons/white_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_shield.png` |
| `pieces/powers/icons/white_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_shield.png` |
| `pieces/powers/icons/white_man_speed.png` | 56x56 | icons theme power piece white_man_speed |
| `pieces/powers/icons/white_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_speed.png` |
| `pieces/powers/icons/white_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_speed.png` |
| `pieces/powers/pixel-gems/black_king_bomb.png` | 56x56 | pixel-gems theme power piece black_king_bomb |
| `pieces/powers/pixel-gems/black_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_bomb.png` |
| `pieces/powers/pixel-gems/black_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_bomb.png` |
| `pieces/powers/pixel-gems/black_king_freeze.png` | 56x56 | pixel-gems theme power piece black_king_freeze |
| `pieces/powers/pixel-gems/black_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_freeze.png` |
| `pieces/powers/pixel-gems/black_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_freeze.png` |
| `pieces/powers/pixel-gems/black_king_ghost.png` | 56x56 | pixel-gems theme power piece black_king_ghost |
| `pieces/powers/pixel-gems/black_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_ghost.png` |
| `pieces/powers/pixel-gems/black_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_ghost.png` |
| `pieces/powers/pixel-gems/black_king_shield.png` | 56x56 | pixel-gems theme power piece black_king_shield |
| `pieces/powers/pixel-gems/black_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_shield.png` |
| `pieces/powers/pixel-gems/black_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_shield.png` |
| `pieces/powers/pixel-gems/black_king_speed.png` | 56x56 | pixel-gems theme power piece black_king_speed |
| `pieces/powers/pixel-gems/black_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_speed.png` |
| `pieces/powers/pixel-gems/black_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_speed.png` |
| `pieces/powers/pixel-gems/black_man_bomb.png` | 56x56 | pixel-gems theme power piece black_man_bomb |
| `pieces/powers/pixel-gems/black_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_bomb.png` |
| `pieces/powers/pixel-gems/black_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_bomb.png` |
| `pieces/powers/pixel-gems/black_man_freeze.png` | 56x56 | pixel-gems theme power piece black_man_freeze |
| `pieces/powers/pixel-gems/black_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_freeze.png` |
| `pieces/powers/pixel-gems/black_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_freeze.png` |
| `pieces/powers/pixel-gems/black_man_ghost.png` | 56x56 | pixel-gems theme power piece black_man_ghost |
| `pieces/powers/pixel-gems/black_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_ghost.png` |
| `pieces/powers/pixel-gems/black_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_ghost.png` |
| `pieces/powers/pixel-gems/black_man_shield.png` | 56x56 | pixel-gems theme power piece black_man_shield |
| `pieces/powers/pixel-gems/black_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_shield.png` |
| `pieces/powers/pixel-gems/black_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_shield.png` |
| `pieces/powers/pixel-gems/black_man_speed.png` | 56x56 | pixel-gems theme power piece black_man_speed |
| `pieces/powers/pixel-gems/black_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_speed.png` |
| `pieces/powers/pixel-gems/black_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_speed.png` |
| `pieces/powers/pixel-gems/red_king_bomb.png` | 56x56 | pixel-gems theme power piece red_king_bomb |
| `pieces/powers/pixel-gems/red_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_bomb.png` |
| `pieces/powers/pixel-gems/red_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_bomb.png` |
| `pieces/powers/pixel-gems/red_king_freeze.png` | 56x56 | pixel-gems theme power piece red_king_freeze |
| `pieces/powers/pixel-gems/red_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_freeze.png` |
| `pieces/powers/pixel-gems/red_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_freeze.png` |
| `pieces/powers/pixel-gems/red_king_ghost.png` | 56x56 | pixel-gems theme power piece red_king_ghost |
| `pieces/powers/pixel-gems/red_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_ghost.png` |
| `pieces/powers/pixel-gems/red_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_ghost.png` |
| `pieces/powers/pixel-gems/red_king_shield.png` | 56x56 | pixel-gems theme power piece red_king_shield |
| `pieces/powers/pixel-gems/red_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_shield.png` |
| `pieces/powers/pixel-gems/red_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_shield.png` |
| `pieces/powers/pixel-gems/red_king_speed.png` | 56x56 | pixel-gems theme power piece red_king_speed |
| `pieces/powers/pixel-gems/red_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_speed.png` |
| `pieces/powers/pixel-gems/red_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_speed.png` |
| `pieces/powers/pixel-gems/red_man_bomb.png` | 56x56 | pixel-gems theme power piece red_man_bomb |
| `pieces/powers/pixel-gems/red_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_bomb.png` |
| `pieces/powers/pixel-gems/red_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_bomb.png` |
| `pieces/powers/pixel-gems/red_man_freeze.png` | 56x56 | pixel-gems theme power piece red_man_freeze |
| `pieces/powers/pixel-gems/red_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_freeze.png` |
| `pieces/powers/pixel-gems/red_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_freeze.png` |
| `pieces/powers/pixel-gems/red_man_ghost.png` | 56x56 | pixel-gems theme power piece red_man_ghost |
| `pieces/powers/pixel-gems/red_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_ghost.png` |
| `pieces/powers/pixel-gems/red_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_ghost.png` |
| `pieces/powers/pixel-gems/red_man_shield.png` | 56x56 | pixel-gems theme power piece red_man_shield |
| `pieces/powers/pixel-gems/red_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_shield.png` |
| `pieces/powers/pixel-gems/red_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_shield.png` |
| `pieces/powers/pixel-gems/red_man_speed.png` | 56x56 | pixel-gems theme power piece red_man_speed |
| `pieces/powers/pixel-gems/red_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_speed.png` |
| `pieces/powers/pixel-gems/red_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_speed.png` |
| `pieces/powers/pixel-gems/white_king_bomb.png` | 56x56 | pixel-gems theme power piece white_king_bomb |
| `pieces/powers/pixel-gems/white_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_bomb.png` |
| `pieces/powers/pixel-gems/white_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_bomb.png` |
| `pieces/powers/pixel-gems/white_king_freeze.png` | 56x56 | pixel-gems theme power piece white_king_freeze |
| `pieces/powers/pixel-gems/white_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_freeze.png` |
| `pieces/powers/pixel-gems/white_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_freeze.png` |
| `pieces/powers/pixel-gems/white_king_ghost.png` | 56x56 | pixel-gems theme power piece white_king_ghost |
| `pieces/powers/pixel-gems/white_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_ghost.png` |
| `pieces/powers/pixel-gems/white_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_ghost.png` |
| `pieces/powers/pixel-gems/white_king_shield.png` | 56x56 | pixel-gems theme power piece white_king_shield |
| `pieces/powers/pixel-gems/white_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_shield.png` |
| `pieces/powers/pixel-gems/white_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_shield.png` |
| `pieces/powers/pixel-gems/white_king_speed.png` | 56x56 | pixel-gems theme power piece white_king_speed |
| `pieces/powers/pixel-gems/white_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_speed.png` |
| `pieces/powers/pixel-gems/white_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_speed.png` |
| `pieces/powers/pixel-gems/white_man_bomb.png` | 56x56 | pixel-gems theme power piece white_man_bomb |
| `pieces/powers/pixel-gems/white_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_bomb.png` |
| `pieces/powers/pixel-gems/white_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_bomb.png` |
| `pieces/powers/pixel-gems/white_man_freeze.png` | 56x56 | pixel-gems theme power piece white_man_freeze |
| `pieces/powers/pixel-gems/white_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_freeze.png` |
| `pieces/powers/pixel-gems/white_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_freeze.png` |
| `pieces/powers/pixel-gems/white_man_ghost.png` | 56x56 | pixel-gems theme power piece white_man_ghost |
| `pieces/powers/pixel-gems/white_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_ghost.png` |
| `pieces/powers/pixel-gems/white_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_ghost.png` |
| `pieces/powers/pixel-gems/white_man_shield.png` | 56x56 | pixel-gems theme power piece white_man_shield |
| `pieces/powers/pixel-gems/white_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_shield.png` |
| `pieces/powers/pixel-gems/white_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_shield.png` |
| `pieces/powers/pixel-gems/white_man_speed.png` | 56x56 | pixel-gems theme power piece white_man_speed |
| `pieces/powers/pixel-gems/white_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_speed.png` |
| `pieces/powers/pixel-gems/white_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_speed.png` |
| `pieces/powers/red_king_bomb.png` | 56x56 | Power piece red_king_bomb |
| `pieces/powers/red_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_bomb.png` |
| `pieces/powers/red_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_bomb.png` |
| `pieces/powers/red_king_freeze.png` | 56x56 | Power piece red_king_freeze |
| `pieces/powers/red_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_freeze.png` |
| `pieces/powers/red_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_freeze.png` |
| `pieces/powers/red_king_ghost.png` | 56x56 | Power piece red_king_ghost |
| `pieces/powers/red_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_ghost.png` |
| `pieces/powers/red_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_ghost.png` |
| `pieces/powers/red_king_shield.png` | 56x56 | Power piece red_king_shield |
| `pieces/powers/red_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_shield.png` |
| `pieces/powers/red_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_shield.png` |
| `pieces/powers/red_king_speed.png` | 56x56 | Power piece red_king_speed |
| `pieces/powers/red_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_speed.png` |
| `pieces/powers/red_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_speed.png` |
| `pieces/powers/red_man_bomb.png` | 56x56 | Power piece red_man_bomb |
| `pieces/powers/red_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_bomb.png` |
| `pieces/powers/red_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_bomb.png` |
| `pieces/powers/red_man_freeze.png` | 56x56 | Power piece red_man_freeze |
| `pieces/powers/red_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_freeze.png` |
| `pieces/powers/red_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_freeze.png` |
| `pieces/powers/red_man_ghost.png` | 56x56 | Power piece red_man_ghost |
| `pieces/powers/red_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_ghost.png` |
| `pieces/powers/red_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_ghost.png` |
| `pieces/powers/red_man_shield.png` | 56x56 | Power piece red_man_shield |
| `pieces/powers/red_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_shield.png` |
| `pieces/powers/red_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_shield.png` |
| `pieces/powers/red_man_speed.png` | 56x56 | Power piece red_man_speed |
| `pieces/powers/red_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_speed.png` |
| `pieces/powers/red_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_speed.png` |
| `pieces/powers/smiley/black_king_bomb.png` | 56x56 | smiley theme power piece black_king_bomb |
| `pieces/powers/smiley/black_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_bomb.png` |
| `pieces/powers/smiley/black_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_bomb.png` |
| `pieces/powers/smiley/black_king_freeze.png` | 56x56 | smiley theme power piece black_king_freeze |
| `pieces/powers/smiley/black_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_freeze.png` |
| `pieces/powers/smiley/black_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_freeze.png` |
| `pieces/powers/smiley/black_king_ghost.png` | 56x56 | smiley theme power piece black_king_ghost |
| `pieces/powers/smiley/black_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_ghost.png` |
| `pieces/powers/smiley/black_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_ghost.png` |
| `pieces/powers/smiley/black_king_shield.png` | 56x56 | smiley theme power piece black_king_shield |
| `pieces/powers/smiley/black_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_shield.png` |
| `pieces/powers/smiley/black_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_shield.png` |
| `pieces/powers/smiley/black_king_speed.png` | 56x56 | smiley theme power piece black_king_speed |
| `pieces/powers/smiley/black_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_king_speed.png` |
| `pieces/powers/smiley/black_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_king_speed.png` |
| `pieces/powers/smiley/black_man_bomb.png` | 56x56 | smiley theme power piece black_man_bomb |
| `pieces/powers/smiley/black_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_bomb.png` |
| `pieces/powers/smiley/black_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_bomb.png` |
| `pieces/powers/smiley/black_man_freeze.png` | 56x56 | smiley theme power piece black_man_freeze |
| `pieces/powers/smiley/black_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_freeze.png` |
| `pieces/powers/smiley/black_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_freeze.png` |
| `pieces/powers/smiley/black_man_ghost.png` | 56x56 | smiley theme power piece black_man_ghost |
| `pieces/powers/smiley/black_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_ghost.png` |
| `pieces/powers/smiley/black_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_ghost.png` |
| `pieces/powers/smiley/black_man_shield.png` | 56x56 | smiley theme power piece black_man_shield |
| `pieces/powers/smiley/black_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_shield.png` |
| `pieces/powers/smiley/black_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_shield.png` |
| `pieces/powers/smiley/black_man_speed.png` | 56x56 | smiley theme power piece black_man_speed |
| `pieces/powers/smiley/black_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `black_man_speed.png` |
| `pieces/powers/smiley/black_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `black_man_speed.png` |
| `pieces/powers/smiley/red_king_bomb.png` | 56x56 | smiley theme power piece red_king_bomb |
| `pieces/powers/smiley/red_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_bomb.png` |
| `pieces/powers/smiley/red_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_bomb.png` |
| `pieces/powers/smiley/red_king_freeze.png` | 56x56 | smiley theme power piece red_king_freeze |
| `pieces/powers/smiley/red_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_freeze.png` |
| `pieces/powers/smiley/red_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_freeze.png` |
| `pieces/powers/smiley/red_king_ghost.png` | 56x56 | smiley theme power piece red_king_ghost |
| `pieces/powers/smiley/red_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_ghost.png` |
| `pieces/powers/smiley/red_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_ghost.png` |
| `pieces/powers/smiley/red_king_shield.png` | 56x56 | smiley theme power piece red_king_shield |
| `pieces/powers/smiley/red_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_shield.png` |
| `pieces/powers/smiley/red_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_shield.png` |
| `pieces/powers/smiley/red_king_speed.png` | 56x56 | smiley theme power piece red_king_speed |
| `pieces/powers/smiley/red_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_king_speed.png` |
| `pieces/powers/smiley/red_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_king_speed.png` |
| `pieces/powers/smiley/red_man_bomb.png` | 56x56 | smiley theme power piece red_man_bomb |
| `pieces/powers/smiley/red_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_bomb.png` |
| `pieces/powers/smiley/red_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_bomb.png` |
| `pieces/powers/smiley/red_man_freeze.png` | 56x56 | smiley theme power piece red_man_freeze |
| `pieces/powers/smiley/red_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_freeze.png` |
| `pieces/powers/smiley/red_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_freeze.png` |
| `pieces/powers/smiley/red_man_ghost.png` | 56x56 | smiley theme power piece red_man_ghost |
| `pieces/powers/smiley/red_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_ghost.png` |
| `pieces/powers/smiley/red_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_ghost.png` |
| `pieces/powers/smiley/red_man_shield.png` | 56x56 | smiley theme power piece red_man_shield |
| `pieces/powers/smiley/red_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_shield.png` |
| `pieces/powers/smiley/red_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_shield.png` |
| `pieces/powers/smiley/red_man_speed.png` | 56x56 | smiley theme power piece red_man_speed |
| `pieces/powers/smiley/red_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `red_man_speed.png` |
| `pieces/powers/smiley/red_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `red_man_speed.png` |
| `pieces/powers/smiley/white_king_bomb.png` | 56x56 | smiley theme power piece white_king_bomb |
| `pieces/powers/smiley/white_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_bomb.png` |
| `pieces/powers/smiley/white_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_bomb.png` |
| `pieces/powers/smiley/white_king_freeze.png` | 56x56 | smiley theme power piece white_king_freeze |
| `pieces/powers/smiley/white_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_freeze.png` |
| `pieces/powers/smiley/white_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_freeze.png` |
| `pieces/powers/smiley/white_king_ghost.png` | 56x56 | smiley theme power piece white_king_ghost |
| `pieces/powers/smiley/white_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_ghost.png` |
| `pieces/powers/smiley/white_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_ghost.png` |
| `pieces/powers/smiley/white_king_shield.png` | 56x56 | smiley theme power piece white_king_shield |
| `pieces/powers/smiley/white_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_shield.png` |
| `pieces/powers/smiley/white_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_shield.png` |
| `pieces/powers/smiley/white_king_speed.png` | 56x56 | smiley theme power piece white_king_speed |
| `pieces/powers/smiley/white_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_speed.png` |
| `pieces/powers/smiley/white_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_speed.png` |
| `pieces/powers/smiley/white_man_bomb.png` | 56x56 | smiley theme power piece white_man_bomb |
| `pieces/powers/smiley/white_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_bomb.png` |
| `pieces/powers/smiley/white_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_bomb.png` |
| `pieces/powers/smiley/white_man_freeze.png` | 56x56 | smiley theme power piece white_man_freeze |
| `pieces/powers/smiley/white_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_freeze.png` |
| `pieces/powers/smiley/white_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_freeze.png` |
| `pieces/powers/smiley/white_man_ghost.png` | 56x56 | smiley theme power piece white_man_ghost |
| `pieces/powers/smiley/white_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_ghost.png` |
| `pieces/powers/smiley/white_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_ghost.png` |
| `pieces/powers/smiley/white_man_shield.png` | 56x56 | smiley theme power piece white_man_shield |
| `pieces/powers/smiley/white_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_shield.png` |
| `pieces/powers/smiley/white_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_shield.png` |
| `pieces/powers/smiley/white_man_speed.png` | 56x56 | smiley theme power piece white_man_speed |
| `pieces/powers/smiley/white_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_speed.png` |
| `pieces/powers/smiley/white_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_speed.png` |
| `pieces/powers/white_king_bomb.png` | 56x56 | Power piece white_king_bomb |
| `pieces/powers/white_king_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_bomb.png` |
| `pieces/powers/white_king_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_bomb.png` |
| `pieces/powers/white_king_freeze.png` | 56x56 | Power piece white_king_freeze |
| `pieces/powers/white_king_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_freeze.png` |
| `pieces/powers/white_king_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_freeze.png` |
| `pieces/powers/white_king_ghost.png` | 56x56 | Power piece white_king_ghost |
| `pieces/powers/white_king_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_ghost.png` |
| `pieces/powers/white_king_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_ghost.png` |
| `pieces/powers/white_king_shield.png` | 56x56 | Power piece white_king_shield |
| `pieces/powers/white_king_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_shield.png` |
| `pieces/powers/white_king_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_shield.png` |
| `pieces/powers/white_king_speed.png` | 56x56 | Power piece white_king_speed |
| `pieces/powers/white_king_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_king_speed.png` |
| `pieces/powers/white_king_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_king_speed.png` |
| `pieces/powers/white_man_bomb.png` | 56x56 | Power piece white_man_bomb |
| `pieces/powers/white_man_bomb.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_bomb.png` |
| `pieces/powers/white_man_bomb@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_bomb.png` |
| `pieces/powers/white_man_freeze.png` | 56x56 | Power piece white_man_freeze |
| `pieces/powers/white_man_freeze.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_freeze.png` |
| `pieces/powers/white_man_freeze@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_freeze.png` |
| `pieces/powers/white_man_ghost.png` | 56x56 | Power piece white_man_ghost |
| `pieces/powers/white_man_ghost.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_ghost.png` |
| `pieces/powers/white_man_ghost@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_ghost.png` |
| `pieces/powers/white_man_shield.png` | 56x56 | Power piece white_man_shield |
| `pieces/powers/white_man_shield.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_shield.png` |
| `pieces/powers/white_man_shield@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_shield.png` |
| `pieces/powers/white_man_speed.png` | 56x56 | Power piece white_man_speed |
| `pieces/powers/white_man_speed.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `white_man_speed.png` |
| `pieces/powers/white_man_speed@2x.png` | 112x112 | 2x (nearest-neighbour) of `white_man_speed.png` |
| `tiles/capture_target.png` | 56x56 | Overlay: capture landing square |
| `tiles/capture_target@2x.png` | 112x112 | 2x (nearest-neighbour) of `capture_target.png` |
| `tiles/dark.png` | 56x56 | Dark (playable) square |
| `tiles/dark@2x.png` | 112x112 | 2x (nearest-neighbour) of `dark.png` |
| `tiles/dark_dest.png` | 56x56 | Dark square highlighted as move destination |
| `tiles/dark_dest@2x.png` | 112x112 | 2x (nearest-neighbour) of `dark_dest.png` |
| `tiles/hover.png` | 56x56 | Overlay: hover outline |
| `tiles/hover@2x.png` | 112x112 | 2x (nearest-neighbour) of `hover.png` |
| `tiles/last_move_from.png` | 56x56 | Overlay: last move origin (corner brackets) |
| `tiles/last_move_from@2x.png` | 112x112 | 2x (nearest-neighbour) of `last_move_from.png` |
| `tiles/last_move_to.png` | 56x56 | Overlay: last move target (navy tint + brackets) |
| `tiles/last_move_to@2x.png` | 112x112 | 2x (nearest-neighbour) of `last_move_to.png` |
| `tiles/legal_move.png` | 56x56 | Overlay: legal-move dot ring |
| `tiles/legal_move@2x.png` | 112x112 | 2x (nearest-neighbour) of `legal_move.png` |
| `tiles/light.png` | 56x56 | Light square (subtle dither) |
| `tiles/light@2x.png` | 112x112 | 2x (nearest-neighbour) of `light.png` |
| `tiles/select.png` | 56x56 | Overlay: selected piece (Win95 focus-style dashed frame) |
| `tiles/select@2x.png` | 112x112 | 2x (nearest-neighbour) of `select.png` |
| `board/board.png` | 448x448 | 8x8 board from the tiles |
| `board/board_452_sunken.png` | 452x452 | Board + 2px sunken bevel (same as the game's .in wrapper) |
| `board/board_framed_480.png` | 480x480 | Deluxe raised grey frame with a-h / 1-8 coordinates |
| `overlays/c64/frozen.png` | 56x56 | C64 frozen overlay (dithered ice frame, no alpha) |
| `overlays/c64/frozen.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `frozen.png` |
| `overlays/c64/frozen@2x.png` | 112x112 | 2x (nearest-neighbour) of `frozen.png` |
| `overlays/c64/shield_broken.png` | 56x56 | C64 broken-shield crack overlay |
| `overlays/c64/shield_broken.svg` | SVG 56x56 (pixel-exact, crispEdges) | Vector version of `shield_broken.png` |
| `overlays/c64/shield_broken@2x.png` | 112x112 | 2x (nearest-neighbour) of `shield_broken.png` |
| `overlays/frozen.png` | 56x56 | Ice tint over a frozen piece |
| `overlays/frozen@2x.png` | 112x112 | 2x (nearest-neighbour) of `frozen.png` |
| `overlays/shield_broken.png` | 56x56 | Broken shield shards over a piece |
| `overlays/shield_broken@2x.png` | 112x112 | 2x (nearest-neighbour) of `shield_broken.png` |
| `icons/app.png` | 32x32 | App icon (checkers piece in a little window) |
| `icons/app@2x.png` | 64x64 | 2x (nearest-neighbour) of `app.png` |
| `icons/app_16.png` | 16x16 | 16px app icon for title bar / taskbar |
| `icons/bomb.png` | 32x32 | Bomb power-up |
| `icons/bomb@2x.png` | 64x64 | 2x (nearest-neighbour) of `bomb.png` |
| `icons/bsod_hole.png` | 56x56 | BSOD hole square (56px tile) |
| `icons/bsod_hole@2x.png` | 112x112 | 2x (nearest-neighbour) of `bsod_hole.png` |
| `icons/crown.png` | 32x32 | Crown |
| `icons/crown@2x.png` | 64x64 | 2x (nearest-neighbour) of `crown.png` |
| `icons/desktop_my_checkers.png` | 32x32 | Desktop icon "My Checkers" |
| `icons/desktop_my_checkers@2x.png` | 64x64 | 2x (nearest-neighbour) of `desktop_my_checkers.png` |
| `icons/error_x.png` | 32x32 | Red error X (dialogs) |
| `icons/error_x@2x.png` | 64x64 | 2x (nearest-neighbour) of `error_x.png` |
| `icons/favicon.ico` | 1 KB | Favicon (16+32) |
| `icons/favicon16.ico` | 1 KB | Favicon 16 only |
| `icons/hourglass.png` | 32x32 | Thinking / AI busy |
| `icons/hourglass@2x.png` | 64x64 | 2x (nearest-neighbour) of `hourglass.png` |
| `icons/mine.png` | 32x32 | Mine twist |
| `icons/mine@2x.png` | 64x64 | 2x (nearest-neighbour) of `mine.png` |
| `icons/powerup_freeze.png` | 32x32 | Freeze power-up |
| `icons/powerup_freeze@2x.png` | 64x64 | 2x (nearest-neighbour) of `powerup_freeze.png` |
| `icons/powerup_lightning.png` | 32x32 | Speed power-up |
| `icons/powerup_lightning@2x.png` | 64x64 | 2x (nearest-neighbour) of `powerup_lightning.png` |
| `icons/powerup_mystery.png` | 32x32 | Mystery box |
| `icons/powerup_mystery@2x.png` | 64x64 | 2x (nearest-neighbour) of `powerup_mystery.png` |
| `icons/powerup_shield.png` | 32x32 | Shield power-up |
| `icons/powerup_shield@2x.png` | 64x64 | 2x (nearest-neighbour) of `powerup_shield.png` |
| `icons/powerup_star.png` | 32x32 | Generic power-up |
| `icons/powerup_star@2x.png` | 64x64 | 2x (nearest-neighbour) of `powerup_star.png` |
| `icons/recycle_bin.png` | 32x32 | Recycle Bin (empty) / captured pieces |
| `icons/recycle_bin@2x.png` | 64x64 | 2x (nearest-neighbour) of `recycle_bin.png` |
| `icons/recycle_bin_full.png` | 32x32 | Recycle Bin (full of captured pieces) |
| `icons/recycle_bin_full@2x.png` | 64x64 | 2x (nearest-neighbour) of `recycle_bin_full.png` |
| `icons/trophy.png` | 32x32 | Win |
| `icons/trophy@2x.png` | 64x64 | 2x (nearest-neighbour) of `trophy.png` |
| `popup_ad.png` | 112x112 | Pop-up ad content 2x2 squares (= variant 1, no frame) |
| `popup_ad@2x.png` | 224x224 | 2x (nearest-neighbour) of `popup_ad.png` |
| `popup_ad_1.png` | 112x112 | Ad: You are visitor #1,000,000! |
| `popup_ad_1@2x.png` | 224x224 | 2x (nearest-neighbour) of `popup_ad_1.png` |
| `popup_ad_1_3x2.png` | 168x112 | Ad: You are visitor #1,000,000! (wide) |
| `popup_ad_1_3x2@2x.png` | 336x224 | 2x (nearest-neighbour) of `popup_ad_1_3x2.png` |
| `popup_ad_2.png` | 112x112 | Ad: FREE RAM download |
| `popup_ad_2@2x.png` | 224x224 | 2x (nearest-neighbour) of `popup_ad_2.png` |
| `popup_ad_2_3x2.png` | 168x112 | Ad: FREE RAM download (wide) |
| `popup_ad_2_3x2@2x.png` | 336x224 | 2x (nearest-neighbour) of `popup_ad_2_3x2.png` |
| `popup_ad_3.png` | 112x112 | Ad: Hot singles... checkers pieces in your area |
| `popup_ad_3@2x.png` | 224x224 | 2x (nearest-neighbour) of `popup_ad_3.png` |
| `popup_ad_3_3x2.png` | 168x112 | Ad: Hot singles (wide) |
| `popup_ad_3_3x2@2x.png` | 336x224 | 2x (nearest-neighbour) of `popup_ad_3_3x2.png` |
| `popup_ad_3x2.png` | 168x112 | Pop-up ad content 3x2 squares (= variant 1, no frame) |
| `popup_ad_3x2@2x.png` | 336x224 | 2x (nearest-neighbour) of `popup_ad_3x2.png` |
| `popup_ad_4.png` | 112x112 | Ad: Bonk the Bug! |
| `popup_ad_4@2x.png` | 224x224 | 2x (nearest-neighbour) of `popup_ad_4.png` |
| `popup_ad_4_3x2.png` | 168x112 | Ad: Bonk the Bug! (wide) |
| `popup_ad_4_3x2@2x.png` | 336x224 | 2x (nearest-neighbour) of `popup_ad_4_3x2.png` |
| `screens/dialog_lose_320x180.png` | 320x180 | Lose dialog background |
| `screens/dialog_win_320x180.png` | 320x180 | Win dialog background (trophy + confetti, OK button) |
| `screens/splash_640x480.png` | 640x480 | Boot/splash screen |
| `screens/splash_bar_640x10.png` | 640x10 | Loopable boot bar strip (animate background-position-x) |
| `screens/wallpaper_teal_1280x800.png` | 1280x800 | Teal desktop wallpaper with subtle checker pattern |
| `screens/wallpaper_tile_64.png` | 64x64 | Same pattern as a repeatable tile (lighter) |
| `audio/bg_loop.ogg` | 80.00 s, 2ch, 778 KB | Background music, seamless 80 s loop (main and only music file) |
| `audio/bsod.ogg` | 1.47 s, 1ch, 21 KB | Glitchy crash (BSOD) |
| `audio/capture.ogg` | 0.40 s, 1ch, 6 KB | Capture |
| `audio/invalid.ogg` | 1.00 s, 1ch, 9 KB | Invalid move "ding" |
| `audio/king.ogg` | 1.25 s, 1ch, 13 KB | King promotion jingle |
| `audio/lose.ogg` | 2.20 s, 1ch, 16 KB | Lose |
| `audio/mine.ogg` | 1.60 s, 1ch, 18 KB | Mine explosion |
| `audio/move.ogg` | 0.09 s, 1ch, 4 KB | Piece move click |
| `audio/popup.ogg` | 0.35 s, 1ch, 6 KB | Pop-up appears |
| `audio/popup_close.ogg` | 0.25 s, 1ch, 5 KB | Pop-up closed |
| `audio/power_bomb.ogg` | 1.50 s, 1ch, 18 KB | Bomb power |
| `audio/power_freeze.ogg` | 1.20 s, 1ch, 14 KB | Freeze power |
| `audio/power_ghost.ogg` | 1.30 s, 1ch, 16 KB | Ghost power |
| `audio/power_shield.ogg` | 1.30 s, 1ch, 11 KB | Shield power |
| `audio/power_speed.ogg` | 0.50 s, 1ch, 6 KB | Speed power |
| `audio/restore.ogg` | 1.00 s, 1ch, 13 KB | Recycle Bin restore |
| `audio/select.ogg` | 0.06 s, 1ch, 4 KB | Select / menu blip |
| `audio/startup.ogg` | 3.60 s, 1ch, 28 KB | Startup chime |
| `audio/teleport.ogg` | 1.20 s, 1ch, 11 KB | Drag & Drop king teleport (also used by Inspect flourish) |
| `audio/win.ogg` | 2.60 s, 1ch, 24 KB | Win fanfare |
| `ui/balloon_computer_turn.png` | 196x72 | Static balloon tooltip "Computer's turn..." with hourglass |
| `ui/balloon_computer_turn@2x.png` | 392x144 | 2x (nearest-neighbour) of `balloon_computer_turn.png` |
| `ui/balloon_your_turn.png` | 196x72 | Static balloon tooltip "Your turn!" |
| `ui/balloon_your_turn@2x.png` | 392x144 | 2x (nearest-neighbour) of `balloon_your_turn.png` |
| `ui/choose_side_dialog.png` | 380x332 | Crop of the Choose-your-side dialog |
| `ui/mini_black_16.png` | 16x16 | Captured-row mini piece black 16px |
| `ui/mini_black_16@2x.png` | 32x32 | 2x (nearest-neighbour) of `mini_black_16.png` |
| `ui/mini_red_16.png` | 16x16 | Captured-row mini piece red 16px |
| `ui/mini_red_16@2x.png` | 32x32 | 2x (nearest-neighbour) of `mini_red_16.png` |
| `ui/mini_white_16.png` | 16x16 | Captured-row mini piece white 16px |
| `ui/mini_white_16@2x.png` | 32x32 | 2x (nearest-neighbour) of `mini_white_16.png` |
| `ui/mockup_black_computer_turn.png` | 1280x800 | Mockup: vs Computer, you are Black (board flipped), computer thinking |
| `ui/mockup_choose_side.png` | 1280x800 | Mockup: Choose your side dialog |
| `ui/mockup_white_your_turn.png` | 1280x800 | Mockup: vs Computer, you are White, your turn |
| `ui/panel_active_you.png` | 207x134 | Crop: active player panel (navy caption, arrow, YOU badge) |
| `ui/panel_inactive_computer.png` | 192x134 | Crop: inactive (greyed) player panel |
| `ui/side_black_32.png` | 32x32 | Side icon black 32px |
| `ui/side_black_32@2x.png` | 64x64 | 2x (nearest-neighbour) of `side_black_32.png` |
| `ui/side_black_48.png` | 48x48 | Side icon black 48px |
| `ui/side_black_48@2x.png` | 96x96 | 2x (nearest-neighbour) of `side_black_48.png` |
| `ui/side_red_32.png` | 32x32 | Side icon red 32px |
| `ui/side_red_32@2x.png` | 64x64 | 2x (nearest-neighbour) of `side_red_32.png` |
| `ui/side_red_48.png` | 48x48 | Side icon red 48px |
| `ui/side_red_48@2x.png` | 96x96 | 2x (nearest-neighbour) of `side_red_48.png` |
| `ui/side_white_32.png` | 32x32 | Side icon white 32px |
| `ui/side_white_32@2x.png` | 64x64 | 2x (nearest-neighbour) of `side_white_32.png` |
| `ui/side_white_48.png` | 48x48 | Side icon white 48px |
| `ui/side_white_48@2x.png` | 96x96 | 2x (nearest-neighbour) of `side_white_48.png` |
| `ui/sides.css` | 6 KB | Styles for sides.js (all classes prefixed c95s-) |
| `ui/sides.js` | 10 KB | CheckersSides module: player panels, turn arrow, YOU badge, toast, Choose-side dialog, title text, board flip |
| `ui/turn_arrow_left_0.png` | 16x16 | Turn arrow frame 0 |
| `ui/turn_arrow_left_1.png` | 16x16 | Turn arrow frame 1 |
| `ui/turn_arrow_left_2.png` | 16x16 | Turn arrow frame 2 |
| `ui/turn_arrow_left_3.png` | 16x16 | Turn arrow frame 3 |
| `ui/turn_arrow_left_sheet.png` | 64x16 | Same arrow pointing left |
| `ui/turn_arrow_left_sheet@2x.png` | 128x32 | 2x (nearest-neighbour) of `turn_arrow_left_sheet.png` |
| `ui/turn_arrow_right_0.png` | 16x16 | Turn arrow frame 0 |
| `ui/turn_arrow_right_1.png` | 16x16 | Turn arrow frame 1 |
| `ui/turn_arrow_right_2.png` | 16x16 | Turn arrow frame 2 |
| `ui/turn_arrow_right_3.png` | 16x16 | Turn arrow frame 3 |
| `ui/turn_arrow_right_sheet.png` | 64x16 | Bouncing turn arrow, 4 frames x 16px (CSS steps(4)) |
| `ui/turn_arrow_right_sheet@2x.png` | 128x32 | 2x (nearest-neighbour) of `turn_arrow_right_sheet.png` |
| `ui/you_badge.png` | 64x32 | YOU sticker |
| `ui/you_badge@2x.png` | 128x64 | 2x (nearest-neighbour) of `you_badge.png` |
| `ui/you_play_black.png` | 150x24 | Label "You play: BLACK" |
| `ui/you_play_black@2x.png` | 300x48 | 2x (nearest-neighbour) of `you_play_black.png` |
| `ui/you_play_red.png` | 150x24 | Label "You play: RED" |
| `ui/you_play_red@2x.png` | 300x48 | 2x (nearest-neighbour) of `you_play_red.png` |
| `ui/you_play_white.png` | 150x24 | Label "You play: WHITE" |
| `ui/you_play_white@2x.png` | 300x48 | 2x (nearest-neighbour) of `you_play_white.png` |
| `inspect.css` | 3 KB | Inspect styles (all scoped under .c95i-root) |
| `inspect.html` | 1 KB | Standalone Inspect demo page |
| `inspect.js` | 444 KB | 3D Inspect viewer module (piece art embedded) |
| `inspect_angles.png` | 1178x290 | 3 inspect angles |
| `inspect_flourish.gif` | 312x232, 24 frames | Inspect flourish animation |
| `inspect_flourish.mp4` | 2.40 s | Same as MP4 |
| `inspect_screenshot.png` | 680x560 | Inspect window screenshot |
| `manifest.js` | 28 KB | window.CHECKERS95_MANIFEST list of every file (same format as make-manifest.cjs) |
| `preview.png` | 1600x1640 | Contact sheet of the whole pack |
| `pieces_preview.png` | 1090x638 | All 4 themes on light & dark squares |
| `powers_preview.png` | 1136x950 | All power pieces + overlays |
| `c64_powers_preview.png` | 1536x1088 | C64-screen style preview of the c64 power set |
| `powers_themes_preview.png` | 2424x1064 | Power pieces for all 4 themes (@2x) |
