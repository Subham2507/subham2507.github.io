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

    /* ── MATH PATTERN · De Jong Strange Attractor — 4-fold symmetry, dual theme ── */
    const canvas = document.getElementById('bubbleCanvas');
    const ctx    = canvas.getContext('2d');
    let mathId   = null;
    let running  = false;

    let mx = 0.1, my = 0.1, ma, mb, mc, md, mTimer = 0;

    const BATCH = 1500;
    const CYCLE = 400;
    /* 4-fold mirror: each iteration adds 4 points × 2 coords = 8 entries per bucket.
       With i%2 split: max per buffer = BATCH/2 × 8 = BATCH×4 entries.            */
    const PTS1  = new Float32Array(BATCH * 4);
    const PTS2  = new Float32Array(BATCH * 4);
    const PTS3  = new Float32Array(BATCH * 4); /* dark-mode third colour (magenta) */

    function newAttractor() {
      const v = () => (1.2 + Math.random() * 1.6) * (Math.random() < 0.5 ? 1 : -1);
      ma = v(); mb = v(); mc = v(); md = v();
      mx = 0.1; my = 0.1;
      for (let i = 0; i < 1000; i++) { /* burn transient, land on the attractor */
        const nx = Math.sin(ma * my) - Math.cos(mb * mx);
        const ny = Math.sin(mc * mx) - Math.cos(md * my);
        mx = nx; my = ny;
      }
      mTimer = 0;
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawFrame() {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const scaleX = w * 0.40;   /* spread across full width */
      const scaleY = h * 0.36;   /* proportional height      */
      const dark   = html.getAttribute('data-theme') === 'dark';

      /* per-frame fade — keep density low so text stays readable */
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.018)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      /* iterate attractor; reflect each point across both axes (4-fold symmetry) */
      let c1 = 0, c2 = 0, c3 = 0;
      const mod = 2;

      for (let i = 0; i < BATCH; i++) {
        const nx = Math.sin(ma * my) - Math.cos(mb * mx);
        const ny = Math.sin(mc * mx) - Math.cos(md * my);
        mx = nx; my = ny;

        const dx = mx * scaleX, dy = my * scaleY;
        if (Math.abs(dx) >= cx - 2 || Math.abs(dy) >= cy - 2) continue;

        /* four symmetric reflections around canvas centre */
        const x1 = cx + dx, y1 = cy + dy;
        const x2 = cx - dx, y2 = cy + dy;
        const x3 = cx + dx, y3 = cy - dy;
        const x4 = cx - dx, y4 = cy - dy;

        const p = i % mod;
        if (p === 0) {
          PTS1[c1]=x1; PTS1[c1+1]=y1; PTS1[c1+2]=x2; PTS1[c1+3]=y2;
          PTS1[c1+4]=x3; PTS1[c1+5]=y3; PTS1[c1+6]=x4; PTS1[c1+7]=y4; c1+=8;
        } else if (p === 1) {
          PTS2[c2]=x1; PTS2[c2+1]=y1; PTS2[c2+2]=x2; PTS2[c2+3]=y2;
          PTS2[c2+4]=x3; PTS2[c2+5]=y3; PTS2[c2+6]=x4; PTS2[c2+7]=y4; c2+=8;
        } else {
          PTS3[c3]=x1; PTS3[c3+1]=y1; PTS3[c3+2]=x2; PTS3[c3+3]=y2;
          PTS3[c3+4]=x3; PTS3[c3+5]=y3; PTS3[c3+6]=x4; PTS3[c3+7]=y4; c3+=8;
        }
      }

      if (dark) {
        /* ── dark: subtle, won't overpower text ── */
        ctx.fillStyle = 'rgba(139,92,246,0.32)';
        ctx.beginPath();
        for (let i = 0; i < c1; i += 2) ctx.rect(PTS1[i], PTS1[i+1], 1.5, 1.5);
        ctx.fill();

        ctx.fillStyle = 'rgba(6,182,212,0.26)';
        ctx.beginPath();
        for (let i = 0; i < c2; i += 2) ctx.rect(PTS2[i], PTS2[i+1], 1.5, 1.5);
        ctx.fill();

      } else {
        /* ── light: soft, won't overpower text ── */
        ctx.fillStyle = 'rgba(124,58,237,0.18)';
        ctx.beginPath();
        for (let i = 0; i < c1; i += 2) ctx.rect(PTS1[i], PTS1[i+1], 1.5, 1.5);
        ctx.fill();

        ctx.fillStyle = 'rgba(2,132,199,0.14)';
        ctx.beginPath();
        for (let i = 0; i < c2; i += 2) ctx.rect(PTS2[i], PTS2[i+1], 1.5, 1.5);
        ctx.fill();
      }

      if (++mTimer >= CYCLE) newAttractor(); /* smooth crossfade: old fades, new builds */
      mathId = requestAnimationFrame(drawFrame);
    }

    function startMath() {
      if (running) return;
      running = true;
      resize();
      newAttractor();
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
      if (running) ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

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
