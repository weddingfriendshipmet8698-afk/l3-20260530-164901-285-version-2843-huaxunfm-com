import { H as Hls } from './hls.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (wrap) {
  var video = wrap.querySelector('video');
  var button = wrap.querySelector('[data-play-button]');
  var source = wrap.getAttribute('data-src');
  var ready = false;

  if (!video || !button || !source) {
    return;
  }

  wrap.setAttribute('data-hls-ready', 'true');

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (Hls && Hls.isSupported && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    prepare();
    button.classList.add('hidden');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
});
