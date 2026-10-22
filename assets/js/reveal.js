/* reveal.js · 逐段渐显 / 侧边导航点 / 回到顶部 */
window.LB = window.LB || {};
LB.reveal = (function(){
  'use strict';
  var started = false;

  function start(){
    if(started) return;
    started = true;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fades = [].slice.call(document.querySelectorAll('.fade'));
    var vh = innerHeight, delay = 320;

    /* 首屏元素按序温柔浮现 */
    fades.forEach(function(el){
      if(el.dataset.seen) return;
      if(el.getBoundingClientRect().top < vh * .94){
        el.dataset.seen = '1';
        if(reduced){ el.classList.add('in'); }
        else{
          setTimeout(function(){ el.classList.add('in'); }, delay);
          delay += 170;
        }
      }
    });

    /* 其余元素滚动渐显 */
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting && !e.target.dataset.seen){
          e.target.dataset.seen = '1';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
    fades.forEach(function(el){ if(!el.dataset.seen) io.observe(el); });

    initDotNav();
    initBackTop();
  }

  function initDotNav(){
    var nav = document.getElementById('dotnav');
    if(!nav || innerWidth < 1024) return;
    var dots = [].slice.call(nav.querySelectorAll('.dot'));
    var secs = ['hero','letter','gallery','timeline','wishes','ending']
      .map(function(id){ return document.getElementById(id); })
      .filter(Boolean);
    if(!secs.length) return;
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          var id = e.target.id;
          dots.forEach(function(dt){
            dt.classList.toggle('active', dt.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: .4 });
    secs.forEach(function(s){ io.observe(s); });
  }

  function initBackTop(){
    var bt = document.getElementById('backTop');
    if(!bt) return;
    addEventListener('scroll', function(){
      bt.classList.toggle('show', scrollY > 700);
    }, { passive: true });
    bt.addEventListener('click', function(){
      scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { start: start };
})();
