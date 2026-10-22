/* music.js · 轻音乐：本地合成音乐盒（无外部音频资源，默认关闭） */
window.LB = window.LB || {};
LB.music = (function(){
  'use strict';

  function init(){
    var musicBtn = document.getElementById('musicBtn');
    if(!musicBtn) return;

    var ac = null, bus = null, dly = null, timer = null;
    var playing = false, nextT = 0, stepN = 0;

    /* C — G — Am7 — F，缓慢琶音，63 BPM */
    var CHORDS = [
      [261.63, 329.63, 392.00, 493.88],
      [392.00, 493.88, 587.33, 783.99],
      [220.00, 261.63, 329.63, 392.00],
      [174.61, 261.63, 349.23, 440.00]
    ];
    var PATTERN = [0, 1, 2, 3, 2, 1, 2, 3];
    var EIGHTH = 60 / 63 / 2;

    function note(t, f, vol, dur){
      var g = ac.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .015);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      var o = ac.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(bus); g.connect(dly);
      o.start(t); o.stop(t + dur + .1);

      /* 八度泛音，模拟音乐盒质感 */
      var o2 = ac.createOscillator();
      o2.type = 'sine'; o2.frequency.value = f * 2;
      var g2 = ac.createGain();
      g2.gain.setValueAtTime(.0001, t);
      g2.gain.exponentialRampToValueAtTime(vol * .28, t + .015);
      g2.gain.exponentialRampToValueAtTime(.0001, t + dur * .6);
      o2.connect(g2); g2.connect(bus);
      o2.start(t); o2.stop(t + dur);
    }

    function scheduler(){
      while(nextT < ac.currentTime + .3){
        var chord = CHORDS[Math.floor(stepN / 8) % 4];
        var f = chord[PATTERN[stepN % 8]] * (1 + (Math.random() - .5) * .002);
        note(nextT, f, .15, 1.7);
        if(stepN % 16 === 14) note(nextT, f * 2, .045, 1.2);
        nextT += EIGHTH; stepN++;
      }
    }

    function setupAudio(){
      var AC = window.AudioContext || window.webkitAudioContext;
      ac = new AC();
      var lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2400;
      var master = ac.createGain(); master.gain.value = .6;
      bus = ac.createGain();
      dly = ac.createDelay(); dly.delayTime.value = .36;
      var fb = ac.createGain(); fb.gain.value = .32;
      var wet = ac.createGain(); wet.gain.value = .22;
      bus.connect(lp);
      dly.connect(fb); fb.connect(dly);
      dly.connect(wet); wet.connect(lp);
      lp.connect(master); master.connect(ac.destination);
    }

    musicBtn.addEventListener('click', function(){
      try{
        if(!ac) setupAudio();
        if(!playing){
          ac.resume();
          nextT = ac.currentTime + .06;
          scheduler();
          timer = setInterval(scheduler, 100);
          playing = true;
        }else{
          clearInterval(timer);
          ac.suspend();
          playing = false;
        }
        musicBtn.classList.toggle('on', playing);
        musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      }catch(e){
        musicBtn.style.display = 'none';
      }
    });
  }

  return { init: init };
})();
