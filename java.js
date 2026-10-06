(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navAnchors = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = navAnchors
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });



  function scrollToTarget(target) {
    if (!target) return;
    const offset = 84;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  }




  const allAnchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

  allAnchorLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTarget(target);

      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }



  const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = prefersReduced ? '0ms' : `${Math.min(i % 6, 5) * 60}ms`;
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }


  const counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = prefersReduced ? 0 : 1100;
    const start = performance.now();

    function tick(now) {
      const p = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(c => counterObserver.observe(c));
    } else {
      counters.forEach(animateCounter);
    }
  }


  const bars = document.querySelectorAll('.skill-bar__fill');
  if (bars.length && 'IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          requestAnimationFrame(() => { el.style.width = el.dataset.fill + '%'; });
          barObserver.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => barObserver.observe(b));
  } else {
    bars.forEach(b => { b.style.width = b.dataset.fill + '%'; });
  }


  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !isTouch && !prefersReduced) {
    let cgActive = false;
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      if (!cgActive) { cursorGlow.classList.add('is-active'); cgActive = true; }
    }, { passive: true });
    window.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('is-active');
      cgActive = false;
    });
  }




  const hero = document.getElementById('hero');
  const heroGlow = document.getElementById('heroGlow');

  function setGlow(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--gx', x + '%');
    hero.style.setProperty('--gy', y + '%');
  }

  if (hero && heroGlow) {
    hero.addEventListener('mousemove', (e) => {
      setGlow(e.clientX, e.clientY);
      hero.classList.add('is-hovering');
    });
    hero.addEventListener('mouseenter', () => hero.classList.add('is-hovering'));
    hero.addEventListener('mouseleave', () => hero.classList.remove('is-hovering'));

    hero.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (t) setGlow(t.clientX, t.clientY);
      hero.classList.add('is-hovering');
    }, { passive: true });
    hero.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) setGlow(t.clientX, t.clientY);
    }, { passive: true });
    hero.addEventListener('touchend', () => {
      setTimeout(() => hero.classList.remove('is-hovering'), 400);
    }, { passive: true });
  }




  const canvas = document.getElementById('heroCanvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    let pointer = { x: null, y: null, active: false };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = isTouch ? 14000 : 9000;
      const count = Math.max(24, Math.min(90, Math.floor((w * h) / density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    function updatePointerFromEvent(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
    }

    hero.addEventListener('mousemove', (e) => {
      updatePointerFromEvent(e.clientX, e.clientY);
      pointer.active = true;
    });
    hero.addEventListener('mouseleave', () => { pointer.active = false; });
    hero.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) { updatePointerFromEvent(t.clientX, t.clientY); pointer.active = true; }
    }, { passive: true });
    hero.addEventListener('touchend', () => { pointer.active = false; });

    function step() {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 130;
      const linkDistSq = linkDist * linkDist;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (pointer.active && pointer.x !== null) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          const influence = 30000;
          if (distSq < influence) {
            const force = (1 - distSq / influence) * 0.035;
            p.vx += dx * force * 0.02;
            p.vy += dy * force * 0.02;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      const glowBoost = pointer.active ? 1 : 0;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < linkDistSq) {
            const alpha = (1 - distSq / linkDistSq) * (0.16 + glowBoost * 0.10);
            ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(196,181,253,${0.55 + glowBoost * 0.25})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    resize();
    requestAnimationFrame(step);
    window.addEventListener('resize', resize);
  }



  
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const strength = 7;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--ry', (px * strength * 2) + 'deg');
        card.style.setProperty('--rx', (-py * strength * 2) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }





const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    nome: document.getElementById('nome'),
    telefone: document.getElementById('telefone'),
    email: document.getElementById('email'),
    mensagem: document.getElementById('mensagem')
  };
  const errors = {
    nome: document.getElementById('err-nome'),
    telefone: document.getElementById('err-telefone'),
    email: document.getElementById('err-email'),
    mensagem: document.getElementById('err-mensagem')
  };
  const charCount = document.getElementById('charCount');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = form.querySelector('.form-submit');
  const MAX_MSG = 500;


  fields.telefone.addEventListener('input', () => {
    let v = fields.telefone.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) {
      v = v.length > 10
        ? v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
        : v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/(\d{0,2})/, '($1');
    }
    fields.telefone.value = v.trim().replace(/-$/, '');
  });

 

  fields.mensagem.addEventListener('input', () => {
    const len = fields.mensagem.value.length;
    if (len > MAX_MSG) {
      fields.mensagem.value = fields.mensagem.value.slice(0, MAX_MSG);
    }
    const current = fields.mensagem.value.length;
    charCount.textContent = `${current}/${MAX_MSG}`;
    charCount.classList.toggle('is-limit', current >= MAX_MSG);
  });

  function setError(name, message) {
    fields[name].classList.toggle('is-invalid', Boolean(message));
    fields[name].classList.toggle('is-valid', !message);
    errors[name].textContent = message || '';
  }

  function validateNome() {
    const v = fields.nome.value.trim();
    if (!v) return setError('nome', 'Digite seu nome.'), false;
    if (v.length < 3) return setError('nome', 'Digite seu nome completo.'), false;
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(v)) return setError('nome', 'Use apenas letras.'), false;
    setError('nome', '');
    return true;
  }

  function validateTelefone() {
    const digits = fields.telefone.value.replace(/\D/g, '');
    if (!digits) return setError('telefone', 'Digite seu telefone.'), false;
    if (digits.length < 10 || digits.length > 11) return setError('telefone', 'Telefone incompleto.'), false;
    setError('telefone', '');
    return true;
  }

  function validateEmail() {
    const v = fields.email.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) return setError('email', 'Digite seu e-mail.'), false;
    if (!re.test(v)) return setError('email', 'E-mail inválido.'), false;
    setError('email', '');
    return true;
  }

  function validateMensagem() {
    const v = fields.mensagem.value.trim();
    if (!v) return setError('mensagem', 'Escreva sua mensagem.'), false;
    if (v.length < 10) return setError('mensagem', 'Conte um pouco mais (mín. 10 caracteres).'), false;
    setError('mensagem', '');
    return true;
  }

  const validators = { nome: validateNome, telefone: validateTelefone, email: validateEmail, mensagem: validateMensagem };
  Object.keys(fields).forEach(name => {
    fields[name].addEventListener('blur', () => validators[name]());
    fields[name].addEventListener('input', () => {
      if (fields[name].classList.contains('is-invalid')) validators[name]();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = [validateNome(), validateTelefone(), validateEmail(), validateMensagem()];
    const allValid = results.every(Boolean);

    if (!allValid) {
      formStatus.textContent = 'Confira os campos destacados antes de enviar.';
      formStatus.className = 'form-status is-error';
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

  
    
    
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Enviando...';

    setTimeout(() => {
      formStatus.textContent = 'Mensagem enviada com sucesso! Vou te responder em breve.';
      formStatus.className = 'form-status is-success';
      form.reset();
      charCount.textContent = `0/${MAX_MSG}`;
      Object.keys(fields).forEach(name => {
        fields[name].classList.remove('is-valid', 'is-invalid');
      });
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Enviar mensagem';
    }, 900);
  });

  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  if (themeToggle && themeIcon) {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);

      if (theme === 'light') {
        themeIcon.src = 'sun.png';
        themeIcon.alt = 'Sol';
        themeToggle.setAttribute('aria-label', 'Ativar modo escuro');
        themeToggle.setAttribute('title', 'Ativar modo escuro');
      } else {
        themeIcon.src = 'moon.png';
        themeIcon.alt = 'Lua minguante';
        themeToggle.setAttribute('aria-label', 'Ativar modo claro');
        themeToggle.setAttribute('title', 'Ativar modo claro');
      }
    }

    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme');

      const newTheme =
        currentTheme === 'light' ? 'dark' : 'light';

      applyTheme(newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
    });
  }



})();
