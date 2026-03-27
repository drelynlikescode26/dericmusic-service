// ─── Scroll Reveal ───────────────────────────────────────
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

// ─── Nav Scroll Effect ───────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener(
    'scroll',
    () => nav.classList.toggle('scrolled', window.scrollY > 60),
    { passive: true }
  );
}

// ─── Count-Up Animation ──────────────────────────────────
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

// ─── Close Mobile Nav on Link Click ─────────────────────
document.querySelectorAll('.nav__link').forEach((link) => {
  link.addEventListener('click', () => {
    const toggle = document.getElementById('nav-toggle');
    if (toggle) toggle.checked = false;
  });
});
