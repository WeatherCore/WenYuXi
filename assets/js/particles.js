/* particles.js · 星光与花瓣粒子 + 鼠标柔光 */
window.LB = window.LB || {};
LB.particles = (function(){
  'use strict';
  var cv, ctx, W, H, DPR;
  var petals = [], stars = [];
  var running = true, reduced = false;
  var mouse = { x:-9999, y:-9999, gx:-9999, gy:-9999, on:false }, glow;
  var PCOLORS = ['226,170,178','230,198,152','205,186,222','238,182,192','222,196,170'];

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function initParticles(){
    petals.length = 0; stars.length = 0;
    var c = W < 640 ? { p:9, s:30 } : { p:16, s:60 }, i;
    for(i = 0; i < c.p; i++) petals.push({
      x: Math.random() * W, y: Math.random() * H,
      s: 5 + Math.random() * 8,
      vy: .18 + Math.random() * .3, vx: 0,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - .5) * .012,
      ph: Math.random() * Math.PI * 2, sway: .5 + Math.random(),
      col: PCOLORS[i % PCOLORS.length], a: .25 + Math.random() * .22
    });
    for(i = 0; i < c.s; i++) stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: .5 + Math.random() * 1.1, tw: .6 + Math.random() * 1.6,
      ph: Math.random() * Math.PI * 2,
      col: Math.random() < .5 ? '232,197,132' : (Math.random() < .5 ? '255,251,240' : '216,180,205'),
      a: .35 + Math.random() * .4
    });
  }

  function drawPetal(p){
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.beginPath(); ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * .85, -p.s * .5, p.s * .65, p.s * .55, 0, p.s);
    ctx.bezierCurveTo(-p.s * .65, p.s * .55, -p.s * .85, -p.s * .5, 0, -p.s);
    ctx.fillStyle = 'rgba(' + p.col + ',' + p.a.toFixed(2) + ')';
    ctx.fill(); ctx.restore();
  }

  function drawStar(s, t){
    var a = s.a * (.45 + .55 * Math.abs(Math.sin(t * .001 * s.tw + s.ph)));
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283);
    ctx.fillStyle = 'rgba(' + s.col + ',' + a.toFixed(3) + ')';
    ctx.fill();
  }

  function step(t){
    var i, p, s;
    ctx.clearRect(0, 0, W, H);
    for(i = 0; i < stars.length; i++) drawStar(stars[i], t);
    if(mouse.on){
      mouse.gx += (mouse.x - mouse.gx) * .08;
      mouse.gy += (mouse.y - mouse.gy) * .08;
      glow.style.left = mouse.gx + 'px';
      glow.style.top = mouse.gy + 'px';
    }
    for(i = 0; i < petals.length; i++){
      p = petals[i];
      p.y += p.vy; p.rot += p.vr;
      p.x += Math.sin(t * .0007 * p.sway + p.ph) * .35;
      if(mouse.on){
        var dx = p.x - mouse.gx, dy = p.y - mouse.gy, d2 = dx * dx + dy * dy;
        if(d2 < 19600 && d2 > 1){ var dd = Math.sqrt(d2); p.vx += (dx / dd) * .06; }
      }
      p.vx *= .93; p.x += p.vx;
      if(p.y > H + 30){ p.y = -30; p.x = Math.random() * W; p.vx = 0; }
      if(p.x < -40) p.x = W + 30;
      if(p.x > W + 40) p.x = -30;
      drawPetal(p);
    }
  }

  function loop(t){
    if(!running) return;
    step(t);
    requestAnimationFrame(loop);
  }

  function drawStatic(){
    ctx.clearRect(0, 0, W, H);
    var t = 2000, i;
    for(i = 0; i < stars.length; i++) drawStar(stars[i], t);
    for(i = 0; i < petals.length; i++) drawPetal(petals[i]);
  }

  function init(){
    cv = document.getElementById('sky');
    glow = document.getElementById('glow');
    if(!cv) return;
    ctx = cv.getContext('2d');
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    resize(); initParticles();
    addEventListener('resize', function(){ resize(); initParticles(); });

    if(matchMedia('(pointer: fine)').matches && !reduced){
      addEventListener('mousemove', function(e){
        mouse.x = e.clientX; mouse.y = e.clientY;
        if(!mouse.on){
          mouse.on = true; mouse.gx = e.clientX; mouse.gy = e.clientY;
          glow.style.opacity = '1';
        }
      });
      document.addEventListener('mouseleave', function(){
        mouse.x = -9999; mouse.y = -9999; mouse.on = false;
        glow.style.opacity = '0';
      });
    }

    document.addEventListener('visibilitychange', function(){
      running = !document.hidden;
      if(running && !reduced) requestAnimationFrame(loop);
    });

    if(reduced) drawStatic();
    else requestAnimationFrame(loop);
  }

  return { init: init };
})();
