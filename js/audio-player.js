/* Native audio stays available if enhancement cannot initialize. No autoplay. */
document.addEventListener('DOMContentLoaded', () => {
  const players = [...document.querySelectorAll('audio')];
  const formatTime = value => Number.isFinite(value) && value >= 0
    ? Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0') : '--:--';
  players.forEach((audio, index) => {
    const title = audio.getAttribute('aria-label')?.replace(/^Listen to /, '') || 'track';
    const player = document.createElement('div');
    player.className = 'music-player';
    player.innerHTML = `<button class="music-play" type="button" aria-pressed="false"><img class="play-icon" src="assets/icons/play-fill.svg" alt="" width="22" height="22"><img class="pause-icon" src="assets/icons/pause-fill.svg" alt="" width="22" height="22" hidden></button><div class="music-timeline"><label class="visually-hidden" for="seek-${index}"></label><input class="music-seek" id="seek-${index}" type="range" min="0" max="100" step="0.1" value="0" disabled><div class="music-times" aria-hidden="true"><span class="elapsed">0:00</span><span class="duration">--:--</span></div></div><p class="music-status" role="status" aria-live="polite"></p>`;
    const button = player.querySelector('button');
    const seek = player.querySelector('input');
    const status = player.querySelector('.music-status');
    const elapsed = player.querySelector('.elapsed');
    const duration = player.querySelector('.duration');
    button.setAttribute('aria-label', 'Play ' + title);
    player.querySelector('label').textContent = 'Playback position for ' + title;
    let pending = false;
    function update() {
      const validDuration = Number.isFinite(audio.duration) && audio.duration > 0;
      seek.disabled = !validDuration;
      seek.max = validDuration ? audio.duration : 100;
      seek.value = audio.currentTime || 0;
      seek.setAttribute('aria-valuetext', formatTime(audio.currentTime) + ' of ' + formatTime(audio.duration));
      elapsed.textContent = formatTime(audio.currentTime || 0);
      duration.textContent = formatTime(audio.duration);
      const playing = !audio.paused && !audio.ended;
      button.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + title);
      button.setAttribute('aria-pressed', String(playing));
      player.querySelector('.play-icon').hidden = playing;
      player.querySelector('.pause-icon').hidden = !playing;
    }
    function showError() {
      status.replaceChildren(document.createTextNode('Couldn’t play this track. '));
      const link = document.createElement('a');
      link.href = audio.currentSrc || audio.src || audio.querySelector('source')?.src;
      link.textContent = 'Open audio';
      status.append(link);
      pending = false;
      button.disabled = false;
      update();
    }
    button.addEventListener('click', async () => {
      if (pending) return;
      if (!audio.paused) { audio.pause(); return; }
      players.forEach(other => { if (other !== audio) other.pause(); });
      pending = true;
      button.disabled = true;
      status.textContent = 'Loading audio…';
      try {
        if (audio.error) audio.load();
        await audio.play();
        status.textContent = '';
      } catch (_) { showError(); }
      finally { pending = false; button.disabled = false; update(); }
    });
    seek.addEventListener('input', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = Math.min(audio.duration, Math.max(0, Number(seek.value)));
        update();
      }
    });
    for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended']) audio.addEventListener(event, update);
    audio.addEventListener('playing', () => { status.textContent = ''; update(); });
    audio.addEventListener('waiting', () => { if (!audio.paused) status.textContent = 'Buffering…'; });
    audio.addEventListener('error', showError);
    audio.insertAdjacentElement('afterend', player);
    audio.controls = false;
    audio.hidden = true;
    update();
  });
});
