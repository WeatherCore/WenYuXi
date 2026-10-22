/* envelope.js · 开场信封交互 */
window.LB = window.LB || {};
LB.envelope = (function(){
  'use strict';

  function init(){
    var overlay = document.getElementById('overlay');
    var btn = document.getElementById('envelope');
    if(!overlay || !btn) return;
    var opened = false;

    btn.addEventListener('click', function(){
      if(opened) return;
      opened = true;
      overlay.classList.add('opening');

      /* 封口打开 → 信纸升起（CSS 过渡驱动） */
      setTimeout(function(){
        overlay.classList.add('gone');
        document.body.classList.remove('locked');
      }, 1900);

      setTimeout(function(){ LB.reveal.start(); }, 2050);

      setTimeout(function(){
        if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 3000);

      setTimeout(function(){
        var m = document.getElementById('musicBtn');
        if(m) m.classList.add('show');
      }, 2300);
    });
  }

  return { init: init };
})();
