const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const docEl = document.documentElement;
const progressFill = document.querySelector('.progress-bar span');
const header = document.querySelector('.site-header');
const hero = document.querySelector('[data-hero]');
const heroCard = document.querySelector('.hero-card');
const magneticEls = document.querySelectorAll('.magnetic');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Split hero headline into animated words for a StringTune-style motion feel.
const splitText = (node) => {
  const text = node.textContent.trim();
  const words = text.split(/\s+/);
  node.textContent = '';
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word + (index < words.length - 1 ? ' ' : '');
    span.className = 'split-word';
    span.style.transitionDelay = `${index * 55}ms`;
    node.appendChild(span);
  });
};

const headline = document.querySelector('[data-split-text]');
if (headline) {
  if (prefersReducedMotion) {
    headline.classList.add('is-visible');
  } else {
    splitText(headline);
    requestAnimationFrame(() => headline.classList.add('is-visible'));
  }
}

const splitStyles = document.createElement('style');
splitStyles.textContent = `
  .split-word {
    display: inline-block;
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 420ms ease, transform 420ms ease;
  }
  [data-split-text].is-visible .split-word {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(splitStyles);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let rafId = 0;
let targetX = 50;
let targetY = 50;
let currentX = 50;
let currentY = 50;

if (!prefersReducedMotion) {
  const update = () => {
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / scrollMax, 0, 1);
    if (progressFill) progressFill.style.width = `${progress * 100}%`;

    if (header) {
      header.style.transform = window.scrollY > 80 && window.scrollY > (window.__lastY || 0) ? 'translateY(-100%)' : 'translateY(0)';
      window.__lastY = window.scrollY;
    }

    const ambientA = document.querySelector('.ambient-a');
    const ambientB = document.querySelector('.ambient-b');
    if (ambientA) ambientA.style.transform = `translate3d(${progress * 40}px, ${progress * 22}px, 0)`;
    if (ambientB) ambientB.style.transform = `translate3d(${-progress * 48}px, ${-progress * 18}px, 0)`;

    if (hero) {
      hero.style.setProperty('--hero-progress', progress.toFixed(4));
    }

    if (heroCard) {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroCard.style.setProperty('--mx', `${currentX}%`);
      heroCard.style.setProperty('--my', `${currentY}%`);
    }

    rafId = requestAnimationFrame(update);
  };

  rafId = requestAnimationFrame(update);

  document.addEventListener('pointermove', (event) => {
    const heroBox = hero?.getBoundingClientRect();
    if (!heroBox) return;
    if (event.clientY < heroBox.top || event.clientY > heroBox.bottom) return;
    const x = ((event.clientX - heroBox.left) / heroBox.width) * 100;
    const y = ((event.clientY - heroBox.top) / heroBox.height) * 100;
    targetX = clamp(x, 12, 88);
    targetY = clamp(y, 12, 88);
  });

  magneticEls.forEach((el) => {
    let rect = null;
    let dx = 0;
    let dy = 0;

    const reset = () => {
      dx = 0;
      dy = 0;
      el.style.transform = 'translate3d(0,0,0)';
    };

    el.addEventListener('pointerenter', () => {
      rect = el.getBoundingClientRect();
    });

    el.addEventListener('pointermove', (event) => {
      if (!rect) rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      dx = clamp((event.clientX - centerX) / 18, -10, 10);
      dy = clamp((event.clientY - centerY) / 18, -10, 10);
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });

    el.addEventListener('pointerleave', reset);
  });
}

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', () => {
    const button = form.querySelector('.btn-submit');
    if (button) button.textContent = 'Sending inquiry...';
  });
}

window.addEventListener('beforeunload', () => {
  if (rafId) cancelAnimationFrame(rafId);
});
