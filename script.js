// Dark mode toggle with localStorage
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const year = document.getElementById('year');

  // Year in footer
  year.textContent = new Date().getFullYear();

  // Initial theme from storage or system
  const stored = localStorage.getItem('theme');
  if (stored === 'light') root.classList.add('light');
  if (stored === 'dark') root.classList.remove('light');

  function toggleTheme() {
    const isLight = root.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    btn.setAttribute('aria-pressed', String(isLight));
  }

  if (btn) btn.addEventListener('click', toggleTheme);

  // Mobile nav toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    // Close when clicking a link (mobile)
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll focus management for accessibility
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      // Let native smooth scroll do its thing; we just set focus after.
      setTimeout(() => section.setAttribute('tabindex', '-1'), 0);
      section.addEventListener('transitionend', () => section.focus(), { once: true });
    });
  });

  // Contact form (basic client-side validation + fake submit)
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      const errName = document.getElementById('errName');
      const errEmail = document.getElementById('errEmail');
      const errMessage = document.getElementById('errMessage');
      const success = document.getElementById('formSuccess');

      // Reset
      [errName, errEmail, errMessage].forEach(n => n.textContent = '');
      success.textContent = '';

      let valid = true;
      if (!name.value.trim()) { errName.textContent = 'Please enter your name.'; valid = false; }
      if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value)) { errEmail.textContent = 'Please enter a valid email.'; valid = false; }
      if (!message.value.trim()) { errMessage.textContent = 'Please enter a message.'; valid = false; }

      if (!valid) return;

      // Simulate submit
      setTimeout(() => {
        success.textContent = 'Thanks! Your message has been sent.';
        form.reset();
      }, 300);
    });
  }
})();
