    /* ── THEME TOGGLE ── */
    const html      = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const STORAGE_KEY = 'sg-theme';

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      localStorage.setItem(STORAGE_KEY, theme);
      stopMath(); startMath(); /* clear canvas and rebuild with new theme colours */
    }

    document.getElementById('themeToggle').addEventListener('click', () => {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    /* ── PHYSICS FIELD · floating equations & symbols, dual theme ── */
    const canvas = document.getElementById('bubbleCanvas');
    const ctx    = canvas.getContext('2d');
    let mathId   = null;
    let running  = false;

    const EQUATIONS = [
      /* physics */
      'iħ ∂ψ/∂t = Ĥψ',
      'E = mc²',
      'ΔxΔp ≥ ħ/2',
      '∇·E = ρ/ε₀',
      '∇·B = 0',
      '∇×E = −∂B/∂t',
      'S = k ln W',
      'e^iπ + 1 = 0',
      'F = Gm₁m₂/r²',
      '⟨ψ|Ĥ|ψ⟩ = E',
      'E = ħω',
      'L = T − V',
      'Z = Σ e^−βH',
      'PV = nRT',
      'c = λν',
      '∮ B·dl = μ₀I',
      '∇²ψ + k²ψ = 0',
      'ds² = gμν dxμ dxν',
      'Rμν − ½Rgμν = 8πGTμν',
      /* AI / ML */
      'Attn(Q,K,V) = softmax(QKᵀ/√dₖ)V',
      'P(A|B) = P(B|A)P(A)/P(B)',
      'L = −Σ y log ŷ',
      'θ ← θ − η∇L(θ)',
      'softmax(zᵢ) = eᶻⁱ/Σⱼeᶻʲ',
      'σ(z) = 1/(1+e⁻ᶻ)',
      'ReLU(x) = max(0, x)',
      'P(w₁…wₙ) = Π P(wᵢ | w₍<ᵢ₎)',
      'L_JEPA = ‖ f(sₓ) − s̄ᵧ ‖²',
      'KL(p‖q) = Σ p log(p/q)',
      'ELBO = E[log p(x|z)] − KL(q‖p)',
      'h = LayerNorm(x + MHA(x))',
      'ŷ = Wx + b',
      'hₜ = tanh(Wxₜ + Uhₜ₋₁)',
      'E = −log pθ(y|x)',
    ];
    const SYMBOLS = ['ψ','ħ','∞','∫','∮','Σ','π','∇','∂','λ','Ω','α','Δ','θ','Φ','μ','ε₀','χ','ℓ','ξ'];
    const MATH_FONT = '"STIX Two Math", "Cambria Math", Georgia, serif';

    /* ── architecture doodles, drawn as line sketches (no labels) ── */
    function boxPath(c, x, y, w, h) {
      if (c.roundRect) c.roundRect(x, y, w, h, 3); else c.rect(x, y, w, h);
    }

    function archMLP(c) {                 /* fully-connected net */
      const cols = [[-34, 3], [0, 4], [34, 3]];
      const pts = cols.map(([x, n]) => Array.from({ length: n }, (_, i) => [x, (i - (n - 1) / 2) * 17]));
      c.beginPath();
      for (let a = 0; a < pts.length - 1; a++)
        for (const p of pts[a]) for (const q of pts[a + 1]) { c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
      c.stroke();
      c.beginPath();
      for (const col of pts) for (const p of col) { c.moveTo(p[0] + 3.4, p[1]); c.arc(p[0], p[1], 3.4, 0, Math.PI * 2); }
      c.fill();
    }

    function archTransformer(c) {         /* stacked blocks + residual skip */
      const bw = 50, bh = 13, gap = 10;
      c.beginPath();
      for (let i = -1; i <= 1; i++) boxPath(c, -bw / 2, i * (bh + gap) - bh / 2, bw, bh);
      c.stroke();
      c.beginPath();                       /* flow arrows */
      for (const y of [bh + gap, 0]) {
        const top = y - gap + 1.5, bot = y - bh / 2 + 2.5;
        c.moveTo(0, y - bh / 2 + gap - 1); c.lineTo(0, y - bh / 2 + 1);
        c.moveTo(-3, bot + 3); c.lineTo(0, bot); c.lineTo(3, bot + 3);
      }
      c.moveTo(0, (bh + gap) + bh / 2 + 8); c.lineTo(0, (bh + gap) + bh / 2 + 1);
      c.moveTo(0, -(bh + gap) - bh / 2 - 1); c.lineTo(0, -(bh + gap) - bh / 2 - 8);
      c.stroke();
      c.beginPath();                       /* residual skip connection */
      c.moveTo(bw / 2 + 2, bh + gap);
      c.quadraticCurveTo(bw / 2 + 17, 0, bw / 2 + 2, -(bh + gap));
      c.stroke();
    }

    function archJEPA(c) {                /* two encoders → predictor ≈ target */
      c.beginPath();                       /* context encoder (solid) */
      boxPath(c, -44, 2, 30, 18);
      boxPath(c, -40, -30, 22, 14);        /* predictor */
      c.stroke();
      c.save();                            /* target encoder (dashed = EMA) */
      c.setLineDash([4, 3]);
      c.beginPath();
      boxPath(c, 14, 2, 30, 18);
      c.stroke();
      c.beginPath();                       /* predicted ≈ target embedding */
      c.moveTo(-18, -23); c.lineTo(23, -23);
      c.stroke();
      c.restore();
      c.beginPath();                       /* arrows up */
      c.moveTo(-29, 0); c.lineTo(-29, -14);
      c.moveTo(-32, -11); c.lineTo(-29, -14); c.lineTo(-26, -11);
      c.moveTo(29, 0); c.lineTo(29, -18);
      c.moveTo(26, -15); c.lineTo(29, -18); c.lineTo(32, -15);
      c.moveTo(-29, 28); c.lineTo(-29, 22);
      c.moveTo(29, 28); c.lineTo(29, 22);
      c.stroke();
      c.beginPath();                       /* embedding dots */
      c.arc(29, -23, 3, 0, Math.PI * 2);
      c.moveTo(-26, -23);
      c.arc(-29, -23, 3, 0, Math.PI * 2);
      c.fill();
    }

    function archAttention(c) {           /* token-to-token attention fan */
      const n = 5, sp = 17;
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const bx = (i - (n - 1) / 2) * sp;
        for (let j = 0; j < n; j++) {
          if (Math.abs(i - j) > 2) continue;
          const tx = (j - (n - 1) / 2) * sp;
          c.moveTo(bx, 18); c.lineTo(tx, -18);
        }
      }
      c.stroke();
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * sp;
        c.moveTo(x + 2.8, 18); c.arc(x, 18, 2.8, 0, Math.PI * 2);
        c.moveTo(x + 2.8, -18); c.arc(x, -18, 2.8, 0, Math.PI * 2);
      }
      c.fill();
    }

    function archCNN(c) {                 /* conv feature maps → head */
      c.beginPath();
      boxPath(c, -40, -14, 30, 30);
      boxPath(c, -32, -9, 22, 22);
      boxPath(c, -25, -4, 14, 14);
      c.stroke();
      c.beginPath();                       /* arrow to dense head */
      c.moveTo(-8, 3); c.lineTo(8, 3);
      c.moveTo(5, 0); c.lineTo(8, 3); c.lineTo(5, 6);
      c.stroke();
      c.beginPath();
      for (const y of [-8, 3, 14]) { c.moveTo(20 + 3, y); c.arc(20, y, 3, 0, Math.PI * 2); }
      c.fill();
      c.beginPath();
      c.moveTo(20, -5); c.lineTo(20, 0);
      c.moveTo(20, 6); c.lineTo(20, 11);
      c.stroke();
    }

    const ARCHS = [archMLP, archTransformer, archJEPA, archAttention, archCNN];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let floaters = [];
    let pmx = 0.5, pmy = 0.5; /* normalised pointer, for parallax */

    function makeFloater(anywhere) {
      const roll  = Math.random();
      const kind  = roll < 0.40 ? 'eq' : roll < 0.72 ? 'sym' : 'arch';
      const depth = 0.3 + Math.random() * 0.7;  /* 0.3 far … 1 near */
      return {
        kind,
        text:   kind === 'eq'  ? EQUATIONS[(Math.random() * EQUATIONS.length) | 0]
              : kind === 'sym' ? SYMBOLS[(Math.random() * SYMBOLS.length) | 0]
              : '',
        arch:   (Math.random() * ARCHS.length) | 0,
        x:      Math.random() * canvas.width,
        y:      anywhere ? Math.random() * canvas.height : canvas.height + 60,
        vx:     (Math.random() - 0.5) * 0.12,
        vy:     -(0.15 + Math.random() * 0.35) * depth,
        size:   kind === 'eq' ? 13 + depth * 13 : 20 + depth * 30,
        rot:    kind === 'arch' ? (Math.random() - 0.5) * 0.24 : (Math.random() - 0.5) * 0.5,
        vr:     (Math.random() - 0.5) * 0.0018,
        wobble: Math.random() * Math.PI * 2,
        hue:    Math.random() < 0.55 ? 0 : 1,
        depth,
      };
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const target = Math.min(34, Math.max(14, Math.round(canvas.width * canvas.height / 42000)));
      floaters = [];
      for (let i = 0; i < target; i++) floaters.push(makeFloater(true));
    }

    function drawFrame() {
      const w = canvas.width, h = canvas.height;
      const dark = html.getAttribute('data-theme') === 'dark';
      const cols  = dark ? ['139,92,246', '6,182,212'] : ['124,58,237', '2,132,199'];
      const baseA = dark ? 0.30 : 0.20;

      ctx.clearRect(0, 0, w, h);

      for (const f of floaters) {
        if (!reducedMotion) {
          f.wobble += 0.008;
          f.x   += f.vx + Math.sin(f.wobble) * 0.08;
          f.y   += f.vy;
          f.rot += f.vr;
          if (f.y < -80)      Object.assign(f, makeFloater(false));
          if (f.x < -160)     f.x = w + 120;
          else if (f.x > w + 160) f.x = -120;
        }

        /* fade near top & bottom so entries/exits are soft */
        let edge = 1;
        if (f.y > h - 140)  edge = Math.max(0, (h + 60 - f.y) / 200);
        else if (f.y < 160) edge = Math.max(0, (f.y + 80) / 240);

        ctx.save();
        ctx.translate(f.x + (pmx - 0.5) * 42 * f.depth,
                      f.y + (pmy - 0.5) * 26 * f.depth);
        ctx.rotate(f.rot);
        const a = baseA * f.depth * edge;
        const col = 'rgba(' + cols[f.hue] + ',' + a.toFixed(3) + ')';
        ctx.fillStyle = col;
        if (dark) {
          ctx.shadowColor = 'rgba(' + cols[f.hue] + ',0.55)';
          ctx.shadowBlur  = 12 * f.depth;
        }
        if (f.kind === 'arch') {
          /* line-sketch architecture diagram */
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.4;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          const s = 0.55 + f.depth * 0.65;
          ctx.scale(s, s);
          ARCHS[f.arch](ctx);
        } else {
          ctx.font = 'italic ' + f.size.toFixed(1) + 'px ' + MATH_FONT;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(f.text, 0, 0);
        }
        ctx.restore();
      }

      if (!reducedMotion) mathId = requestAnimationFrame(drawFrame);
    }

    function startMath() {
      if (running) return;
      running = true;
      resize();
      drawFrame();
    }

    function stopMath() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(mathId);
      mathId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', () => {
      resize();
      if (running && reducedMotion) drawFrame();
    });

    window.addEventListener('pointermove', (e) => {
      pmx = e.clientX / window.innerWidth;
      pmy = e.clientY / window.innerHeight;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (mathId) cancelAnimationFrame(mathId); }
      else if (running)    { mathId = requestAnimationFrame(drawFrame); }
    });

    /* Initialize icon, then start pattern — always active in both themes */
    themeIcon.className = html.getAttribute('data-theme') === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    startMath();

    /* ── NAV SCROLL ── */
    const navbar = document.getElementById('navbar');
    const toTop  = document.getElementById('toTop');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 60);
      toTop.classList.toggle('visible', y > 400);
    });

    /* ── HAMBURGER ── */
    const hamburger     = document.getElementById('hamburger');
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const navLinks      = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburgerIcon.className = open ? 'fas fa-times' : 'fas fa-bars';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburgerIcon.className = 'fas fa-bars';
      });
    });
    /* ── SCROLL REVEAL ── */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /* ── CRICKETER MASCOTS · hand-drawn doodles, injected site-wide ── */
    const MASCOT_BAT = `
      <svg viewBox="0 0 56 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M37 33 L45 55" stroke-width="6.5"/>
        <path d="M34 26 L37 32"/>
        <path d="M24 25 Q23 35 25 41"/>
        <path d="M24 28 Q29 26 34 27"/>
        <path d="M24 33 Q30 31 35 29"/>
        <path d="M25 41 Q21 50 17 57"/>
        <path d="M25 41 Q28 50 30 57"/>
        <path d="M17 57 L12 57"/>
        <path d="M30 57 L35 57"/>
        <circle cx="24" cy="14" r="9" fill="var(--bg)"/>
        <path d="M15.5 11.5 Q24 4.5 32.5 11.5"/>
        <path d="M31 8.5 L37 6.5"/>
        <circle cx="21.5" cy="13.5" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="26.5" cy="13.5" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M21.5 17.5 Q24 19.5 26.5 17.5" stroke-width="1.8"/>
      </svg>`;

    const MASCOT_BOWL = `
      <svg viewBox="0 0 56 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 12 L14 12 M6 18 L12 18" stroke-width="1.6" opacity="0.5"/>
        <path d="M27 27 Q31 18 35 11"/>
        <circle cx="38" cy="8" r="4.5" fill="#d64533" stroke="#8f2417" stroke-width="1.6"/>
        <path d="M27 29 Q20 33 15 31"/>
        <path d="M27 26 Q29 35 28 42"/>
        <path d="M28 42 Q21 47 18 55"/>
        <path d="M28 42 Q33 50 31 58"/>
        <path d="M18 55 L13 56"/>
        <path d="M31 58 L36 58"/>
        <circle cx="24" cy="19" r="8.5" fill="var(--bg)"/>
        <path d="M16.5 16.5 Q24 10 31.5 16.5"/>
        <circle cx="21.5" cy="18.5" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="26.5" cy="18.5" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M21.5 22.5 Q24 24.5 26.5 22.5" stroke-width="1.8"/>
      </svg>`;

    const MASCOT_SCENE = `
      <svg viewBox="0 0 110 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M37 33 L45 55" stroke-width="6.5"/>
        <path d="M34 26 L37 32"/>
        <path d="M24 25 Q23 35 25 41"/>
        <path d="M24 28 Q29 26 34 27"/>
        <path d="M24 33 Q30 31 35 29"/>
        <path d="M25 41 Q21 50 17 57"/>
        <path d="M25 41 Q28 50 30 57"/>
        <path d="M17 57 L12 57"/>
        <path d="M30 57 L35 57"/>
        <circle cx="24" cy="14" r="9" fill="var(--bg)"/>
        <path d="M15.5 11.5 Q24 4.5 32.5 11.5"/>
        <path d="M31 8.5 L37 6.5"/>
        <circle cx="21.5" cy="13.5" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="26.5" cy="13.5" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M21.5 17.5 Q24 19.5 26.5 17.5" stroke-width="1.8"/>
        <path d="M49 46 Q68 22 80 15" stroke-width="1.6" opacity="0.5" stroke-dasharray="3 4"/>
        <circle cx="87" cy="13" r="5" fill="#d64533" stroke="#8f2417" stroke-width="1.6"/>
      </svg>`;

    const MASCOT_CHEER = `
      <svg viewBox="0 0 56 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 8 L13 11 M46 17 L49 14 M12 27 L15 25" stroke-width="1.6" opacity="0.55"/>
        <path d="M40 26 L44 6" stroke-width="6.5"/>
        <path d="M28 30 Q34 28 39 25"/>
        <path d="M28 30 Q22 26 17 20"/>
        <path d="M28 28 L28 44"/>
        <path d="M28 44 Q24 52 21 58"/>
        <path d="M28 44 Q32 52 35 58"/>
        <path d="M21 58 L16 58"/>
        <path d="M35 58 L40 58"/>
        <circle cx="28" cy="17" r="9" fill="var(--bg)"/>
        <path d="M19.5 14.5 Q28 7.5 36.5 14.5"/>
        <path d="M35 11.5 L41 9.5"/>
        <circle cx="25.5" cy="16.5" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="30.5" cy="16.5" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M25.5 20.5 Q28 22.8 30.5 20.5" stroke-width="1.8"/>
      </svg>`;

    const MASCOTS = { bat: MASCOT_BAT, bowl: MASCOT_BOWL, scene: MASCOT_SCENE, cheer: MASCOT_CHEER };

    /* fill any declared slots (e.g. section headings on the home page) */
    document.querySelectorAll('[data-mascot]').forEach(el => {
      el.innerHTML = MASCOTS[el.dataset.mascot] || '';
    });

    /* nav logo — little batsman beside "SG." on every page */
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo && !navLogo.querySelector('svg')) {
      navLogo.insertAdjacentHTML('afterbegin', '<span class="nav-mascot">' + MASCOT_BAT + '</span>');
    }

    /* footer — batsman lofting one over the text */
    const footLogo = document.querySelector('.footer-logo');
    if (footLogo) {
      footLogo.insertAdjacentHTML('beforebegin', '<div class="footer-mascot">' + MASCOT_SCENE + '</div>');
    }
