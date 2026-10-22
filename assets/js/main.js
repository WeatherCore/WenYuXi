/* main.js · 渲染配置内容（相册/时间轴/卡片墙/天数/结尾）并启动全站 */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  document.body.classList.add('locked');

  var cfg = window.LOVE || {};
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function placeholder(i){ return 'assets/img/photos/p' + ((i % 6) + 1) + '.svg'; }

  /* ---------- 时光相册 ---------- */
  (function renderGallery(){
    var wrap = document.getElementById('galleryGrid');
    if(!wrap) return;
    (cfg.gallery || []).forEach(function(item, i){
      var fig = document.createElement('figure');
      fig.className = 'photo fade' + (item.wide ? ' wide' : '') + (i % 2 ? ' tilt-r' : ' tilt-l');
      var caption = item.caption || '我们的回忆';
      fig.innerHTML =
        '<div class="ph-wrap"><img alt="' + esc(caption) + '"></div>' +
        '<figcaption>' + esc(caption) + '</figcaption>';
      var img = fig.querySelector('img');
      img.src = item.src || placeholder(i);
      img.addEventListener('error', function(){ img.src = placeholder(i); });
      wrap.appendChild(fig);
    });
  })();

  /* ---------- 我们的故事（时间轴） ---------- */
  (function renderTimeline(){
    var list = document.getElementById('tlList');
    if(!list) return;
    (cfg.timeline || []).forEach(function(t, i){
      var li = document.createElement('li');
      li.className = 'tl-item fade ' + (i % 2 ? 'from-right' : 'from-left');
      li.innerHTML =
        '<div class="tl-card">' +
          '<span class="tl-date">' + esc(t.date) + '</span>' +
          '<h3>' + esc(t.title) + '</h3>' +
          '<p>' + esc(t.text) + '</p>' +
        '</div>';
      list.appendChild(li);
    });
  })();

  /* ---------- 想对你说（翻卡墙） ---------- */
  var HEART = '<svg class="w-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20C12 20 4 15 4 9.5 4 6 6.5 4 9 4c1.8 0 2.8 1 3 2 .2-1 1.2-2 3-2 2.5 0 5 2 5 5.5C20 15 12 20 12 20Z"/></svg>';
  (function renderWishes(){
    var grid = document.getElementById('wishGrid');
    if(!grid) return;
    (cfg.wishes || []).forEach(function(t, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'wish fade';
      b.setAttribute('aria-label', '翻看第' + (i + 1) + '句话');
      b.innerHTML =
        '<span class="wish-inner">' +
          '<span class="w-face w-front">' +
            '<span class="w-num">' + pad(i + 1) + '</span>' + HEART +
            '<span class="w-hint">轻触翻开</span>' +
          '</span>' +
          '<span class="w-face w-back">' +
            '<span class="w-text">' + esc(t) + '</span>' + HEART +
          '</span>' +
        '</span>';
      b.addEventListener('click', function(){ b.classList.toggle('flip'); });
      grid.appendChild(b);
    });
  })();

  /* ---------- 在一起第 N 天 ---------- */
  (function renderDays(){
    var box = document.getElementById('heroDays');
    var num = document.getElementById('daysNum');
    if(!box || !num) return;
    if(!cfg.startDate){ box.style.display = 'none'; return; }
    var start = new Date(cfg.startDate + 'T00:00:00');
    if(isNaN(start.getTime())){ box.style.display = 'none'; return; }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = Math.floor((today - start) / 86400000);
    if(days < 0){ box.style.display = 'none'; return; }
    if(reduced){ num.textContent = days; return; }
    var t0 = null, dur = 1500;
    (function tick(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      p = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(days * p);
      if(p < 1) requestAnimationFrame(tick);
    })(performance.now());
  })();

  /* ---------- 结尾区与页脚文案 ---------- */
  (function renderEnding(){
    if(cfg.ending){
      var t = document.getElementById('endTitle');
      if(t && cfg.ending.title) t.textContent = cfg.ending.title;
      var s = document.getElementById('endSub');
      if(s && cfg.ending.sub) s.textContent = cfg.ending.sub;
    }
    var f = document.getElementById('footText');
    if(f && cfg.footer) f.textContent = cfg.footer;
  })();

  /* ---------- 心动按钮：绽放柔光 + 跳动计数 ---------- */
  (function renderHeart(){
    var btn = document.getElementById('heartBtn');
    var cnt = document.getElementById('beatCount');
    if(!btn || !cnt) return;
    var n = 0;
    try{ n = parseInt(localStorage.getItem('lb_beats') || '0', 10) || 0; }catch(e){}
    function show(){
      cnt.textContent = n > 0 ? ('这颗心已经为你跳动了 ' + n + ' 次') : '点一下，让它为你跳动';
    }
    show();
    btn.addEventListener('click', function(){
      n++;
      try{ localStorage.setItem('lb_beats', String(n)); }catch(err){}
      show();
      btn.classList.remove('beat');
      void btn.offsetWidth;
      btn.classList.add('beat');
      if(!reduced) burst(btn);
    });
    function burst(host){
      var r = host.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var cols = ['226,170,178','230,198,152','205,186,222','238,182,192'];
      for(var i = 0; i < 12; i++){
        var s = document.createElement('span');
        s.className = 'burst-p';
        var ang = Math.random() * Math.PI * 2;
        var dist = 46 + Math.random() * 80;
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist - 40;
        var sz = 4 + Math.random() * 6;
        s.style.cssText =
          'left:' + cx + 'px;top:' + cy + 'px;' +
          'width:' + sz + 'px;height:' + sz + 'px;' +
          '--dx:' + dx.toFixed(0) + 'px;--dy:' + dy.toFixed(0) + 'px;' +
          '--s:' + (0.4 + Math.random()).toFixed(2) + ';' +
          'background:rgba(' + cols[i % cols.length] + ',.85);';
        document.body.appendChild(s);
        s.addEventListener('animationend', function(){ this.remove(); });
      }
    }
  })();

  /* ---------- 启动 ---------- */
  LB.particles.init();
  LB.envelope.init();
  LB.music.init();
})();
