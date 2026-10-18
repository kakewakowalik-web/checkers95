/* Checkers95 side / turn indicator  -  window.CheckersSides
 * Drop-in, no dependencies. Images resolve relative to this script (assets/ui/).
 *   CheckersSides.mount(containerEl[, cfg])  builds the two player panels (top = opponent, bottom = you)
 *   CheckersSides.config({toasts:'auto'|'always'|'off', hideNote:true})   -> current config
 *        toasts 'auto' (default): vs Computer on every turn change; two players: only on the first turn of a game
 *   CheckersSides.setToasts(v)              v = true|'always' | false|'off' | 'auto'  -> mode
 *   CheckersSides.update(info)              refresh; returns the window-title string
 *        info = { turn:'r'|'b', human:'r'|'b'|null (null = two players), scheme:'red'|'white',
 *                 count:{r,b}, kings:{r,b}, captured:{r,b} (pieces taken BY that side),
 *                 thinking:bool, winner:'r'|'b'|null, names:{r,b} (optional), toast:true,
 *                 turnNo:0.. (optional; 0 = game just started; hides the "Black moves first" note once > 0) }
 *   CheckersSides.toast(title, text, {icon:'r'|'w'|'b'|'hourglass', anchor:el, below:false, ms:2200 (0 = sticky)})
 *   CheckersSides.chooseSide({side:'r'|'b', scheme:'red'|'white', onOK(side, scheme), onCancel()})
 *   CheckersSides.titleText(info)           'Checkers - You are White - Your turn'
 *   CheckersSides.flip(el, on)              toggles the 180deg board-flip class on el (#wrap)
 *   CheckersSides.colorName(side, scheme)   'Red' | 'White' | 'Black'
 */
(function () {
  'use strict';
  var cs = document.currentScript, BASE = '';
  if (cs && cs.src) BASE = cs.src.replace(/[^\/]*$/, '');
  function url(f) { return 'url("' + BASE + f + '")'; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function file(side, scheme) { return side === 'b' ? 'black' : (scheme === 'white' ? 'white' : 'red'); }
  function colorName(side, scheme) { var f = file(side, scheme); return f.charAt(0).toUpperCase() + f.slice(1); }
  function names(info) {
    if (info.names) return info.names;
    if (info.human) { var n = {}; n[info.human] = 'You'; n[info.human === 'r' ? 'b' : 'r'] = 'Computer'; return n; }
    return { b: 'Player 1', r: 'Player 2' };            // Black moves first, so Black is Player 1
  }
  var root = null, P = {}, last = {};
  var CFG = { toasts: 'auto', hideNote: true };
  function normToasts(v) { return v === false || v === 'off' ? 'off' : (v === true || v === 'always') ? 'always' : 'auto'; }
  function config(o) { o = o || {}; if ('toasts' in o) CFG.toasts = normToasts(o.toasts); if ('hideNote' in o) CFG.hideNote = !!o.hideNote; return { toasts: CFG.toasts, hideNote: CFG.hideNote }; }
  function setToasts(v) { CFG.toasts = normToasts(v); if (CFG.toasts === 'off' && tst) { tst.remove(); tst = null; } return CFG.toasts; }
  function panel() {
    return el('div', 'c95s-panel',
      '<div class="c95s-tb"><i class="c95s-arrow"></i><i class="c95s-glass"></i><span class="c95s-tn"></span><span class="c95s-st"></span></div>' +
      '<div class="c95s-body"><i class="c95s-icon"></i><div><div class="c95s-name"></div><div class="c95s-sub"></div></div></div>' +
      '<div class="c95s-capl">Captured:</div><div class="c95s-caps"></div>');
  }
  function mount(container, opts) {
    if (opts) config(opts);
    root = el('div', 'c95s-side');
    P.top = panel(); P.bot = panel();
    P.mid = el('div', 'c95s-mid', '<div class="c95s-play">You play: <i></i><b></b></div><div class="c95s-note"><i class="c95s-ii">i</i><span>Black moves first.</span></div>');
    root.appendChild(P.top); root.appendChild(P.mid); root.appendChild(P.bot);
    (container || document.body).appendChild(root);
    return root;
  }
  function fill(p, side, info, nm) {
    var q = function (s) { return p.querySelector(s); }, on = !info.winner && info.turn === side;
    var opp = side === 'r' ? 'b' : 'r', you = info.human === side, comp = !!info.human && !you;
    p.classList.toggle('c95s-on', on);
    p.classList.toggle('c95s-wait', on && (comp || !!info.thinking));
    q('.c95s-icon').style.backgroundImage = url('side_' + file(side, info.scheme) + '_48.png');
    q('.c95s-tn').textContent = colorName(side, info.scheme);
    q('.c95s-st').textContent = info.winner ? (info.winner === side ? 'Winner!' : '') : on ? (comp ? 'Thinking...' : you ? 'Your turn' : 'To move') : 'Waiting';
    q('.c95s-name').textContent = nm[side];
    var c = (info.count || {})[side], k = (info.kings || {})[side];
    q('.c95s-sub').innerHTML = (c == null ? '' : c + (c === 1 ? ' piece' : ' pieces') + (k ? ' (' + k + (k === 1 ? ' king' : ' kings') + ')' : ''));
    var n = (info.captured || {})[side] || 0, h = '';
    for (var i = 0; i < Math.min(n, 12); i++) h += '<i style="background-image:' + url('mini_' + file(opp, info.scheme) + '_16.png').replace(/"/g, "'") + '"></i>';
    q('.c95s-caps').innerHTML = h || '<em>none yet</em>';
    var b = q('.c95s-you');
    if (you && !b) p.appendChild(el('i', 'c95s-you')); else if (!you && b) b.remove();
  }
  function titleText(info) {
    var nm = names(info), t = 'Checkers';
    if (info.human) {
      t += ' - You are ' + colorName(info.human, info.scheme);
      if (info.winner) t += info.winner === info.human ? ' - You win!' : ' - Computer wins';
      else t += info.turn === info.human ? ' - Your turn' : ' - Computer\u2019s turn';
    } else if (info.winner) t += ' - ' + nm[info.winner] + ' (' + colorName(info.winner, info.scheme) + ') wins';
    else t += ' - ' + nm[info.turn] + ' (' + colorName(info.turn, info.scheme) + ') to move';
    return t;
  }
  function update(info) {
    if (!root) return titleText(info);
    var bottom = info.human || 'r', top = bottom === 'r' ? 'b' : 'r', nm = names(info);
    fill(P.top, top, info, nm); fill(P.bot, bottom, info, nm);
    P.top.dataset.side = top; P.bot.dataset.side = bottom;
    var pl = P.mid.querySelector('.c95s-play');
    pl.style.display = info.human ? '' : 'none';
    if (info.human) { pl.querySelector('i').style.backgroundImage = url('mini_' + file(info.human, info.scheme) + '_16.png'); pl.querySelector('b').textContent = colorName(info.human, info.scheme).toUpperCase(); }
    // "(i) Black moves first" only matters before the first move
    var started = info.turnNo != null ? info.turnNo > 0 : (last.key !== undefined && last.key !== info.turn + '|' + info.human + '|' + info.winner) || last.started;
    last.started = started;
    P.mid.querySelector('.c95s-note').style.display = CFG.hideNote && started ? 'none' : '';
    var key = info.turn + '|' + info.human + '|' + info.winner;
    var fresh = info.turnNo === 0 && last.turnNo !== 0;              // a new game just started
    var want = CFG.toasts === 'always' || (CFG.toasts === 'auto' && (info.human ? true : (info.turnNo != null ? info.turnNo === 0 : !last.hotShown)));
    last.turnNo = info.turnNo;
    if (CFG.toasts !== 'off' && want && info.toast !== false && !info.winner && (fresh || (last.key !== undefined && key !== last.key))) {
      if (!info.human) last.hotShown = true;
      var comp = info.human && info.turn !== info.human, anchor = info.turn === bottom ? P.bot : P.top, below = anchor === P.top;
      if (comp) toast('Computer\u2019s turn...', 'Thinking, please wait.', { icon: 'hourglass', anchor: anchor, below: below });
      else if (info.human) toast('Your turn!', 'You play ' + colorName(info.human, info.scheme).toUpperCase() + '. Make your move.', { icon: file(info.turn, info.scheme), anchor: anchor, below: below });
      else toast(nm[info.turn] + '\u2019s turn', colorName(info.turn, info.scheme) + ' to move.', { icon: file(info.turn, info.scheme), anchor: anchor, below: below });
    }
    last.key = key;
    return titleText(info);
  }
  var tst = null, tTimer = null;
  function toast(title, text, o) {
    o = o || {};
    if (tst) tst.remove(); clearTimeout(tTimer);
    tst = el('div', 'c95s-toast');
    var ic = el('i', o.icon === 'hourglass' ? 'c95s-hg' : '');
    if (o.icon && o.icon !== 'hourglass') ic.style.backgroundImage = url('side_' + ({ r: 'red', w: 'white', b: 'black' }[o.icon] || o.icon) + '_32.png');
    tst.appendChild(ic);
    var tx = el('div'); tx.appendChild(el('b')).textContent = title; tx.appendChild(document.createTextNode(text)); tst.appendChild(tx);
    var x = el('span', 'c95s-x', '\u00d7'); tst.appendChild(x);
    document.body.appendChild(tst);
    var a = o.anchor, r = a ? a.getBoundingClientRect() : { left: 20, top: 120, bottom: 120 };
    var sx = window.scrollX || 0, sy = window.scrollY || 0, h = tst.offsetHeight;
    // never cover the "You play / Black moves first" strip: slide past it if it is in the way
    var top = r.top - h - 14, below = r.bottom + 14, strip = [];
    if (a && P.mid) [].forEach.call(P.mid.children, function (c) { if (c.offsetParent) { var cr = c.getBoundingClientRect(); if (cr.height) strip.push(cr); } });
    var up = !!a && !!o.below;
    if (!up) { strip.forEach(function (cr) { if (cr.bottom > top && cr.top < r.top) top = Math.min(top, cr.top - h - 14); }); if (a && top < 0) up = true; }
    if (up) strip.forEach(function (cr) { if (cr.top < below + h && cr.bottom > r.bottom) below = Math.max(below, cr.bottom + 14); });
    tst.classList.toggle('c95s-up', up);
    tst.style.left = (r.left + sx + 8) + 'px';
    tst.style.top = ((up ? below : top) + sy) + 'px';
    var me = tst;
    function hide() { if (tst !== me) return; tst = null; me.classList.add('c95s-bye'); setTimeout(function () { me.remove(); }, 260); }
    x.onclick = hide;
    if (o.ms !== 0) tTimer = setTimeout(hide, o.ms || 2200);
    return me;
  }
  function chooseSide(o) {
    o = o || {}; var side = o.side || 'r', scheme = o.scheme || 'red';
    var veil = el('div', 'c95s-veil'), d = el('div', 'c95s-dlg',
      '<div class="c95s-dt"><span>Choose your side</span><button class="c95s-b c95s-tbtn">?</button><button class="c95s-b c95s-tbtn c95s-cx">\u00d7</button></div>' +
      '<div class="c95s-dbody"><div class="c95s-q"><i>?</i><div>Which pieces do you want to play?<br>Your pieces will be at the <b>bottom</b> of the board.</div></div>' +
      '<div class="c95s-picks"><button class="c95s-b c95s-pick" data-s="r"><i class="c95s-big"></i><b></b><small>moves second</small></button>' +
      '<button class="c95s-b c95s-pick" data-s="b"><i class="c95s-big"></i><b>Black</b><small>moves first</small></button></div>' +
      '<div class="c95s-grp"><span class="c95s-lg">Colour scheme</span><label><input type="radio" name="c95s-sch" value="red">Red vs Black</label><label><input type="radio" name="c95s-sch" value="white">White vs Black</label></div>' +
      '<div class="c95s-note"><i class="c95s-ii">i</i><span><b>Black moves first.</b> If you pick Black, you start.</span></div>' +
      '<div class="c95s-dbar"><button class="c95s-b c95s-def c95s-ok">OK</button><button class="c95s-b c95s-cn">Cancel</button></div></div>');
    function sync() {
      d.querySelectorAll('.c95s-pick').forEach(function (b) { b.classList.toggle('c95s-sel', b.dataset.s === side); });
      d.querySelector('[data-s=r] .c95s-big').style.backgroundImage = url('side_' + file('r', scheme) + '_48@2x.png');
      d.querySelector('[data-s=b] .c95s-big').style.backgroundImage = url('side_black_48@2x.png');
      d.querySelector('[data-s=r] b').textContent = colorName('r', scheme);
      d.querySelector('input[value=' + scheme + ']').checked = true;
    }
    d.querySelectorAll('.c95s-pick').forEach(function (b) { b.onclick = function () { side = b.dataset.s; sync(); }; b.ondblclick = function () { side = b.dataset.s; done(true); }; });
    d.querySelectorAll('input[name=c95s-sch]').forEach(function (r) { r.onchange = function () { scheme = r.value; sync(); }; });
    function key(e) { if (e.key === 'Escape') { e.preventDefault(); done(false); } else if (e.key === 'Enter') { e.preventDefault(); done(true); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { side = side === 'r' ? 'b' : 'r'; sync(); } }
    function done(ok) { veil.remove(); d.remove(); document.removeEventListener('keydown', key, true); if (ok) { if (o.onOK) o.onOK(side, scheme); } else if (o.onCancel) o.onCancel(); }
    d.querySelector('.c95s-ok').onclick = function () { done(true); };
    d.querySelector('.c95s-cn').onclick = d.querySelector('.c95s-cx').onclick = function () { done(false); };
    document.addEventListener('keydown', key, true);
    sync(); document.body.appendChild(veil); document.body.appendChild(d);
    return d;
  }
  function flip(e, on) { if (e) e.classList.toggle('c95s-flip', !!on); }
  window.CheckersSides = { config: config, setToasts: setToasts, mount: mount, update: update, toast: toast, chooseSide: chooseSide, titleText: titleText, flip: flip, colorName: colorName, base: BASE };
})();
