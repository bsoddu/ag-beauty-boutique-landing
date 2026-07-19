// Cookie banner — sposta anche il bottone WhatsApp fluttuante mentre il banner
// e' visibile (altrimenti su mobile il banner copre il bottone WA).
(function () {
  var banner = document.getElementById('ck');
  var okBtn = document.getElementById('ckOk');
  var noBtn = document.getElementById('ckNo');

  function syncWaOffset() {
    var h = banner.classList.contains('show') ? banner.offsetHeight : 0;
    document.documentElement.style.setProperty('--wa-off', h + 'px');
  }

  if (!localStorage.getItem('agbb_cookies_choice')) {
    banner.classList.add('show');
  }
  syncWaOffset();
  window.addEventListener('resize', syncWaOffset);

  okBtn.addEventListener('click', function () {
    localStorage.setItem('agbb_cookies_choice', 'accepted');
    banner.classList.remove('show');
    syncWaOffset();
  });
  noBtn.addEventListener('click', function () {
    localStorage.setItem('agbb_cookies_choice', 'rejected');
    banner.classList.remove('show');
    syncWaOffset();
  });
})();

// Low-power detection
const cores = navigator.hardwareConcurrency || 4;
const mem = navigator.deviceMemory || 8;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPower = prefersReduced || cores <= 2 || mem <= 4;
if (isLowPower) document.documentElement.classList.add('low-power');

let animationsStarted = false;

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  items.forEach((el) => el.classList.add('js-ready'));

  if (isLowPower || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  items.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });
}

function initImageEffects() {
  if (isLowPower || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const bandImg = document.querySelector('.imgband img');
  if (bandImg) {
    gsap.to(bandImg, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.imgband', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  document.querySelectorAll('.img-reveal').forEach((el) => {
    const img = el.querySelector('img');
    if (!img) return;
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
    gsap.fromTo(img, { scale: 1.2 }, {
      scale: 1, duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

function initLenis() {
  if (isLowPower || typeof Lenis === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
  const lenis = new Lenis({
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(500, 33);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  lenis.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  });
  window._lenis = lenis;
}

function initMagneticCta() {
  if (isLowPower || typeof gsap === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
  const btn = document.getElementById('heroCta');
  if (!btn) return;
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.25, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  });
}

function boot() {
  if (animationsStarted) return;
  animationsStarted = true;
  initReveal();
  initMagneticCta();
  initImageEffects();
  initLenis();
  if (typeof ScrollTrigger !== 'undefined') {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 400);
  }
}

window.addEventListener('load', () => {
  document.fonts.ready.then(boot).catch(boot);
  setTimeout(boot, 2500);
});
