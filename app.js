const state = {
  data: null,
  activeProjectFilter: 'All'
};

const selectors = {
  profileName: document.querySelector('#profile-name'),
  profileTitle: document.querySelector('#profile-title'),
  profileSummary: document.querySelector('#profile-summary'),
  heroMetrics: document.querySelector('#hero-metrics'),
  dataCanvas: document.querySelector('#data-canvas'),
  quickFacts: document.querySelector('#quick-facts'),
  socialLinks: document.querySelector('#social-links'),
  resumeLink: document.querySelector('#resume-link'),
  footerName: document.querySelector('#footer-name'),
  overview: document.querySelector('#tab-overview'),
  education: document.querySelector('#tab-education'),
  certifications: document.querySelector('#tab-certifications'),
  experience: document.querySelector('#experience-list'),
  skills: document.querySelector('#skills-grid'),
  filters: document.querySelector('#project-filters'),
  projects: document.querySelector('#project-grid'),
  contactForm: document.querySelector('#contact-form'),
  directEmail: document.querySelector('#direct-email'),
  formStatus: document.querySelector('#form-status')
};

const icon = (name) => `<i data-lucide="${name}"></i>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[char]));

async function init() {
  const response = await fetch('data.json');
  state.data = await response.json();
  applyTheme();
  renderProfile();
  renderHeroMetrics();
  renderTabs();
  renderExperience();
  renderSkills();
  renderProjectFilters();
  renderProjects();
  bindEvents();
  initScrollEffects();
  initScrollReveal();
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderProfile() {
  const { profile } = state.data;
  document.title = `${profile.name} | Portfolio`;
  if (selectors.profileName) {
    selectors.profileName.textContent = profile.name;
    selectors.profileName.setAttribute('data-text', profile.name);
  }
  if (selectors.profileTitle) selectors.profileTitle.textContent = profile.title;
  if (selectors.profileSummary) selectors.profileSummary.textContent = profile.summary;
  if (selectors.footerName) selectors.footerName.textContent = profile.name;
  if (selectors.resumeLink) selectors.resumeLink.href = profile.resume;
  if (selectors.directEmail) selectors.directEmail.href = `mailto:${profile.email}`;

  const facts = [
    ['Location', profile.location],
    ['Email', profile.email],
    ['Phone', profile.phone]
  ];

  if (selectors.quickFacts) {
    selectors.quickFacts.innerHTML = facts.map(([label, value]) => `
      <div>
        <dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>
    `).join('');
  }

  if (selectors.socialLinks) {
    selectors.socialLinks.innerHTML = `
      <a class="button secondary" href="${profile.github}" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> GitHub</a>
      <a class="button secondary" href="${profile.linkedin}" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9" rx="1"/><circle cx="4" cy="4" r="2"/></svg> LinkedIn</a>
      <a class="button secondary" href="mailto:${profile.email}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Email</a>
    `;
  }
}

function renderHeroMetrics() {
  if (!selectors.heroMetrics) return;
  const skillCount = state.data.skillGroups.reduce((total, group) => total + group.skills.length, 0);
  const metrics = [
    ['Projects', state.data.projects.length],
    ['Skills', skillCount],
    ['Certifications', state.data.certifications.length],
    ['Current role', state.data.experience[0]?.role || 'Data Science']
  ];

  selectors.heroMetrics.innerHTML = metrics.map(([label, value]) => `
    <div class="metric-card">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join('');
}

function renderTabs() {
  const { profile, education, certifications } = state.data;
  if (selectors.overview) {
    selectors.overview.innerHTML = `
      <div class="info-grid">
        <article class="info-card">
          <h3>Professional Summary</h3>
          <p>${escapeHtml(profile.summary)}</p>
        </article>
        <article class="info-card">
          <h3>Current Focus</h3>
          <p>${escapeHtml(profile.title)} seeking a full-time Data Science, Data Analyst, or Machine Learning Engineer position.</p>
        </article>
      </div>
    `;
  }

  if (selectors.education) {
    selectors.education.innerHTML = `
      <div class="info-grid">
        ${education.map(item => `
          <article class="info-card">
            <h3>${escapeHtml(item.degree)}</h3>
            <p><strong>${escapeHtml(item.institution)}</strong></p>
            <p>${escapeHtml(item.period)}</p>
            ${item.details.map(detail => `<p>${escapeHtml(detail)}</p>`).join('')}
          </article>
        `).join('')}
      </div>
    `;
  }

  if (selectors.certifications) {
    selectors.certifications.innerHTML = `
      <ul class="cert-list">
        ${certifications.map(cert => `
          <li>
            <a class="cert-verify-link" href="${cert.url}" target="_blank" rel="noreferrer">
              <span>${escapeHtml(cert.name)}</span>
              ${icon('external-link')}
            </a>
          </li>
        `).join('')}
      </ul>
    `;
  }
}

function renderExperience() {
  if (!selectors.experience) return;
  selectors.experience.innerHTML = state.data.experience.map(item => `
    <article class="timeline-item">
      <div>
        <h3>${escapeHtml(item.role)} - ${escapeHtml(item.organization)}</h3>
        <p class="muted">${escapeHtml(item.project)}</p>
        <ul>${item.highlights.map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
      </div>
      <span class="period">${escapeHtml(item.period)}</span>
    </article>
  `).join('');
}

function renderSkills() {
  if (!selectors.skills) return;
  selectors.skills.innerHTML = state.data.skillGroups.map(group => `
    <article class="skill-card">
      <h3>${escapeHtml(group.name)}</h3>
      <div class="skill-tags">
        ${group.skills.map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderProjectFilters() {
  if (!selectors.filters) return;
  const categories = new Set(['All']);
  state.data.projects.forEach(project => project.categories.forEach(category => categories.add(category)));
  selectors.filters.innerHTML = [...categories].map(category => `
    <button class="filter-button ${category === state.activeProjectFilter ? 'active' : ''}" type="button" data-filter="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join('');
}

function renderProjects() {
  if (!selectors.projects) return;
  const projects = state.data.projects.filter(project =>
    state.activeProjectFilter === 'All' || project.categories.includes(state.activeProjectFilter)
  );

  selectors.projects.innerHTML = projects.map(project => {
    let widgetHtml = '';
    if (project.name === "Smart-Bridge: AI Chatbot & Analytics Dashboard") {
      widgetHtml = `
        <div class="project-widget" id="translator-widget">
          <h4 class="widget-title"><i data-lucide="message-square"></i> Live Translation Agent</h4>
          <div class="translator-chat-box" id="chat-messages">
            <div class="chat-msg bot-msg">Hi! Choose a phrase to translate:</div>
          </div>
          <div class="translator-input-area">
            <button class="translate-btn" type="button" data-phrase="Hello, how can I help you?">"Hello..."</button>
            <button class="translate-btn" type="button" data-phrase="Data Science is amazing.">"Data Science..."</button>
            <button class="translate-btn" type="button" data-phrase="Let's build a smart model.">"Let's build..."</button>
          </div>
        </div>
      `;
    } else if (project.name === "Gurgaon House Price Prediction") {
      widgetHtml = `
        <div class="project-widget" id="house-estimator">
          <h4 class="widget-title"><i data-lucide="calculator"></i> Live Property Price Estimator</h4>
          <div class="widget-row">
            <label for="est-area">Area (Sq. Ft.): <span id="val-area">1,800</span></label>
            <input type="range" id="est-area" min="500" max="8000" step="100" value="1800">
          </div>
          <div class="widget-row">
            <label for="est-bhk">BHK / Bedrooms: <span id="val-bhk">3</span></label>
            <input type="range" id="est-bhk" min="1" max="6" step="1" value="3">
          </div>
          <div class="widget-row">
            <label for="est-loc">Sector Location Multiplier</label>
            <select id="est-loc">
              <option value="1.0" selected>Standard Sector Area (1.0x)</option>
              <option value="1.35">Premium Golf Course Road (1.35x)</option>
              <option value="1.15">Sector 56 Metro Corridor (1.15x)</option>
              <option value="0.85">Sohna Road / Ext. Outskirts (0.85x)</option>
            </select>
          </div>
          <div class="widget-result">
            <span>Estimated Property Value:</span>
            <span id="est-output">₹ 1.62 Cr</span>
          </div>
        </div>
      `;
    } else if (project.name === "Weather Intelligence & Climate Analytics Platform (WICAP)") {
      widgetHtml = `
        <div class="project-widget" id="wicap-pipeline-widget">
          <h4 class="widget-title"><i data-lucide="database"></i> Data Pipeline Architecture</h4>
          <div class="wicap-pipeline">
            <div class="pipeline-stage">
              <span class="pipeline-icon">☁️</span>
              <span class="pipeline-label">Ingestion</span>
              <div class="pipeline-bar" id="wicap-ingest" style="width: 0%"></div>
            </div>
            <div class="pipeline-arrow">→</div>
            <div class="pipeline-stage">
              <span class="pipeline-icon">🔄</span>
              <span class="pipeline-label">ETL</span>
              <div class="pipeline-bar" id="wicap-etl" style="width: 0%"></div>
            </div>
            <div class="pipeline-arrow">→</div>
            <div class="pipeline-stage">
              <span class="pipeline-icon">🏗️</span>
              <span class="pipeline-label">Warehouse</span>
              <div class="pipeline-bar" id="wicap-warehouse" style="width: 0%"></div>
            </div>
            <div class="pipeline-arrow">→</div>
            <div class="pipeline-stage">
              <span class="pipeline-icon">📊</span>
              <span class="pipeline-label">Dashboard</span>
              <div class="pipeline-bar" id="wicap-dashboard" style="width: 0%"></div>
            </div>
          </div>
          <div class="widget-result">
            <span>Data Quality Score:</span>
            <span id="wicap-quality">Initializing...</span>
          </div>
        </div>
      `;
    }

    return `
      <article class="project-card">
        <div class="project-card-header">
          <span class="project-badge">${escapeHtml(project.type)}</span>
          <span class="project-meta">${escapeHtml(project.period)}</span>
        </div>
        <div class="project-card-content">
          <h3>${escapeHtml(project.name)}</h3>
          ${widgetHtml}
          <ul>${project.description.map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
          <div class="tech-list">
            ${project.technologies.map(tech => `<span class="tag">${escapeHtml(tech)}</span>`).join('')}
          </div>
          ${project.link ? `<a class="button secondary" href="${project.link}" target="_blank" rel="noreferrer">${icon('external-link')} Open Project</a>` : ''}
        </div>
      </article>
    `;
  }).join('');
  refreshIcons();
  bindWidgetListeners();
}

function bindWidgetListeners() {
  // 1. Translator Widget
  const chatMessages = document.getElementById('chat-messages');
  const translateBtns = document.querySelectorAll('.translate-btn');
  
  const translations = {
    "Hello, how can I help you?": { hi: "नमस्ते, मैं आपकी क्या मदद कर सकता हूँ?", es: "Hola, ¿cómo puedo ayudarte?" },
    "Data Science is amazing.": { hi: "डेटा साइंस अद्भुत है।", es: "La ciencia de datos es increíble." },
    "Let's build a smart model.": { hi: "आइए एक स्मार्ट मॉडल बनाएं।", es: "Construyamos un modelo inteligente." }
  };
  
  if (translateBtns.length > 0 && chatMessages) {
    translateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const phrase = btn.getAttribute('data-phrase');
        if (!phrase) return;
        
        chatMessages.innerHTML = `
          <div class="chat-msg bot-msg">Hi! Choose a phrase to translate:</div>
          <div class="chat-msg user-msg">${escapeHtml(phrase)}</div>
          <div class="chat-msg bot-msg typing-msg">AI is translating...</div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        setTimeout(() => {
          const trans = translations[phrase];
          const hiText = trans ? trans.hi : phrase;
          const esText = trans ? trans.es : phrase;
          chatMessages.innerHTML = `
            <div class="chat-msg bot-msg">Hi! Choose a phrase to translate:</div>
            <div class="chat-msg user-msg">${escapeHtml(phrase)}</div>
            <div class="chat-msg bot-msg"><strong>Hindi:</strong> ${escapeHtml(hiText)}</div>
            <div class="chat-msg bot-msg"><strong>Spanish:</strong> ${escapeHtml(esText)}</div>
          `;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 600);
      });
    });
  }

  // 2. Gurgaon Estimator
  const estArea = document.getElementById('est-area');
  const estBhk = document.getElementById('est-bhk');
  const estLoc = document.getElementById('est-loc');
  
  const valArea = document.getElementById('val-area');
  const valBhk = document.getElementById('val-bhk');
  const estOutput = document.getElementById('est-output');
  
  const updateHouseEstimate = () => {
    if (!estArea || !estBhk || !estLoc) return;
    const area = parseInt(estArea.value, 10);
    const bhk = parseInt(estBhk.value, 10);
    const locMultiplier = parseFloat(estLoc.value);
    
    if (valArea) valArea.textContent = Number(area).toLocaleString('en-IN');
    if (valBhk) valBhk.textContent = bhk;
    
    // ₹9,000 / sqft base + ₹2,00,000 per BHK bedroom
    const price = (area * 9000 + bhk * 200000) * locMultiplier;
    
    if (estOutput) {
      if (price >= 10000000) {
        estOutput.textContent = `₹ ${(price / 10000000).toFixed(2)} Cr`;
      } else {
        estOutput.textContent = `₹ ${(price / 100000).toFixed(2)} L`;
      }
    }
  };
  
  if (estArea) {
    estArea.addEventListener('input', updateHouseEstimate);
    estBhk.addEventListener('input', updateHouseEstimate);
    estLoc.addEventListener('change', updateHouseEstimate);
    updateHouseEstimate();
  }
  
  // 3. WICAP Pipeline Animation
  const wicapIngest = document.getElementById('wicap-ingest');
  const wicapEtl = document.getElementById('wicap-etl');
  const wicapWarehouse = document.getElementById('wicap-warehouse');
  const wicapDashboard = document.getElementById('wicap-dashboard');
  const wicapQuality = document.getElementById('wicap-quality');

  if (wicapIngest && wicapEtl && wicapWarehouse && wicapDashboard && wicapQuality) {
    const animatePipeline = () => {
      const stages = [wicapIngest, wicapEtl, wicapWarehouse, wicapDashboard];
      const labels = ['Ingesting...', 'Transforming...', 'Loading...', 'Rendering...'];
      let step = 0;

      const runStep = () => {
        if (step >= stages.length) {
          wicapQuality.textContent = '97.3% — Excellent';
          wicapQuality.style.color = '#10b981';
          return;
        }
        wicapQuality.textContent = labels[step];
        wicapQuality.style.color = '#f59e0b';
        stages[step].style.transition = 'width 0.8s ease';
        stages[step].style.width = '100%';
        stages[step].style.background = 'linear-gradient(90deg, #6366f1, #10b981)';
        step++;
        setTimeout(runStep, 900);
      };

      // Reset
      stages.forEach(s => { s.style.width = '0%'; s.style.transition = 'none'; });
      wicapQuality.textContent = 'Initializing...';
      wicapQuality.style.color = '';
      setTimeout(runStep, 400);
    };

    // Auto-run the animation and repeat every 8 seconds
    animatePipeline();
    setInterval(animatePipeline, 8000);
  }
}

function bindEvents() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      document.querySelector(`#tab-${button.dataset.tab}`).classList.add('active');
    });
  });

  if (selectors.filters) {
    selectors.filters.addEventListener('click', (event) => {
      const button = event.target.closest('.filter-button');
      if (!button) return;
      state.activeProjectFilter = button.dataset.filter;
      renderProjectFilters();
      renderProjects();
    });
  }

  // Create overlay if not present
  let overlay = document.querySelector('.drawer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    document.body.appendChild(overlay);
  }

  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');

  const closeMenu = () => {
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    menuToggle.innerHTML = icon('menu');
    refreshIcons();
  };

  const openMenu = () => {
    navLinks.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    menuToggle.innerHTML = icon('x');
    refreshIcons();
  };

  menuToggle.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  selectors.contactForm.addEventListener('submit', handleContactSubmit);
  initDataCanvas();
}

function applyTheme() {
  document.documentElement.dataset.theme = 'light';
  localStorage.setItem('portfolio-theme', 'light');
}

function handleContactSubmit(event) {
  event.preventDefault();
  const formData = new FormData(selectors.contactForm);
  const message = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    message: formData.get('message').trim(),
    createdAt: new Date().toISOString()
  };

  const stored = JSON.parse(localStorage.getItem('portfolio-messages') || '[]');
  stored.push(message);
  localStorage.setItem('portfolio-messages', JSON.stringify(stored));

  const subject = encodeURIComponent(`Portfolio message from ${message.name}`);
  const body = encodeURIComponent(`${message.message}\n\nFrom: ${message.name} <${message.email}>`);
  window.location.href = `mailto:${state.data.profile.email}?subject=${subject}&body=${body}`;

  selectors.formStatus.textContent = 'Message saved in this browser and opened in your email client.';
  selectors.contactForm.reset();
}

function initScrollEffects() {
  const scrollProgress = document.getElementById('scroll-progress');
  const header = document.querySelector('.site-header');

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }

    if (header) {
      if (scrollTop > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(element => {
    observer.observe(element);
  });
}

init().catch(error => {
  console.error(error);
  document.body.insertAdjacentHTML('afterbegin', '<p class="form-status">Portfolio content could not be loaded.</p>');
});

function initDataCanvas() {
  const canvas = selectors.dataCanvas;
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = Math.floor(bounds.width);
    height = Math.floor(bounds.height);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(72, Math.max(34, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: Math.random() * 1.6 + 0.8
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    const styles = getComputedStyle(document.documentElement);
    context.strokeStyle = styles.getPropertyValue('--canvas-line').trim();
    context.fillStyle = styles.getPropertyValue('--canvas-dot').trim();

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fill();

      for (let i = index + 1; i < particles.length; i += 1) {
        const other = particles[i];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance < 128) {
          context.globalAlpha = 1 - distance / 128;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
          context.globalAlpha = 1;
        }
      }
    });

    animationId = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    resize();
    draw();
  });
}
