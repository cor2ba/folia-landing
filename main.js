/* Folia · Landing de descarga para Android */
(() => {
  const cfg = window.FOLIA || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Plataforma ---------- */
  const ua = navigator.userAgent || '';
  const platform = /android/i.test(ua)
    ? 'android'
    : /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
      ? 'ios'
      : 'desktop';

  /* ---------- Hojas que caen de fondo ---------- */
  if (!reduceMotion) {
    const container = $('.leaves');
    const count = window.innerWidth < 700 ? 7 : 12;
    for (let i = 0; i < count; i++) {
      const size = 18 + Math.random() * 34;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 64 64');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.innerHTML = '<use href="#leaf" />';
      svg.style.left = `${Math.random() * 100}%`;
      svg.style.animationDuration = `${18 + Math.random() * 18}s`;
      svg.style.animationDelay = `${-Math.random() * 30}s`;
      svg.style.setProperty('--sway', `${(Math.random() - 0.5) * 160}px`);
      container.appendChild(svg);
    }
  }

  /* ---------- Navegación con fondo al hacer scroll ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Aparición escalonada al hacer scroll ---------- */
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    const parent = el.parentElement;
    const index = groups.get(parent) ?? 0;
    groups.set(parent, index + 1);
    el.style.setProperty('--delay', `${Math.min(index, 6) * 0.08}s`);
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  $$('.reveal').forEach((el) => observer.observe(el));

  /* ---------- Teléfono: pantallas que se alternan ---------- */
  const screens = $$('.screen');
  const dots = $$('.screen-dots i');
  let current = 0;

  function typeText(el) {
    const text = el.dataset.text || '';
    el.textContent = '';
    [...text].forEach((ch, i) => setTimeout(() => (el.textContent += ch), 300 + i * 90));
  }

  function showScreen(next) {
    const prev = screens[current];
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    setTimeout(() => prev.classList.remove('is-leaving'), 400);
    // Reinicia las animaciones CSS de la pantalla entrante.
    const incoming = screens[next];
    incoming.classList.remove('is-active');
    void incoming.offsetWidth;
    incoming.classList.add('is-active');
    const typing = $('.typing', incoming);
    if (typing) typeText(typing);
    dots.forEach((d, i) => d.classList.toggle('on', i === next));
    current = next;
  }

  if (!reduceMotion) setInterval(() => showScreen((current + 1) % screens.length), 4800);

  /* ---------- Teléfono: inclinación con el mouse ---------- */
  const phone = $('#phone');
  const visual = $('.hero-visual');
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    visual.addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.setProperty('--ry', `${x * 22}deg`);
      phone.style.setProperty('--rx', `${-y * 16}deg`);
    });
    visual.addEventListener('pointerleave', () => {
      phone.style.removeProperty('--ry');
      phone.style.removeProperty('--rx');
    });
  }

  /* ---------- Botón de descarga ---------- */
  const btn = $('#download-btn');
  const meta = $('#download-meta');
  const label = $('.dl-label', btn);
  const note = $('#platform-note');

  const details = [`Versión ${cfg.version || '1.0.0'}`, cfg.size, 'APK'].filter(Boolean).join(' · ');
  meta.textContent = details;

  function disableDownload(message) {
    btn.removeAttribute('href');
    btn.setAttribute('aria-disabled', 'true');
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';
    label.textContent = 'Muy pronto en Android';
    meta.textContent = message;
  }

  if (cfg.apkUrl) {
    btn.href = cfg.apkUrl;
    btn.setAttribute('download', cfg.apkFileName || 'Folia.apk');
    // Si el APK todavía no está publicado, el botón lo indica en vez de dar un error 404.
    if (location.protocol.startsWith('http')) {
      fetch(cfg.apkUrl, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) disableDownload('Estamos preparando la descarga');
        })
        .catch(() => {});
    }
  } else {
    disableDownload('Estamos preparando la descarga');
  }

  $$('.btn').forEach((b) =>
    b.addEventListener('pointerdown', (e) => {
      const r = b.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - r.left - size / 2}px`;
      ripple.style.top = `${e.clientY - r.top - size / 2}px`;
      b.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }),
  );

  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-disabled') === 'true') return;
    btn.classList.add('done');
    label.textContent = '¡Descarga iniciada!';
    meta.textContent = 'Abre el archivo para instalar Folia';
    burst(btn);
    setTimeout(() => {
      btn.classList.remove('done');
      label.textContent = 'Descargar para Android';
      meta.textContent = details;
    }, 5000);
  });

  /** Lluvia de hojas y gotas desde el botón. */
  function burst(origin) {
    if (reduceMotion) return;
    const r = origin.getBoundingClientRect();
    const emojis = ['🌿', '💧', '🍃', '✨'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.textContent = emojis[i % emojis.length];
      const angle = (Math.PI * 2 * i) / 14;
      const dist = 70 + Math.random() * 70;
      Object.assign(p.style, {
        position: 'fixed',
        left: `${r.left + r.width / 2}px`,
        top: `${r.top + r.height / 2}px`,
        fontSize: `${14 + Math.random() * 10}px`,
        pointerEvents: 'none',
        zIndex: 50,
      });
      document.body.appendChild(p);
      p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.4)', opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist + 40}px)) scale(1) rotate(${Math.random() * 180}deg)`,
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.22,1,.36,1)' },
      ).onfinish = () => p.remove();
    }
  }

  /* ---------- Mensajes según el dispositivo ---------- */
  if (platform === 'ios') {
    note.hidden = false;
    note.innerHTML = '📱 Estás en un iPhone. Por ahora Folia está disponible solo para <b>Android</b>; la versión para iPhone llegará pronto.';
  } else if (platform === 'desktop') {
    note.hidden = false;
    note.innerHTML = '💻 Estás en una computadora. Descarga el APK y pásalo a tu teléfono, o <a href="#qr-box" style="color:var(--primary);font-weight:600">escanea el código QR</a> desde tu celular.';
  }

  /* ---------- QR hacia esta página (solo en computadora) ---------- */
  window.addEventListener('load', () => {
    if (platform !== 'desktop' || !window.QRCode) return;
    $('#qr-box').hidden = false;
    new window.QRCode($('#qr'), {
      text: location.href.split('#')[0],
      width: 256,
      height: 256,
      colorDark: '#1C2B22',
      colorLight: '#FFFFFF',
    });
  });

  if (cfg.minAndroid) $('#min-android').textContent = `Android ${cfg.minAndroid} o superior`;
  $('#year').textContent = new Date().getFullYear();
})();
