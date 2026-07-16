const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress');
const glow = document.querySelector('.cursor-glow');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('[data-mobile-menu]');

const updateScrollState = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${amount})`;
  header.classList.toggle('scrolled', window.scrollY > 30);
};

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -2.4}deg) rotateY(${x * 2.4}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const closeMenu = () => {
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('is-open');
};

menuToggle?.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('is-open');
  menuToggle.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('is-open', open);
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => {
  if (window.innerWidth > 620) closeMenu();
});

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

// A short loading sequence makes the first frame feel intentional.
const loader = document.querySelector('[data-loader]');
const loaderBar = document.querySelector('[data-loader-bar]');
const loaderPercent = document.querySelector('[data-loader-percent]');
const loaderStatus = document.querySelector('[data-loader-status]');
const loaderMessages = ['Initializing portfolio...', 'Loading projects...', 'Connecting the dots...', 'Ready.'];
let loadProgress = 0;
const loadTimer = window.setInterval(() => {
  loadProgress += loadProgress < 72 ? 8 : 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    window.clearInterval(loadTimer);
    loader?.classList.add('is-done');
    document.body.classList.add('is-loaded');
  }
  if (loaderBar) loaderBar.style.width = `${loadProgress}%`;
  if (loaderPercent) loaderPercent.textContent = `${String(loadProgress).padStart(2, '0')}%`;
  if (loaderStatus) loaderStatus.textContent = loaderMessages[Math.min(Math.floor(loadProgress / 28), loaderMessages.length - 1)];
}, 90);

// Ambient particles are generated in code so the hero stays lightweight.
const particleField = document.querySelector('[data-particles]');
if (particleField) {
  const particleColors = ['#6b61d9', '#ff855a', '#72cf9c', '#8f8be3'];
  for (let particleIndex = 0; particleIndex < 25; particleIndex += 1) {
    const particle = document.createElement('span');
    particle.style.setProperty('--x', `${8 + Math.random() * 84}%`);
    particle.style.setProperty('--y', `${8 + Math.random() * 80}%`);
    particle.style.setProperty('--size', `${2 + Math.random() * 4}px`);
    particle.style.setProperty('--opacity', `${0.2 + Math.random() * 0.55}`);
    particle.style.setProperty('--duration', `${5 + Math.random() * 6}s`);
    particle.style.setProperty('--delay', `${Math.random() * -7}s`);
    particle.style.setProperty('--drift', `${-22 + Math.random() * 44}px`);
    particle.style.setProperty('--angle', `${-35 + Math.random() * 70}deg`);
    particle.style.color = particleColors[particleIndex % particleColors.length];
    particleField.appendChild(particle);
  }
}

// Count the honest portfolio metrics only when the user reaches them.
const statsBlock = document.querySelector('[data-stats]');
const statsCounterObserver = new IntersectionObserver((entries, observer) => {
  if (!entries.some((entry) => entry.isIntersecting)) return;
  statsBlock?.querySelectorAll('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    const startedAt = performance.now();
    const duration = 850;
    const tick = (now) => {
      const ratio = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      counter.textContent = `${String(Math.round(target * eased)).padStart(2, '0')}${suffix}`;
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  observer.disconnect();
}, { threshold: 0.45 });
if (statsBlock) statsCounterObserver.observe(statsBlock);

// The dashboard is a real interaction: filters update KPIs, mix, trend, and takeaway.
const dashboardShell = document.querySelector('[data-dashboard]');
const dashboardData = {
  all: { period: 'Last 12 months', revenue: '₹ 1.24M', revenueChange: '↑ 24.8%', margin: '32.8%', marginChange: '↑ 8.4%', repeat: '68.4%', repeatChange: '↑ 12.8%', mix: ['42%', '33%', '25%'], insight: 'Technology is driving the growth curve.', path: 'M0 130 C44 118 61 122 88 102 S127 115 154 81 S199 91 220 68 S263 77 286 45 S323 63 349 34 S391 47 420 20 S445 27 460 10', point: [420, 20] },
  technology: { period: 'Technology focus', revenue: '₹ 0.68M', revenueChange: '↑ 31.2%', margin: '38.6%', marginChange: '↑ 12.1%', repeat: '74.8%', repeatChange: '↑ 18.7%', mix: ['68%', '18%', '14%'], insight: 'Technology has the strongest margin and repeat rate.', path: 'M0 140 C40 133 63 112 91 121 S134 92 159 98 S198 67 224 75 S264 43 293 58 S338 21 369 38 S414 12 460 15', point: [414, 12] },
  furniture: { period: 'Furniture focus', revenue: '₹ 0.34M', revenueChange: '↑ 16.4%', margin: '28.2%', marginChange: '↑ 5.6%', repeat: '61.2%', repeatChange: '↑ 9.3%', mix: ['19%', '58%', '23%'], insight: 'Furniture has room to grow through repeat purchases.', path: 'M0 145 C52 126 81 138 110 116 S150 101 177 112 S218 80 246 91 S284 75 316 73 S354 48 384 65 S424 32 460 44', point: [424, 32] },
  office: { period: 'Office focus', revenue: '₹ 0.22M', revenueChange: '↑ 11.7%', margin: '24.9%', marginChange: '↑ 3.8%', repeat: '55.6%', repeatChange: '↑ 6.1%', mix: ['17%', '24%', '59%'], insight: 'Office sales are smaller, but the category is steady.', path: 'M0 147 C45 142 73 128 105 133 S146 107 177 120 S218 98 251 103 S287 76 317 91 S359 68 389 78 S424 52 460 63', point: [424, 52] }
};
const dashboardSetMetric = (name, value, change) => {
  const metric = dashboardShell?.querySelector(`[data-metric="${name}"]`);
  const metricChange = dashboardShell?.querySelector(`[data-metric-change="${name}"]`);
  if (metric) metric.textContent = value;
  if (metricChange) metricChange.textContent = change;
};
dashboardShell?.querySelectorAll('[data-filter]').forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    const selected = dashboardData[filterButton.dataset.filter];
    if (!selected) return;
    dashboardShell.classList.add('is-updating');
    dashboardShell.querySelectorAll('[data-filter]').forEach((button) => {
      const active = button === filterButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    window.setTimeout(() => {
      dashboardShell.querySelector('.dashboard-period').innerHTML = `${selected.period} <b>⌄</b>`;
      dashboardSetMetric('revenue', selected.revenue, selected.revenueChange);
      dashboardSetMetric('margin', selected.margin, selected.marginChange);
      dashboardSetMetric('repeat', selected.repeat, selected.repeatChange);
      const trend = dashboardShell.querySelector('.chart-trend');
      const fill = dashboardShell.querySelector('.chart-fill');
      const point = dashboardShell.querySelector('.dashboard-trend circle');
      if (trend) trend.setAttribute('d', selected.path);
      if (fill) fill.setAttribute('d', `${selected.path} L460 160 L0 160Z`);
      if (point) { point.setAttribute('cx', selected.point[0]); point.setAttribute('cy', selected.point[1]); }
      dashboardShell.querySelectorAll('.dashboard-legend b').forEach((legendValue, index) => { legendValue.textContent = selected.mix[index]; });
      const takeaway = dashboardShell.querySelector('.dashboard-insight strong');
      if (takeaway) takeaway.textContent = selected.insight;
      dashboardShell.classList.remove('is-updating');
    }, 230);
  });
});

// Scroll-spy keeps the iOS-style nav feeling like a native segmented control.
const navSections = [...document.querySelectorAll('#main, #about, #work, #process, #certificates, #contact')];
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const mobileNavLinks = [...document.querySelectorAll('.mobile-menu a[href^="#"]')];
navLinks[0]?.classList.add('active');
mobileNavLinks[0]?.classList.add('is-active');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    mobileNavLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
navSections.forEach((section) => navObserver.observe(section));

// Keep the glass nav legible while the page moves through the dark toolkit/terminal panels.
const darkPanels = [...document.querySelectorAll('[data-dark-panel]')];
const updateHeaderTone = () => {
  const focusLine = window.innerHeight * 0.22;
  const onDarkPanel = darkPanels.some((panel) => {
    const bounds = panel.getBoundingClientRect();
    return bounds.top < focusLine && bounds.bottom > focusLine;
  });
  header.classList.toggle('on-dark', onDarkPanel);
};
window.addEventListener('scroll', updateHeaderTone, { passive: true });
window.addEventListener('resize', updateHeaderTone);
updateHeaderTone();

// Timeline rail fills toward the item currently in view.
const timeline = document.querySelector('[data-timeline]');
const timelineProgress = timeline?.querySelector('[data-timeline-progress]');
const timelineItems = timeline ? [...timeline.querySelectorAll('.timeline-item')] : [];
const updateTimeline = () => {
  if (!timeline || !timelineProgress) return;
  const rect = timeline.getBoundingClientRect();
  const progressRatio = Math.max(0, Math.min(1, (window.innerHeight * 0.57 - rect.top) / rect.height));
  timelineProgress.style.height = `${progressRatio * 100}%`;
  timelineItems.forEach((item) => item.classList.toggle('is-active', item.getBoundingClientRect().top < window.innerHeight * 0.57));
};
window.addEventListener('scroll', updateTimeline, { passive: true });
updateTimeline();

// Tiny command-line tour with a real input and a deliberately small command set.
const terminalOutput = document.querySelector('[data-terminal-output]');
const terminalForm = document.querySelector('[data-terminal-form]');
const terminalInput = document.querySelector('[data-terminal-input]');
const terminalCommands = {
  whoami: ['Tanish Raheja', 'Data Analyst / Python Developer / AI Creator'],
  skills: ['Python   SQL   Power BI   Excel', 'Pandas   NumPy   Data Storytelling'],
  current_status: ['Learning AI & Data Analytics', 'Open to meaningful opportunities'],
  location: ['Orai, Uttar Pradesh, India', 'UTC +05:30'],
  projects: ['5 featured builds', '4 dashboard-led analytics projects'],
  help: ['whoami  skills  current_status  location  projects  clear', 'Try one command and press Enter.']
};
const addTerminalLine = (prompt, value, muted = false) => {
  if (!terminalOutput) return;
  const line = document.createElement('span');
  line.className = 'terminal-line';
  line.innerHTML = `<span class="prompt">${prompt}</span> <span class="${muted ? 'muted' : 'value'}">${value}</span>`;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};
const runTerminalCommand = (command, showPrompt = true) => {
  const cleanCommand = command.trim().toLowerCase().replace(/\s+/g, '_');
  if (cleanCommand === 'clear') { if (terminalOutput) terminalOutput.innerHTML = ''; return; }
  if (showPrompt) addTerminalLine('&gt;', cleanCommand);
  const response = terminalCommands[cleanCommand] || ['Command not found.', 'Type help to see what is available.'];
  response.forEach((line, index) => addTerminalLine(index === 0 ? '↳' : ' ', line, false));
};
if (terminalOutput) {
  addTerminalLine('&gt;', 'boot portfolio', true);
  window.setTimeout(() => runTerminalCommand('whoami', false), 500);
  window.setTimeout(() => runTerminalCommand('skills', false), 900);
  window.setTimeout(() => runTerminalCommand('current_status', false), 1300);
}
terminalForm?.addEventListener('submit', (event) => { event.preventDefault(); runTerminalCommand(terminalInput?.value || ''); if (terminalInput) { terminalInput.value = ''; terminalInput.focus(); } });

// Optional easter egg: double-click the portrait to enter a short insight mode.
document.querySelector('.portrait-frame')?.addEventListener('dblclick', () => {
  document.body.classList.add('party-mode');
  window.setTimeout(() => document.body.classList.remove('party-mode'), 2400);
});

// Magnetic controls and a subtle ripple keep primary actions tactile.
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.button, .header-cta').forEach((magnetic) => {
    magnetic.addEventListener('pointermove', (event) => {
      const rect = magnetic.getBoundingClientRect();
      magnetic.style.transform = `translate(${(event.clientX - (rect.left + rect.width / 2)) * 0.12}px, ${(event.clientY - (rect.top + rect.height / 2)) * 0.12}px)`;
    });
    magnetic.addEventListener('pointerleave', () => { magnetic.style.transform = ''; });
  });
}
document.querySelectorAll('.button, .header-cta, .dashboard-filter').forEach((control) => {
  control.addEventListener('click', (event) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = control.getBoundingClientRect();
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    control.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
  });
});

// Theme toggle keeps the light editorial palette and the dark product palette in sync.
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = themeToggle?.querySelector('.theme-label');
const themeIcon = themeToggle?.querySelector('.theme-icon');
const setTheme = (theme) => {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark-mode', dark);
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0b11' : '#f6f7ff');
  themeToggle?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  if (themeLabel) themeLabel.textContent = dark ? 'Dark' : 'Light';
  if (themeIcon) themeIcon.textContent = dark ? '☾' : '☼';
  try { localStorage.setItem('tanish-theme', theme); } catch (error) { /* storage can be unavailable in private file previews */ }
};
let savedTheme = null;
try { savedTheme = localStorage.getItem('tanish-theme'); } catch (error) { /* use light mode when storage is unavailable */ }
if (savedTheme === 'dark') setTheme('dark');
themeToggle?.addEventListener('click', () => setTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark'));

// Admin uploads are published locally so the static portfolio can show new work without a build step.
const readPublishedItems = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]').filter((item) => item && item.published !== false); } catch (error) { return []; }
};
const appendLink = (parent, href, text, download = false) => {
  if (!href) return;
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.target = '_blank';
  link.rel = 'noreferrer';
  if (download) link.setAttribute('download', '');
  parent.appendChild(link);
};
const renderPublishedProjects = () => {
  const list = document.querySelector('[data-published-projects]');
  const block = document.querySelector('[data-published-projects-block]');
  if (!list || !block) return;
  const projects = readPublishedItems('tanish-uploaded-projects');
  if (!projects.length) return;
  block.hidden = false;
  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'project-card project-card-small project-uploaded is-visible';
    if (project.link) { const projectLink = document.createElement('a'); projectLink.className = 'project-link'; projectLink.href = project.link; projectLink.target = '_blank'; projectLink.rel = 'noreferrer'; projectLink.setAttribute('aria-label', `View ${project.title} project`); card.appendChild(projectLink); }
    const visual = document.createElement('div');
    visual.className = 'project-visual uploaded-project-visual';
    const visualTop = document.createElement('div');
    visualTop.className = 'visual-top';
    visualTop.append(document.createElement('span'), document.createElement('span'));
    visualTop.children[0].textContent = 'LOCAL UPLOAD';
    visualTop.children[1].textContent = '↗';
    visual.appendChild(visualTop);
    if (project.image) { const image = document.createElement('img'); image.src = project.image; image.alt = ''; image.loading = 'lazy'; visual.appendChild(image); } else visual.appendChild(Object.assign(document.createElement('div'), { className: 'uploaded-project-placeholder', textContent: 'NEW / PROJECT' }));
    const body = document.createElement('div');
    body.className = 'project-body';
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    meta.append(Object.assign(document.createElement('span'), { textContent: 'ADMIN / PUBLISHED' }), Object.assign(document.createElement('span'), { textContent: project.type || 'New build' }));
    const heading = document.createElement('h3');
    heading.textContent = project.title || 'Untitled project';
    const description = document.createElement('p');
    description.textContent = project.description || 'A new project published from the admin control room.';
    body.append(meta, heading, description);
    if (project.link) { const action = document.createElement('span'); action.className = 'project-arrow'; action.textContent = 'View project ↗'; body.appendChild(action); }
    card.append(visual, body);
    list.appendChild(card);
  });
};
const renderPublishedCertificates = () => {
  const list = document.querySelector('[data-published-certificates]');
  const block = document.querySelector('[data-published-certificates-block]');
  if (!list || !block) return;
  const certificates = readPublishedItems('tanish-uploaded-certificates');
  if (!certificates.length) return;
  block.hidden = false;
  certificates.forEach((certificate) => {
    const card = document.createElement('article');
    card.className = 'certificate-card uploaded-certificate-card is-visible';
    const preview = document.createElement('div');
    preview.className = 'certificate-preview uploaded-certificate-preview';
    if (certificate.image) { const image = document.createElement('img'); image.src = certificate.image; image.alt = ''; image.loading = 'lazy'; preview.appendChild(image); } else preview.appendChild(Object.assign(document.createElement('div'), { className: 'uploaded-certificate-placeholder', textContent: 'CERTIFICATE' }));
    const stamp = document.createElement('span');
    stamp.className = 'preview-stamp';
    stamp.textContent = 'LOCAL / PUBLISHED';
    preview.appendChild(stamp);
    const body = document.createElement('div');
    body.className = 'certificate-body';
    const meta = document.createElement('div');
    meta.className = 'certificate-meta';
    meta.append(Object.assign(document.createElement('span'), { textContent: certificate.meta || 'CERTIFICATE' }), Object.assign(document.createElement('span'), { textContent: 'NEW' }));
    const heading = document.createElement('h3');
    heading.textContent = certificate.title || 'Untitled certificate';
    const description = document.createElement('p');
    description.textContent = certificate.description || 'A new certificate published from the admin control room.';
    const links = document.createElement('div');
    links.className = 'certificate-links';
    appendLink(links, certificate.pdf, 'Open PDF ↗');
    appendLink(links, certificate.verify, 'Verify credential ↗');
    body.append(meta, heading, description, links);
    card.append(preview, body);
    list.appendChild(card);
  });
};
renderPublishedProjects();
renderPublishedCertificates();

// A small, local portfolio assistant answers useful questions without pretending to be a live AI service.
const assistant = document.querySelector('[data-assistant]');
const assistantPanel = assistant?.querySelector('[data-assistant-panel]');
const assistantMessages = assistant?.querySelector('[data-assistant-messages]');
const assistantInput = assistant?.querySelector('[data-assistant-input]');
const assistantResponses = [
  { match: ['project', 'built', 'work'], answer: 'Tanish has five featured builds: Customer Behavior Analysis, Netflix Insights, E-Commerce Sales Analysis, Sales Performance Dashboard, and CourseKart.' },
  { match: ['sql', 'database', 'query'], answer: 'SQL is part of Tanish’s analytics workflow: querying, joining, cleaning, segmenting, and finding the patterns that deserve a dashboard.' },
  { match: ['process', 'solve', 'problem', 'dashboard'], answer: 'The loop is simple: frame the question, clean the signal, find the pattern, build the view, and recommend the next move.' },
  { match: ['python', 'tool', 'skill'], answer: 'The core toolkit is Python, Pandas, NumPy, SQL, MySQL, Excel, Power BI, Git, and visual storytelling.' },
  { match: ['certificate', 'certification', 'learn'], answer: 'The portfolio includes IBM Data Analyst Professional Certificate and NIELIT computer-skills credentials.' },
  { match: ['contact', 'email', 'hire', 'linkedin'], answer: 'The fastest way to reach Tanish is rahejatanish29@gmail.com or LinkedIn at linkedin.com/in/tanishraheja.' }
];
const addAssistantMessage = (text, type = 'assistant-bot') => {
  if (!assistantMessages) return;
  const message = document.createElement('div');
  message.className = `assistant-message ${type}`;
  message.textContent = text;
  assistantMessages.appendChild(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
};
const assistantAnswer = (question) => {
  const normalized = question.toLowerCase();
  const response = assistantResponses.find((item) => item.match.some((keyword) => normalized.includes(keyword)));
  return response?.answer || 'Try asking about projects, SQL skills, the process, certificates, tools, or contact details.';
};
const openAssistant = () => { assistant?.classList.add('is-open'); assistant?.querySelector('[data-assistant-toggle]')?.setAttribute('aria-expanded', 'true'); assistantInput?.focus(); };
const closeAssistant = () => { assistant?.classList.remove('is-open'); assistant?.querySelector('[data-assistant-toggle]')?.setAttribute('aria-expanded', 'false'); };
assistant?.querySelector('[data-assistant-toggle]')?.addEventListener('click', () => { assistant?.classList.contains('is-open') ? closeAssistant() : openAssistant(); });
assistant?.querySelector('[data-assistant-close]')?.addEventListener('click', closeAssistant);
assistant?.querySelectorAll('[data-ask]').forEach((button) => button.addEventListener('click', () => {
  const question = button.dataset.ask;
  addAssistantMessage(question, 'assistant-user');
  window.setTimeout(() => addAssistantMessage(assistantAnswer(question)), 260);
}));
assistant?.querySelector('[data-assistant-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = assistantInput?.value.trim();
  if (!question) return;
  addAssistantMessage(question, 'assistant-user');
  if (assistantInput) assistantInput.value = '';
  window.setTimeout(() => addAssistantMessage(assistantAnswer(question)), 260);
});

// Hidden shortcut for the local admin preview. Production deployments still need real server authentication.
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
    event.preventDefault();
    window.location.href = 'admin.html';
  }
});
