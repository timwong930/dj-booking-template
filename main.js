const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

if (!prefersReducedMotion) {
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.style.transform = y > 70 && y > lastY ? 'translateY(-100%)' : 'translateY(0)';
    }
    lastY = y;
    requestAnimationFrame(onScroll);
  };

  requestAnimationFrame(onScroll);
}

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', () => {
    const button = form.querySelector('.btn-submit');
    if (button) button.textContent = 'Sending inquiry...';
  });
}
