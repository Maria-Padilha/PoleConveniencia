/* =========================================================
   Pole POS — interações da landing page
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  document.body.classList.add('is-loading');
  const hideLoader = () => {
    const loader = $('#loader');
    if (loader) loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  };
  window.addEventListener('load', () => setTimeout(hideLoader, 400));
  setTimeout(hideLoader, 3500); // garante que o loader some mesmo se alguma imagem demorar

  /* ---------- Ano no rodapé ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header, barra de progresso, voltar ao topo ---------- */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  let lastY = window.scrollY;
  let ticking = false;

  const parallaxEls = $$('.parallax');
  const parallaxBg = $$('.parallax-bg');
  const stepsFill = $('#stepsLineFill');
  const stepsWrap = $('.steps__wrap');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (header) {
      header.classList.toggle('is-scrolled', y > 20);
      const navOpen = $('#nav')?.classList.contains('is-open');
      header.classList.toggle('is-hidden', !navOpen && y > lastY && y > 500);
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 700);

    if (!reducedMotion) {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.1;
        el.style.translate = `0 ${y * speed}px`;
      });
      parallaxBg.forEach(img => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.2;
        img.style.transform = `translateY(${offset - rect.height * 0.15}px)`;
      });
    }

    if (stepsFill && stepsWrap) {
      const r = stepsWrap.getBoundingClientRect();
      const pct = Math.min(Math.max((window.innerHeight * 0.75 - r.top) / r.height, 0), 1);
      stepsFill.style.width = `${pct * 100}%`;
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  if (burger && nav) {
    const toggleMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
    $$('a', nav).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
  }

  /* ---------- Link ativo no menu ---------- */
  const navLinks = $$('.nav__link[href^="#"]');
  if (navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(l => {
      const target = $(l.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  $$('.reveal').forEach(el => {
    if (el.dataset.delay) el.style.setProperty('--d', `${el.dataset.delay}ms`);
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Contadores animados ---------- */
  const formatNumber = (value, el) => {
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: el.dataset.format === 'money' ? 0 : decimals,
      maximumFractionDigits: decimals
    });
  };

  const animateCounter = el => {
    const target = parseFloat(el.dataset.target);
    if (reducedMotion) { el.textContent = formatNumber(target, el); return; }
    const duration = 2000;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = formatNumber(target * eased, el);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  $$('.counter').forEach(el => counterObserver.observe(el));

  /* ---------- Efeito 3D (tilt) na imagem do hero ---------- */
  if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    const glow = $('#cursorGlow');
    if (glow) {
      window.addEventListener('mousemove', e => {
        glow.classList.add('is-active');
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }, { passive: true });
      document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
    }
  }

  /* ---------- Dashboard: gráfico + abas ---------- */
  const dashData = {
    vendas: {
      title: 'Vendas por hora',
      bars: [22, 35, 48, 40, 62, 88, 74, 56, 66, 92, 80, 58],
      labels: ['7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'],
      kpis: [['Faturamento', 'R$ 48.920', '+12%', true], ['Ticket médio', 'R$ 27,40', '+4%', true], ['Transações', '1.786', '+9%', true]]
    },
    estoque: {
      title: 'Giro por categoria',
      bars: [90, 72, 64, 55, 48, 40, 34, 28, 22, 18, 14, 10],
      labels: ['Beb', 'Sal', 'Doc', 'Cig', 'Caf', 'Lat', 'Pad', 'Hig', 'Con', 'Gel', 'Aut', 'Out'],
      kpis: [['Itens ativos', '2.348', '+56', true], ['Ruptura', '1,8%', '-0,6%', true], ['Validade 7d', '23 itens', '-12%', true]]
    },
    financeiro: {
      title: 'Receita por semana',
      bars: [45, 52, 49, 60, 58, 66, 71, 69, 78, 82, 86, 94],
      labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'],
      kpis: [['Margem bruta', '31,6%', '+2,1%', true], ['A receber', 'R$ 12.480', '+8%', true], ['Taxas', 'R$ 1.204', '-5%', true]]
    }
  };

  const chartBars = $('#chartBars');
  const chartTitle = $('#chartTitle');
  const dashboard = $('.dashboard');

  function renderChart(key, animate = true) {
    if (!chartBars) return;
    const data = dashData[key];
    if (chartTitle) chartTitle.textContent = data.title;

    if (!chartBars.children.length) {
      data.bars.forEach(() => {
        const b = document.createElement('div');
        b.className = 'bar';
        chartBars.appendChild(b);
      });
    }
    [...chartBars.children].forEach((bar, i) => {
      bar.dataset.label = data.labels[i];
      bar.title = `${data.labels[i]}: ${data.bars[i]}%`;
      const set = () => { bar.style.height = `${data.bars[i]}%`; };
      animate ? setTimeout(set, i * 50) : set();
    });

    $$('.kpi').forEach((kpi, i) => {
      kpi.classList.add('is-swapping');
      setTimeout(() => {
        // good: se a variação é boa para o lojista (ex.: queda de ruptura é positiva)
        const [label, value, delta, good] = data.kpis[i];
        $('[data-kpi-label]', kpi).textContent = label;
        $('[data-kpi-value]', kpi).textContent = value;
        const d = $('[data-kpi-delta]', kpi);
        d.textContent = delta;
        d.className = good ? 'up' : 'down';
        kpi.classList.remove('is-swapping');
      }, 250);
    });
  }

  if (dashboard) {
    const dashObserver = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      dashboard.classList.add('is-visible');
      renderChart('vendas');
      dashObserver.disconnect();
    }, { threshold: 0.3 });
    dashObserver.observe(dashboard);

    $$('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.tab').forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        renderChart(tab.dataset.tab);
      });
    });
  }

  /* ---------- Planos: mensal / anual ---------- */
  const billingSwitch = $('#billingSwitch');
  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      const yearly = !billingSwitch.classList.contains('is-on');
      billingSwitch.classList.toggle('is-on', yearly);
      billingSwitch.setAttribute('aria-pressed', String(yearly));
      $('[data-billing-label="monthly"]').classList.toggle('is-active', !yearly);
      $('[data-billing-label="yearly"]').classList.toggle('is-active', yearly);

      $$('[data-monthly]').forEach(el => {
        el.classList.add('is-flipping');
        setTimeout(() => {
          el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
          el.classList.remove('is-flipping');
        }, 220);
      });
    });
  }

  /* ---------- Slider de depoimentos ---------- */
  const track = $('#sliderTrack');
  if (track) {
    const slides = [...track.children];
    const dotsWrap = $('#sliderDots');
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.children];

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle('is-active', j === index));
    }
    const restart = () => {
      clearInterval(timer);
      if (!reducedMotion) timer = setInterval(() => goTo(index + 1), 6000);
    };

    $('#prevBtn').addEventListener('click', () => { goTo(index - 1); restart(); });
    $('#nextBtn').addEventListener('click', () => { goTo(index + 1); restart(); });

    // Swipe no celular
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) { goTo(index + (diff < 0 ? 1 : -1)); restart(); }
    });

    const slider = $('#slider');
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', restart);

    goTo(0);
    restart();
  }

  /* ---------- FAQ (acordeão) ---------- */
  $$('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const isOpen = item.classList.contains('is-open');
      $$('.acc-item.is-open').forEach(i => {
        i.classList.remove('is-open');
        $('.acc-head', i).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Formulário de contato ---------- */
  const form = $('#leadForm');
  if (form) {
    const msg = $('#formMsg');
    const phone = $('#telefone');

    // Máscara (00) 00000-0000
    phone.addEventListener('input', () => {
      const d = phone.value.replace(/\D/g, '').slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      phone.value = out;
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = {
        nome: v => v.trim().length >= 2,
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        telefone: v => v.replace(/\D/g, '').length >= 10
      };
      let valid = true;
      Object.entries(fields).forEach(([id, check]) => {
        const input = $(`#${id}`);
        const ok = check(input.value);
        input.parentElement.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      const consent = $('#consent');
      consent.parentElement.classList.toggle('is-invalid', !consent.checked);
      if (!consent.checked) valid = false;

      msg.className = 'form-msg';
      if (!valid) {
        msg.textContent = 'Confira os campos destacados e aceite a política de privacidade.';
        msg.classList.add('is-error');
        return;
      }

      const btn = $('button[type="submit"]', form);
      btn.classList.add('is-loading');
      btn.disabled = true;

      // Simulação de envio — substitua por uma chamada real à sua API
      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.disabled = false;
        form.reset();
        msg.textContent = 'Recebemos seus dados! Nossa equipe entrará em contato em breve.';
        msg.classList.add('is-success');
      }, 1400);
    });

    $$('input', form).forEach(input => {
      input.addEventListener('input', () => input.parentElement.classList.remove('is-invalid'));
    });
  }

  /* ---------- Banner de cookies ---------- */
  const cookie = $('#cookieBanner');
  if (cookie) {
    let choice = null;
    try { choice = localStorage.getItem('pole-cookie'); } catch (_) { /* armazenamento indisponível */ }
    if (!choice) setTimeout(() => cookie.classList.add('is-visible'), 2200);

    $$('[data-cookie]', cookie).forEach(btn => {
      btn.addEventListener('click', () => {
        try { localStorage.setItem('pole-cookie', btn.dataset.cookie); } catch (_) { /* ignora */ }
        cookie.classList.remove('is-visible');
      });
    });
  }

  /* ---------- Índice da página de privacidade ---------- */
  const tocLinks = $$('.toc a');
  if (tocLinks.length) {
    const tocObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    tocLinks.forEach(a => {
      const target = $(a.getAttribute('href'));
      if (target) tocObserver.observe(target);
    });
  }
})();
