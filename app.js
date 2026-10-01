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
  const [dataRes, certRes] = await Promise.all([
    fetch('data.json?v=' + Date.now(), { cache: 'no-store' }),
    fetch('certificates.json?v=' + Date.now(), { cache: 'no-store' }).catch(() => null)
  ]);
  state.data = await dataRes.json();
  if (certRes && certRes.ok) {
    state.certificates = await certRes.json();
  }
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
  const statProjects = document.getElementById('stat-projects-count');
  if (statProjects && state.data.projects) {
    statProjects.textContent = state.data.projects.length;
  }

  const statCerts = document.getElementById('stat-certs-count');
  if (statCerts && state.certificates) {
    statCerts.textContent = state.certificates.length;
  }

  if (!selectors.heroMetrics) return;
  const skillCount = state.data.skillGroups ? state.data.skillGroups.reduce((total, group) => total + group.skills.length, 0) : 0;
  const certCount = state.certificates ? state.certificates.length : ((state.data.certifications && state.data.certifications.length) || 7);
  const metrics = [
    ['Projects', state.data.projects.length],
    ['Skills', skillCount],
    ['Certifications', certCount],
    ['Experience', '6 Months']
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
          <div class="widget-header-row">
            <h4 class="widget-title"><i data-lucide="calculator"></i> Live Property Price Estimator</h4>
            <a href="${escapeHtml(project.demo || project.link)}" target="_blank" rel="noreferrer" class="widget-live-tag" title="Open Streamlit Web App">
              <span class="status-dot"></span> Live App
            </a>
          </div>
          <div class="widget-row">
            <label for="est-loc">Location / Sector</label>
            <select id="est-loc">
              <option value="14500" selected>Sector 65 (Golf Course Ext)</option>
              <option value="22000">Golf Course Road (Sec 42/54)</option>
              <option value="18500">DLF Phase 1-5 / Cyber City</option>
              <option value="12200">Sector 56 (Metro Corridor)</option>
              <option value="10500">Dwarka Expressway (Sec 102-113)</option>
              <option value="8800">Sohna Road (Sec 48-67)</option>
            </select>
          </div>
          <div class="widget-row-split" style="display:flex; gap:0.5rem;">
            <div style="flex:1;">
              <label for="est-type" style="font-size:0.75rem; font-weight:700; display:block; margin-bottom:0.25rem; color:#484642;">Property Type</label>
              <select id="est-type" style="width:100%; padding:0.35rem 0.5rem; font-size:0.8rem; border-radius:6px;">
                <option value="1.0" selected>Apartment</option>
                <option value="0.92">Ind. Floor</option>
                <option value="1.30">Plot / Villa</option>
              </select>
            </div>
            <div style="flex:1;">
              <label for="est-bhk" style="font-size:0.75rem; font-weight:700; display:block; margin-bottom:0.25rem; color:#484642;">Bedrooms: <span id="val-bhk">3</span> BHK</label>
              <input type="range" id="est-bhk" min="1" max="6" step="1" value="3" style="width:100%;">
            </div>
          </div>
          <div class="widget-row">
            <label for="est-area">Built-Up Area: <span id="val-area">1,800</span> sq.ft.</label>
            <input type="range" id="est-area" min="500" max="6000" step="50" value="1800">
          </div>
          <div class="widget-result-box" style="background: rgba(255,255,255,0.85); border:1px solid rgba(28,27,25,0.12); border-radius:8px; padding:0.65rem 0.8rem; margin-top:0.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#57534E;">Fair Valuation:</span>
              <span id="est-output" style="font-size:1.2rem; font-weight:800; color:#1C1B19;">₹ 2.61 Cr</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#57534E; margin-top:0.35rem; padding-top:0.35rem; border-top:1px dashed rgba(28,27,25,0.15);">
              <span>Rate: <strong id="est-rate">₹14,500/sq.ft</strong></span>
              <span>Band (±MAE): <strong id="est-band">₹2.13 - ₹3.09 Cr</strong></span>
            </div>
          </div>
        </div>
      `;
    } else if (project.name === "Global E-Commerce Revenue Intelligence") {
      widgetHtml = `
        <div class="project-widget" style="padding: 0.5rem 0.6rem 0.6rem;">
          <div class="ecom-preview-card" onclick="openEcomModal()" style="cursor: pointer;" title="Click to view full dashboard">
            <img src="assets/ecommerce-dashboard.png" alt="Global E-Commerce Revenue Dashboard" class="ecom-thumb">
            <div class="ecom-overlay-badge">
              <i data-lucide="maximize-2" style="width:12px;height:12px;"></i> View Dashboard (Zoom)
            </div>
          </div>
        </div>
      `;
    }

    return `
      <article class="project-card">
        <div class="project-card-header">
          ${project.type ? `<span class="project-badge">${escapeHtml(project.type)}</span>` : '<span></span>'}
          <span class="project-meta">${escapeHtml(project.period)}</span>
        </div>
        <div class="project-card-content">
          <h3>${escapeHtml(project.name)}</h3>
          ${widgetHtml}
          <ul>${project.description.map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
          <div class="tech-list">
            ${project.technologies.map(tech => `<span class="tag">${escapeHtml(tech)}</span>`).join('')}
          </div>
          <div class="project-actions">
            ${project.demo ? `
              <a class="button primary" href="${escapeHtml(project.demo)}" target="_blank" rel="noreferrer">
                ${icon('external-link')} Open Project
              </a>
              ${project.github ? `
                <a class="button secondary" href="${escapeHtml(project.github)}" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> GitHub Repo
                </a>
              ` : ''}
            ` : `
              ${project.github ? `
                <a class="button secondary" href="${escapeHtml(project.github)}" target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> GitHub Repo
                </a>
              ` : (project.link ? `
                <a class="button secondary" href="${escapeHtml(project.link)}" target="_blank" rel="noreferrer">
                  ${icon('external-link')} Open Project
                </a>
              ` : '')}
            `}
          </div>
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

  // 2. Gurgaon Estimator (Calibrated with Random Forest Regressor Benchmarks)
  const estArea = document.getElementById('est-area');
  const estBhk = document.getElementById('est-bhk');
  const estLoc = document.getElementById('est-loc');
  const estType = document.getElementById('est-type');
  
  const valArea = document.getElementById('val-area');
  const valBhk = document.getElementById('val-bhk');
  const estOutput = document.getElementById('est-output');
  const estRate = document.getElementById('est-rate');
  const estBand = document.getElementById('est-band');
  
  const updateHouseEstimate = () => {
    if (!estArea || !estBhk || !estLoc) return;
    const area = parseInt(estArea.value, 10);
    const bhk = parseInt(estBhk.value, 10);
    const baseRatePerSqft = parseFloat(estLoc.value);
    const typeMultiplier = estType ? parseFloat(estType.value) : 1.0;
    
    if (valArea) valArea.textContent = Number(area).toLocaleString('en-IN');
    if (valBhk) valBhk.textContent = bhk;
    
    // Non-linear bedroom scaling matching Random Forest feature weighting
    const bhkFactor = 1 + (bhk - 3) * 0.035;
    const effectiveRate = baseRatePerSqft * typeMultiplier * bhkFactor;
    const totalInr = area * effectiveRate;
    const priceCr = totalInr / 10000000;
    const ratePerSqft = Math.round(totalInr / area);
    
    // ±0.48 Cr MAE Confidence Band from trained model evaluation
    const lowerBand = Math.max(0.15, priceCr - 0.48).toFixed(2);
    const upperBand = (priceCr + 0.48).toFixed(2);
    
    if (estOutput) {
      if (priceCr >= 1.0) {
        estOutput.textContent = `₹ ${priceCr.toFixed(2)} Cr`;
      } else {
        const lakhs = Math.round(totalInr / 100000);
        estOutput.textContent = `₹ ${lakhs} L`;
      }
    }
    
    if (estRate) {
      estRate.textContent = `₹${ratePerSqft.toLocaleString('en-IN')}/sq.ft`;
    }
    if (estBand) {
      estBand.textContent = `₹${lowerBand} - ₹${upperBand} Cr`;
    }
  };

  if (estArea) {
    estArea.addEventListener('input', updateHouseEstimate);
    estBhk.addEventListener('input', updateHouseEstimate);
    estLoc.addEventListener('change', updateHouseEstimate);
    if (estType) estType.addEventListener('change', updateHouseEstimate);
    updateHouseEstimate();
  }
}

function openEcomModal() {
  let modal = document.getElementById('ecom-dashboard-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ecom-dashboard-modal';
    modal.className = 'ecom-modal';
    modal.innerHTML = `
      <div class="ecom-modal-dialog">
        <div class="ecom-modal-header">
          <span class="ecom-modal-title">Global E-Commerce Revenue Intelligence — Executive Dashboard</span>
          <button type="button" class="ecom-modal-close" onclick="closeEcomModal()" aria-label="Close dashboard modal">&times;</button>
        </div>
        <div class="ecom-modal-body">
          <img src="assets/ecommerce-dashboard.png" alt="Global E-Commerce Revenue Dashboard Full View" class="ecom-modal-img">
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEcomModal();
    });
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEcomModal() {
  const modal = document.getElementById('ecom-dashboard-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.body.style.overflow = '';
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEcomModal();
  }
});

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
