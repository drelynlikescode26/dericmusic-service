// ─── Clean Anchor Scrolling (no hash in URL) ─────────────────
document.querySelectorAll('.nav__link--anchor').forEach((link) => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', window.location.pathname);
  });
});

// ─── Mobile Nav Toggle ──────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const navMenu = document.querySelector('.nav__links');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navMenu.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ─── Nav Scroll Effect ─────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener(
    'scroll',
    () => nav.classList.toggle('scrolled', window.scrollY > 60),
    { passive: true }
  );
}

// ─── Scroll Reveal ─────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => {
  const parent = el.closest('.services__grid, .value__list');
  if (parent) {
    const index = Array.from(parent.children).indexOf(el);
    if (index > -1) el.dataset.delay = String(index * 110);
  }
  revealObserver.observe(el);
});

// ─── Audio Player ────────────────────────────────────────────
(function () {
  const tracks = document.querySelectorAll('.track');
  if (!tracks.length) return;

  let activeAudio = null;
  let activeTrack = null;
  let volume = 0.8;

  const volSlider = document.getElementById('volume-slider');
  const volIcon = document.getElementById('vol-icon');

  function updateVolIcon(v) {
    if (!volIcon) return;
    volIcon.className = v === 0
      ? 'fa-solid fa-volume-xmark'
      : v < 0.5
        ? 'fa-solid fa-volume-low'
        : 'fa-solid fa-volume-high';
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      volume = parseFloat(volSlider.value);
      if (activeAudio) activeAudio.volume = volume;
      updateVolIcon(volume);
    });
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  function resetTrack(track) {
    track.classList.remove('is-playing');
    track.querySelector('.track__progress-fill').style.width = '0%';
    track.querySelector('.track__time').textContent = '0:00';
    const icon = track.querySelector('.track__play i');
    icon.className = 'fa-solid fa-play';
  }

  tracks.forEach((track) => {
    const btn = track.querySelector('.track__play');
    const fill = track.querySelector('.track__progress-fill');
    const timeEl = track.querySelector('.track__time');
    const bar = track.querySelector('.track__progress-bar');
    const src = track.dataset.src;

    btn.addEventListener('click', () => {
      if (activeTrack === track) {
        if (activeAudio.paused) {
          activeAudio.play();
          track.classList.add('is-playing');
          btn.querySelector('i').className = 'fa-solid fa-pause';
        } else {
          activeAudio.pause();
          track.classList.remove('is-playing');
          btn.querySelector('i').className = 'fa-solid fa-play';
        }
        return;
      }

      if (activeAudio) {
        activeAudio.pause();
        resetTrack(activeTrack);
      }

      activeAudio = new Audio(src);
      activeAudio.volume = volume;
      activeTrack = track;
      activeAudio.play();
      track.classList.add('is-playing');
      btn.querySelector('i').className = 'fa-solid fa-pause';

      activeAudio.addEventListener('timeupdate', () => {
        if (!activeAudio.duration) return;
        fill.style.width = (activeAudio.currentTime / activeAudio.duration * 100) + '%';
        timeEl.textContent = formatTime(activeAudio.currentTime);
      });

      activeAudio.addEventListener('ended', () => resetTrack(track));
    });

    bar.addEventListener('click', (e) => {
      if (activeTrack !== track || !activeAudio || !activeAudio.duration) return;
      const rect = bar.getBoundingClientRect();
      activeAudio.currentTime = ((e.clientX - rect.left) / rect.width) * activeAudio.duration;
    });
  });
})();

// ─── Count-Up Animation ────────────────────────────────────────────
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const credSection = document.getElementById('credibility');
if (credSection) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target
            .querySelectorAll('.stat__number[data-target]')
            .forEach(countUp);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  statObserver.observe(credSection);
}

// ─── Full-Screen Service Console ──────────────────────────
const serviceConsole = document.querySelector('.service-console');
if (serviceConsole) {
  const services = {
    hook: {
      name: 'Custom Hook',
      description: 'A hook or longer chorus written for your track.',
      price: '$100',
      note: 'Reference vocals help you hear the flow. They are not for release.',
      url: 'https://book.stripe.com/eVqeVd3zA4Hp0kraP6fnO00',
    },
    songwriting: {
      name: 'Full Songwriting',
      description: 'A complete song written around your idea, story, or sound.',
      price: '$200',
      note: 'Ghostwriting is available if you want to release the song under your name.',
      url: 'https://buy.stripe.com/28E3cveee1vdgjp5uMfnO01',
    },
    record: {
      name: 'Full Record',
      description: 'A complete song written and recorded by Deric on your beat.',
      price: '$275',
      note: 'For a finished Deric performance on your beat.',
      url: 'https://buy.stripe.com/9B66oH7PQddVc396yQfnO02',
    },
    feature: {
      name: 'Feature / Custom Verse',
      description: 'A custom verse or hook written and recorded by Deric for your track.',
      price: '$150',
      note: 'For artists who want Deric on the record without booking a full song.',
      url: 'https://buy.stripe.com/fZu4gz2vw0r92sz4qIfnO03',
    },
  };

  const name = document.getElementById('console-service-name');
  const description = document.getElementById('console-service-description');
  const price = document.getElementById('console-service-price');
  const note = document.getElementById('console-service-note');
  const bookLink = document.getElementById('console-book-link');

  document.querySelectorAll('.service-console__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const service = services[tab.dataset.service];
      if (!service) return;

      document.querySelectorAll('.service-console__tab').forEach((other) => {
        const isSelected = other === tab;
        other.classList.toggle('is-active', isSelected);
        other.setAttribute('aria-selected', String(isSelected));
      });

      serviceConsole.dataset.service = tab.dataset.service;
      name.textContent = service.name;
      description.textContent = service.description;
      price.textContent = service.price;
      note.textContent = service.note;
      bookLink.href = service.url;
    });
  });
}

// ─── FAQ Accordion ─────────────────────────────────────────
document.querySelectorAll('.faq__item').forEach((item) => {
  const btn = item.querySelector('.faq__q');
  const answer = item.querySelector('.faq__a');
  if (!btn || !answer) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    // Close any other open item
    document.querySelectorAll('.faq__item.is-open').forEach((other) => {
      if (other !== item) {
        other.classList.remove('is-open');
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq__a').style.maxHeight = null;
      }
    });

    if (isOpen) {
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = null;
    } else {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});
