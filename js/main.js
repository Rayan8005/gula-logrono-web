const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav-principal');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const heroVideo = document.querySelector('.hero-video');
const heroVideoToggle = document.querySelector('[data-video-toggle]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroSection = heroVideo?.closest('.hero-video-hero');
if (heroSection && !reducedMotion.matches) {
  let scrollFrame = 0;
  const updateHeroOpacity = () => {
    const height = Math.max(heroSection.offsetHeight, 1);
    const progress = Math.min(1, Math.max(0, 1 - heroSection.getBoundingClientRect().bottom / height));
    heroSection.style.setProperty('--hero-scroll-opacity', (1 - progress).toFixed(3));
    scrollFrame = 0;
  };
  const scheduleHeroOpacity = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateHeroOpacity);
  };
  window.addEventListener('scroll', scheduleHeroOpacity, { passive: true });
  window.addEventListener('resize', scheduleHeroOpacity);
  scheduleHeroOpacity();
}
const updateVideoToggle = () => {
  if (!heroVideo || !heroVideoToggle) return;
  const paused = heroVideo.paused;
  heroVideoToggle.textContent = paused ? '▶' : 'Ⅱ';
  heroVideoToggle.setAttribute('aria-label', paused ? 'Reproducir el vídeo de portada' : 'Pausar el vídeo de portada');
};
if (heroVideo && reducedMotion.matches) heroVideo.pause();
heroVideoToggle?.addEventListener('click', async () => {
  if (!heroVideo) return;
  if (heroVideo.paused) {
    try { await heroVideo.play(); } catch { /* El navegador puede impedir la reproducción. */ }
  } else heroVideo.pause();
  updateVideoToggle();
});
heroVideo?.addEventListener('play', updateVideoToggle);
heroVideo?.addEventListener('pause', updateVideoToggle);
updateVideoToggle();

const updateSummary = () => {
  const base = document.querySelector('input[name="base"]:checked')?.value || 'Tarta mini';
  const toppings = [...document.querySelectorAll('.toppings input:checked')].map((item) => item.value.toLowerCase());
  const summary = toppings.length ? `${base} con ${toppings.join(', ')}` : `${base} sin toppings`;
  document.querySelector('#order-summary').textContent = summary;
};
document.querySelectorAll('.builder input').forEach((input) => input.addEventListener('change', updateSummary));
updateSummary();

document.querySelector('#load-map')?.addEventListener('click', (event) => {
  const slot = document.querySelector('#map-slot');
  if (slot.querySelector('iframe')) return;
  const frame = document.createElement('iframe');
  frame.title = 'Mapa de GULA en calle Siervas de Jesús, Logroño';
  frame.loading = 'lazy';
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  frame.src = 'https://maps.google.com/maps?q=Calle%20Siervas%20de%20Jesus%202%2C%20Logrono&t=&z=16&ie=UTF8&iwloc=&output=embed';
  slot.replaceChildren(frame);
  event.currentTarget.innerHTML = 'Mapa cargado <span>✓</span>';
  event.currentTarget.setAttribute('aria-expanded', 'true');
});

document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  document.querySelector('#form-status').textContent = 'Se abrirá tu aplicación de correo; añade allí el email de GULA, aún por confirmar.';
  // TODO: añadir el email oficial de GULA cuando esté confirmado.
  window.location.href = `mailto:?subject=${encodeURIComponent('Consulta para GULA')}&body=${encodeURIComponent(`Mi email: ${email}\n\n${message}\n\nDestinatario de GULA por confirmar.`)}`;
});

const consent = document.querySelector('#consent-banner');
const externalChoice = localStorage.getItem('gula-external-consent');
const loadInstagramPosts = () => {
  document.querySelectorAll('[data-instagram-src]').forEach((frame) => {
    if (!frame.src) frame.src = frame.dataset.instagramSrc;
    const cover = frame.closest('.social-embed-shell')?.querySelector('.embed-placeholder');
    if (cover) cover.hidden = true;
  });
};
const loadExternalContent = () => {
  if (!document.querySelector('link[data-gula-fonts]')) {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.gstatic.com';
    preconnect.crossOrigin = 'anonymous';
    document.head.append(preconnect);
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.dataset.gulaFonts = 'true';
    fonts.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fredoka:wght@500;600;700&display=swap';
    document.head.append(fonts);
  }
  loadInstagramPosts();
};
if (externalChoice === 'accepted') loadExternalContent();
else if (externalChoice !== 'rejected') consent.hidden = false;
const chooseExternal = (accepted) => {
  localStorage.setItem('gula-external-consent', accepted ? 'accepted' : 'rejected');
  consent.hidden = true;
  if (accepted) loadExternalContent();
};
document.querySelector('#accept-external')?.addEventListener('click', () => chooseExternal(true));
document.querySelector('#reject-external')?.addEventListener('click', () => chooseExternal(false));

