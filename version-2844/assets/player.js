(function () {
  const video = document.querySelector("[data-player-video]");
  const overlay = document.querySelector("[data-player-overlay]");
  const button = document.querySelector("[data-play-button]");
  const sourceNode = document.getElementById("player-source");

  if (!video || !sourceNode) {
    return;
  }

  let source = "";
  let loaded = false;
  let hls = null;

  try {
    const data = JSON.parse(sourceNode.textContent || "{}");
    source = data.src || "";
  } catch (error) {
    source = "";
  }

  function bindSource() {
    if (loaded || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function beginPlay() {
    bindSource();
    video.setAttribute("controls", "controls");
    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", beginPlay);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      beginPlay();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlay();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
