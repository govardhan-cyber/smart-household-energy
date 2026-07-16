document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme and Accent Selection Logic
  const htmlRoot = document.documentElement;
  const themeToggle = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const sidebar = document.querySelector('.sidebar');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');

  // Load and apply theme on start
  let currentTheme = localStorage.getItem('theme') || (htmlRoot.classList.contains('dark') ? 'dark' : 'light');
  applyTheme(currentTheme);

  // Load and apply accent on start
  let currentAccent = localStorage.getItem('she-accent') || 'blue';
  applyAccent(currentAccent);

  // Bind theme toggle listener
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      htmlRoot.classList.add('dark');
      if (themeToggle) {
        themeToggle.innerHTML = '<i data-lucide="sun" id="theme-toggle-icon"></i>';
      }
    } else {
      htmlRoot.classList.remove('dark');
      if (themeToggle) {
        themeToggle.innerHTML = '<i data-lucide="moon" id="theme-toggle-icon"></i>';
      }
    }
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
    if (window.lucide) window.lucide.createIcons();
  }

  function applyAccent(accent) {
    // Remove previous accent classes
    htmlRoot.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-teal');
    // Add new accent class
    htmlRoot.classList.add(`accent-${accent}`);
    localStorage.setItem('she-accent', accent);
    window.dispatchEvent(new CustomEvent('she-accent-change', { detail: accent }));
  }

  // Bind accent color picker
  const accentOptions = document.querySelectorAll('.accent-option');
  accentOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const accent = btn.dataset.accent;
      if (accent) {
        applyAccent(accent);
        accentOptions.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Listen to storage events to sync options across open tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      currentTheme = e.newValue;
      applyTheme(currentTheme);
    }
    if (e.key === 'she-accent') {
      currentAccent = e.newValue;
      applyAccent(currentAccent);
      accentOptions.forEach(b => {
        b.classList.toggle('active', b.dataset.accent === currentAccent);
      });
    }
  });

  // 2. Reading Progress Bar
  const progressBar = document.getElementById('reading-progress-bar');
  function updateReadingProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
  }
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);
  updateReadingProgress();

  // 3. Back to Top Button
  const backToTop = document.getElementById('back-to-top');
  function updateBackToTop() {
    if (!backToTop) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  updateBackToTop();

  // 4. Mobile Overlay
  const mobileOverlay = document.getElementById('mobile-overlay');
  function closeMobileMenu() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (mobileOverlay) mobileOverlay.setAttribute('aria-hidden', 'true');
    const icon = mobileToggle ? mobileToggle.querySelector('i') : null;
    if (icon) {
      icon.className = 'lucide-menu';
      if (window.lucide) window.lucide.createIcons();
    }
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // 5. Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input/textarea
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

    if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(currentTheme);
    }

    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // 6. Custom Spotlight Follower & Background Parallax
  const spotlight = document.getElementById('cursor-spotlight');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentSpotlightX = mouseX;
  let currentSpotlightY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth spotlight easing loop
  function easeSpotlight() {
    currentSpotlightX += (mouseX - currentSpotlightX) * 0.12;
    currentSpotlightY += (mouseY - currentSpotlightY) * 0.12;
    if (spotlight) {
      spotlight.style.transform = `translate3d(${currentSpotlightX}px, ${currentSpotlightY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(easeSpotlight);
  }
  easeSpotlight();

  // 3. Floating Sparks Particle Engine (Constellation System)
  const canvas = document.getElementById('luxury-sparks-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    window.addEventListener('resize', () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    });

    const sparks = [];
    const MAX_SPARKS = 22; // Delicate counts

    for (let i = 0; i < MAX_SPARKS; i++) {
      sparks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 0.8 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.6,
        decay: 0.001 + Math.random() * 0.003
      });
    }

    function animateSparks() {
      if (document.hidden) {
        requestAnimationFrame(animateSparks);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      const isDark = htmlRoot.classList.contains('dark');
      const accentRgb = getComputedStyle(htmlRoot).getPropertyValue('--accent-rgb').trim() || '96, 165, 250';

      // Draw delicate connection lines
      ctx.lineWidth = 0.55;
      for (let i = 0; i < sparks.length; i++) {
        const s1 = sparks[i];
        for (let j = i + 1; j < sparks.length; j++) {
          const s2 = sparks[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alphaFactor = (1 - dist / 90) * 0.12;
            const finalAlpha = Math.min(alphaFactor, (s1.alpha + s2.alpha) / 2 * alphaFactor * 2.2);
            ctx.strokeStyle = `rgba(${accentRgb}, ${finalAlpha})`;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;

        // Bounce
        if (s.x < 0 || s.x > W) s.vx *= -1;
        if (s.y < 0 || s.y > H) s.vy *= -1;

        // Repel from cursor spotlight
        const dx = s.x - mouseX;
        const dy = s.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          s.x += (dx / dist) * force * 1.2;
          s.y += (dy / dist) * force * 1.2;
        }

        // Pulse
        s.alpha -= s.decay;
        if (s.alpha <= 0.05) {
          s.x = Math.random() * W;
          s.y = Math.random() * H;
          s.alpha = 0.3 + Math.random() * 0.5;
          s.vx = (Math.random() - 0.5) * 0.35;
          s.vy = (Math.random() - 0.5) * 0.35;
        }

        ctx.beginPath();
        const fillAlpha = isDark ? s.alpha * 0.65 : s.alpha * 0.55;
        ctx.fillStyle = `rgba(${accentRgb}, ${fillAlpha})`;
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Aura Halo
        if (s.alpha > 0.45) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${accentRgb}, ${fillAlpha * 0.15})`;
          ctx.arc(s.x, s.y, s.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(animateSparks);
    }
    animateSparks();
  }

  // 4. Guided Navigation Scroll Monitor
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      const isOpen = sidebar.classList.contains('mobile-open');
      if (mobileOverlay) {
        mobileOverlay.classList.toggle('active', isOpen);
        mobileOverlay.setAttribute('aria-hidden', String(!isOpen));
      }
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'lucide-x' : 'lucide-menu';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.className = 'lucide-menu';
          window.lucide.createIcons();
        }
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        let activeIndex = 0;
        navItems.forEach((item, idx) => {
          const link = item.querySelector('.nav-link');
          if (link && link.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
            link.setAttribute('aria-current', 'page');
            activeIndex = idx;
          } else {
            item.classList.remove('active');
            if (link) link.removeAttribute('aria-current');
          }
        });
        // Update progress bar
        const progressBar = document.getElementById('sidebar-progress-bar');
        if (progressBar && navItems.length > 0) {
          const pct = Math.round(((activeIndex + 1) / navItems.length) * 100);
          progressBar.style.width = `${pct}%`;
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  const revealElements = document.querySelectorAll('.reveal');
  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  revealElements.forEach(el => revealObserver.observe(el));



  // 6. Live energy simulator
  const appliances = {
    led: { watt: 9, hours: 6, qty: 10 },
    tube: { watt: 40, hours: 6, qty: 3 },
    fan: { watt: 75, hours: 12, qty: 4 },
    ac: { watt: 1500, hours: 5, qty: 1 }
  };

  const inputs = {
    ledHours: document.getElementById('led-hours'),
    tubeHours: document.getElementById('tube-hours'),
    fanHours: document.getElementById('fan-hours'),
    acHours: document.getElementById('ac-hours'),
    solarPower: document.getElementById('solar-kw')
  };

  const values = {
    ledHoursVal: document.getElementById('led-hours-val'),
    tubeHoursVal: document.getElementById('tube-hours-val'),
    fanHoursVal: document.getElementById('fan-hours-val'),
    acHoursVal: document.getElementById('ac-hours-val'),
    solarPowerVal: document.getElementById('solar-kw-val')
  };

  const switches = {
    upgradeTube: document.getElementById('upgrade-tube'),
    upgradeFan: document.getElementById('upgrade-fan'),
    upgradeAc: document.getElementById('upgrade-ac')
  };

  const outMonthlyKwh = document.getElementById('out-monthly-kwh');
  const outMonthlyBill = document.getElementById('out-monthly-bill');
  const outSavedKwh = document.getElementById('out-saved-kwh');
  const outSavingsBill = document.getElementById('out-savings-bill');
  const outEfficiency = document.getElementById('out-efficiency');
  const outSolarRoi = document.getElementById('out-solar-roi');
  
  const ringActive = document.querySelector('.svg-ring-active');
  const roiBarFill = document.querySelector('.roi-bar-fill');

  function calculateDashboard() {
    if (!inputs.ledHours) return;

    appliances.led.hours = parseFloat(inputs.ledHours.value);
    appliances.tube.hours = parseFloat(inputs.tubeHours.value);
    appliances.fan.hours = parseFloat(inputs.fanHours.value);
    appliances.ac.hours = parseFloat(inputs.acHours.value);
    const solarKw = parseFloat(inputs.solarPower.value);

    values.ledHoursVal.textContent = appliances.led.hours + 'h';
    values.tubeHoursVal.textContent = appliances.tube.hours + 'h';
    values.fanHoursVal.textContent = appliances.fan.hours + 'h';
    values.acHoursVal.textContent = appliances.ac.hours + 'h';
    values.solarPowerVal.textContent = solarKw + ' kW';

    let dailyWattHours = 0;
    let upgradeSavingsWatts = 0;

    dailyWattHours += appliances.led.watt * appliances.led.hours * appliances.led.qty;
    
    const tubeWatt = switches.upgradeTube.classList.contains('active') ? 18 : appliances.tube.watt;
    dailyWattHours += tubeWatt * appliances.tube.hours * appliances.tube.qty;
    if (switches.upgradeTube.classList.contains('active')) {
      upgradeSavingsWatts += (appliances.tube.watt - 18) * appliances.tube.hours * appliances.tube.qty;
    }

    const fanWatt = switches.upgradeFan.classList.contains('active') ? 28 : appliances.fan.watt;
    dailyWattHours += fanWatt * appliances.fan.hours * appliances.fan.qty;
    if (switches.upgradeFan.classList.contains('active')) {
      upgradeSavingsWatts += (appliances.fan.watt - 28) * appliances.fan.hours * appliances.fan.qty;
    }

    const acWatt = switches.upgradeAc.classList.contains('active') ? 1100 : appliances.ac.watt;
    dailyWattHours += acWatt * appliances.ac.hours * appliances.ac.qty;
    if (switches.upgradeAc.classList.contains('active')) {
      upgradeSavingsWatts += (appliances.ac.watt - 1100) * appliances.ac.hours * appliances.ac.qty;
    }

    // Fridge base
    dailyWattHours += 220 * 24 * 1; 

    const dailyKwh = dailyWattHours / 1000;
    const monthlyKwh = Math.round(dailyKwh * 30);
    
    function computeBill(units) {
      let cost = 0;
      if (units <= 50) {
        cost = units * 2.60;
      } else if (units <= 100) {
        cost = (50 * 2.60) + (units - 50) * 3.60;
      } else if (units <= 200) {
        cost = (50 * 2.60) + (50 * 3.60) + (units - 100) * 6.90;
      } else if (units <= 300) {
        cost = (50 * 2.60) + (50 * 3.60) + (100 * 6.90) + (units - 200) * 7.75;
      } else {
        cost = (50 * 2.60) + (50 * 3.60) + (100 * 6.90) + (100 * 7.75) + (units - 300) * 9.50;
      }
      return Math.round(cost * 1.12); // AP LT-I adjustments
    }

    const currentBill = computeBill(monthlyKwh);
    const monthlySavedKwh = Math.round((upgradeSavingsWatts / 1000) * 30);
    const standardBillWithoutUpgrade = computeBill(monthlyKwh + monthlySavedKwh);
    const savedAmount = Math.max(0, standardBillWithoutUpgrade - currentBill);

    let efficiencyScore = 55;
    if (switches.upgradeTube.classList.contains('active')) efficiencyScore += 12;
    if (switches.upgradeFan.classList.contains('active')) efficiencyScore += 15;
    if (switches.upgradeAc.classList.contains('active')) efficiencyScore += 18;
    efficiencyScore = Math.min(100, efficiencyScore);

    // Solar payback modeling
    const solarGenerationDaily = solarKw * 4.2; 
    const solarGenMonthly = solarGenerationDaily * 30;
    const netBilledUnits = Math.max(0, monthlyKwh - solarGenMonthly);
    const solarBill = computeBill(netBilledUnits);
    const solarSavingsMonthly = Math.max(0, currentBill - solarBill);
    const totalSolarCost = solarKw * 62000; // Average subsidy offsets upfront
    
    let paybackYears = 0;
    if (solarSavingsMonthly > 0) {
      const annualSolarSavings = solarSavingsMonthly * 12;
      paybackYears = parseFloat((totalSolarCost / annualSolarSavings).toFixed(1));
    }
    
    function flashValue(el, val) {
      if (!el) return;
      el.textContent = val;
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 300);
    }

    flashValue(outMonthlyKwh, monthlyKwh + ' kWh');
    flashValue(outMonthlyBill, '₹' + currentBill.toLocaleString());
    flashValue(outSavedKwh, monthlySavedKwh + ' kWh');
    flashValue(outSavingsBill, '₹' + savedAmount.toLocaleString());
    flashValue(outEfficiency, efficiencyScore + '%');
    
    if (solarKw === 0) {
      outSolarRoi.textContent = 'N/A';
      if (roiBarFill) roiBarFill.style.width = '0%';
    } else {
      outSolarRoi.textContent = paybackYears + ' Years';
      if (roiBarFill) {
        const percentage = Math.max(10, Math.min(100, (10 - paybackYears) * 10));
        roiBarFill.style.width = percentage + '%';
      }
    }

    if (ringActive) {
      const circumference = 377;
      const strokeDashoffset = circumference - (efficiencyScore / 100) * circumference;
      ringActive.style.strokeDashoffset = strokeDashoffset;
    }
  }

  function updateRangeProgress(input) {
    if (!input) return;
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value) || 0;
    const percentage = max > min ? ((val - min) / (max - min)) * 100 : 0;
    input.style.setProperty('--value', percentage + '%');
  }

  // Bind simulator inputs
  Object.keys(inputs).forEach(key => {
    if (inputs[key]) {
      inputs[key].addEventListener('input', () => {
        updateRangeProgress(inputs[key]);
        calculateDashboard();
      });
      updateRangeProgress(inputs[key]);
    }
  });

  Object.keys(switches).forEach(key => {
    if (switches[key]) {
      switches[key].addEventListener('click', () => {
        switches[key].classList.toggle('active');
        calculateDashboard();
      });
    }
  });

  // Calculate default values
  calculateDashboard();

  // Mouse coordinate tracker for cards spotlights
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
