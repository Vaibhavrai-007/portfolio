/**
 * Certifications Page Controller
 * Handles data fetching, instant multi-field search, category filtering,
 * grouping by year, responsive mobile drawer navigation, and accessible UI states.
 */

const state = {
  allCertificates: [],
  filteredCertificates: [],
  activeCategory: 'All',
  searchQuery: ''
};

const dom = {
  container: document.getElementById('cert-container'),
  filterPills: document.getElementById('cert-filter-pills'),
  searchInput: document.getElementById('cert-search-input'),
  countBadge: document.getElementById('cert-count-badge'),
  emptyState: document.getElementById('cert-empty'),
  errorState: document.getElementById('cert-error'),
  errorMsg: document.getElementById('cert-error-msg'),
  resetFilterBtn: document.getElementById('reset-filter-btn'),
  retryFetchBtn: document.getElementById('retry-fetch-btn'),
  scrollProgress: document.getElementById('scroll-progress'),
  siteHeader: document.querySelector('.site-header'),
  menuToggle: document.querySelector('.menu-toggle'),
  navLinks: document.querySelector('.nav-links')
};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[char]));

const refreshIcons = () => {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
};

/**
 * Initialize theme based on user's previous preference or system default
 */
function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.dataset.theme = 'dark';
  } else {
    document.documentElement.dataset.theme = 'light';
  }
}

/**
 * Fetch certificates data from relative certificates.json
 */
async function loadCertificates() {
  if (dom.errorState) dom.errorState.style.display = 'none';
  if (dom.emptyState) dom.emptyState.style.display = 'none';
  if (dom.countBadge) dom.countBadge.textContent = 'Loading certificates...';

  try {
    const response = await fetch('./certificates.json?v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Certificates data format is invalid (expected JSON array).');
    }
    state.allCertificates = data;
    renderCategories();
    applyFilterAndSearch();
  } catch (error) {
    console.error('Failed to load certificates:', error);
    if (dom.container) dom.container.innerHTML = '';
    if (dom.countBadge) dom.countBadge.textContent = 'Unable to load certificates';
    if (dom.errorState) {
      dom.errorState.style.display = 'flex';
      if (dom.errorMsg) {
        dom.errorMsg.textContent = window.location.protocol === 'file:' 
          ? 'Browser security blocks direct file:// fetch. Please serve this directory with a local web server (e.g. python -m http.server 8000).'
          : 'Could not fetch certificates.json. Please check that the file exists and try again.';
      }
    }
    refreshIcons();
  }
}

/**
 * Render category filter buttons dynamically
 */
function renderCategories() {
  if (!dom.filterPills) return;

  const categories = ['All'];
  state.allCertificates.forEach(cert => {
    if (cert.category && !categories.includes(cert.category)) {
      categories.push(cert.category);
    }
  });

  dom.filterPills.innerHTML = categories.map(category => `
    <button 
      type="button" 
      class="cert-pill ${category === state.activeCategory ? 'active' : ''}" 
      data-category="${escapeHtml(category)}"
      aria-pressed="${category === state.activeCategory ? 'true' : 'false'}"
    >
      ${escapeHtml(category)}
    </button>
  `).join('');

  dom.filterPills.querySelectorAll('.cert-pill').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.category;
      if (state.activeCategory === selected) return;
      state.activeCategory = selected;
      
      dom.filterPills.querySelectorAll('.cert-pill').forEach(btn => {
        const isActive = btn.dataset.category === selected;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      applyFilterAndSearch();
    });
  });
}

/**
 * Filter certificates by search term and active category
 */
function applyFilterAndSearch() {
  const query = state.searchQuery.trim().toLowerCase();
  
  state.filteredCertificates = state.allCertificates.filter(cert => {
    const matchesCategory = state.activeCategory === 'All' || cert.category === state.activeCategory;
    
    if (!matchesCategory) return false;
    if (!query) return true;

    const nameMatch = cert.name && cert.name.toLowerCase().includes(query);
    const issuerMatch = cert.issuer && cert.issuer.toLowerCase().includes(query);
    const credIdMatch = cert.credentialId && cert.credentialId.toLowerCase().includes(query);
    const skillsMatch = Array.isArray(cert.skills) && cert.skills.some(skill => skill.toLowerCase().includes(query));
    const yearMatch = cert.year && String(cert.year).includes(query);

    return nameMatch || issuerMatch || credIdMatch || skillsMatch || yearMatch;
  });

  renderCertificates();
}

/**
 * Render grouped certificates cards into the DOM
 */
function renderCertificates() {
  const total = state.allCertificates.length;
  const count = state.filteredCertificates.length;

  if (dom.countBadge) {
    dom.countBadge.textContent = `Showing ${count} of ${total} certificate${total === 1 ? '' : 's'}`;
  }

  if (count === 0) {
    if (dom.container) dom.container.innerHTML = '';
    if (dom.emptyState) dom.emptyState.style.display = 'flex';
    refreshIcons();
    return;
  }

  if (dom.emptyState) dom.emptyState.style.display = 'none';

  // Group into 2 primary domains requested by user: Data & Business Analytics and HR Analytics
  const sectionOrder = ['Data & Business Analytics', 'HR Analytics'];
  const groupedBySection = {
    'Data & Business Analytics': [],
    'HR Analytics': []
  };

  state.filteredCertificates.forEach(cert => {
    const sec = cert.section || (cert.category === 'HR Analytics' ? 'HR Analytics' : 'Data & Business Analytics');
    if (!groupedBySection[sec]) {
      groupedBySection[sec] = [];
    }
    groupedBySection[sec].push(cert);
  });

  let html = '';

  sectionOrder.forEach(sectionName => {
    const certsInSection = groupedBySection[sectionName] || [];
    if (certsInSection.length === 0) return;

    const sectionId = sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const subtitle = sectionName === 'Data & Business Analytics'
      ? 'Comprehensive credentials in Data Analysis, Python, Visualization, Data Science & Business Strategy'
      : 'Human Resources Foundations, CIPD & SHRM aligned Organizational Analytics';

    html += `
      <section class="cert-year-group cert-domain-group" aria-labelledby="sec-heading-${escapeHtml(sectionId)}">
        <div class="cert-year-header" style="justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 id="sec-heading-${escapeHtml(sectionId)}" class="cert-year-heading" style="font-size: 1.85rem;">
              ${escapeHtml(sectionName)}
            </h2>
            <p style="margin: 0.35rem 0 0; font-size: 0.88rem; color: var(--muted);">${escapeHtml(subtitle)}</p>
          </div>
          <span class="cert-year-badge">${certsInSection.length} credential${certsInSection.length === 1 ? '' : 's'}</span>
        </div>
        <div class="cert-grid">
          ${certsInSection.map(cert => renderCardHtml(cert)).join('')}
        </div>
      </section>
    `;
  });

  if (dom.container) {
    dom.container.innerHTML = html;
  }

  refreshIcons();
}

/**
 * Generate HTML string for an individual certificate card
 */
function renderCardHtml(cert) {
  const skillsHtml = Array.isArray(cert.skills) && cert.skills.length > 0
    ? `<div class="cert-skills-list" aria-label="Key skills">
        ${cert.skills.map(skill => `<span class="cert-skill-tag">${escapeHtml(skill)}</span>`).join('')}
       </div>`
    : '';

  const credentialIdHtml = cert.credentialId
    ? `<div class="cert-cred-row">
        <span class="cert-cred-label">Credential ID:</span>
        <code class="cert-cred-id" title="Credential ID">${escapeHtml(cert.credentialId)}</code>
       </div>`
    : '';

  return `
    <article class="cert-card" data-category="${escapeHtml(cert.category || '')}">
      <!-- 1. Direct Certificate Photo Frame -->
      <div class="cert-frame-wrap" 
           ${cert.image ? `onclick="openCertLightbox('${escapeHtml(cert.image)}', '${escapeHtml(cert.name)}', '${escapeHtml(cert.issuer || '')}', '${escapeHtml(cert.credentialId || '')}', '${escapeHtml(cert.pdfUrl || '')}')"` : ''}
           title="${cert.image ? 'Click to view full certificate' : 'Certificate Image'}">
        ${cert.image ? `
          <img src="${escapeHtml(cert.image)}" alt="${escapeHtml(cert.name)}" class="cert-img" loading="lazy">
          <div class="cert-overlay">
            <span class="cert-expand-pill">
              <i data-lucide="maximize-2" style="width:12px;height:12px;"></i> Click to Enlarge
            </span>
          </div>
        ` : `
          <div class="cert-placeholder-wrap">
            <i data-lucide="award"></i>
            <span style="font-size:0.85rem; font-weight:700;">Verified Credential</span>
          </div>
        `}
      </div>

      <!-- 2. Details Underneath Certificate -->
      <div class="cert-card-body">
        <div class="cert-card-top">
          <span class="cert-issuer-badge">
            <i data-lucide="award" class="icon-inline"></i>
            ${escapeHtml(cert.issuer || 'Verified')}
          </span>
          ${cert.grade ? `
            <span class="cert-grade-badge">
              <i data-lucide="check-circle" style="width:12px;height:12px;"></i> ${escapeHtml(cert.grade)}
            </span>
          ` : ''}
          <span class="cert-date-text">
            <i data-lucide="calendar" class="icon-inline"></i>
            ${escapeHtml(cert.issueDate || '')}
          </span>
        </div>

        <h3 class="cert-name">${escapeHtml(cert.name)}</h3>

        ${credentialIdHtml}
        ${skillsHtml}
      </div>
    </article>
  `;
}

/**
 * Open high-resolution certificate lightbox modal
 */
function openCertLightbox(imgUrl, name, issuer, credId, pdfUrl) {
  let modal = document.getElementById('cert-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cert-lightbox-modal';
    modal.className = 'cert-lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="cert-lightbox-dialog">
      <div class="cert-lightbox-header">
        <div class="cert-lightbox-title-area">
          <h3 class="cert-lightbox-title">${escapeHtml(name)}</h3>
          <div class="cert-lightbox-meta">
            <span><i data-lucide="award" style="width:13px;height:13px;display:inline-block;vertical-align:middle;"></i> ${escapeHtml(issuer || '')}</span>
            ${credId ? `<span>• ID: <code>${escapeHtml(credId)}</code></span>` : ''}
          </div>
        </div>
        <div class="cert-lightbox-actions">
          ${pdfUrl ? `
            <a class="button secondary" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer" style="font-size:0.8rem; padding:0.4rem 0.8rem;">
              <i data-lucide="file-text" style="width:14px;height:14px;"></i> Original PDF
            </a>
          ` : ''}
          <button type="button" class="cert-lightbox-close" id="cert-lightbox-close" aria-label="Close modal">&times;</button>
        </div>
      </div>
      <div class="cert-lightbox-body">
        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(name)}" class="cert-lightbox-img">
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  refreshIcons();

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modal.onclick = (e) => {
    if (e.target === modal || e.target.id === 'cert-lightbox-close') {
      closeModal();
    }
  };

  document.onkeydown = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  };
}

window.openCertLightbox = openCertLightbox;

/**
 * Setup mobile drawer navigation, header scroll effects, and event listeners
 */
function initNavigation() {
  // Mobile drawer overlay
  let overlay = document.querySelector('.drawer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    document.body.appendChild(overlay);
  }

  const closeMenu = () => {
    if (dom.navLinks) dom.navLinks.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (dom.menuToggle) {
      dom.menuToggle.innerHTML = '<i data-lucide="menu"></i>';
      refreshIcons();
    }
  };

  const openMenu = () => {
    if (dom.navLinks) dom.navLinks.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (dom.menuToggle) {
      dom.menuToggle.innerHTML = '<i data-lucide="x"></i>';
      refreshIcons();
    }
  };

  if (dom.menuToggle) {
    dom.menuToggle.addEventListener('click', () => {
      if (dom.navLinks && dom.navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  overlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Header scroll progress & background blur
  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (dom.scrollProgress) {
      dom.scrollProgress.style.width = scrollPercent + '%';
    }

    if (dom.siteHeader) {
      if (scrollTop > 20) {
        dom.siteHeader.classList.add('scrolled');
      } else {
        dom.siteHeader.classList.remove('scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Setup search and reset controls
 */
function initEvents() {
  if (dom.searchInput) {
    let debounceTimer;
    dom.searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        applyFilterAndSearch();
      }, 150);
    });
  }

  if (dom.resetFilterBtn) {
    dom.resetFilterBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.activeCategory = 'All';
      if (dom.searchInput) dom.searchInput.value = '';
      
      if (dom.filterPills) {
        dom.filterPills.querySelectorAll('.cert-pill').forEach(btn => {
          const isActive = btn.dataset.category === 'All';
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      }

      applyFilterAndSearch();
    });
  }

  if (dom.retryFetchBtn) {
    dom.retryFetchBtn.addEventListener('click', () => {
      loadCertificates();
    });
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initEvents();
  loadCertificates();
  refreshIcons();
});
