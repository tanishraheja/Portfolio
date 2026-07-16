const ADMIN_PASSWORD_SHA256 = 'c5197c1d4b91364f6d6dcf62a7c86a40d5a6a41c39d9c0f61f491bce2cc57069';
const ADMIN_PASSWORD_FALLBACK = '4fb8fd8e';
const projectDefaults = [
  { title: 'Customer Behavior Analysis', type: 'Analytics / Python / SQL', featured: true },
  { title: 'Netflix Insights', type: 'Dashboard / Python / SQL', featured: true },
  { title: 'E-Commerce Sales Analysis', type: 'Business intelligence / Power BI', featured: true },
  { title: 'Sales Performance Dashboard', type: 'Dashboard / GitHub', featured: true },
  { title: 'CourseKart', type: 'Web development / HTML / CSS', featured: true }
];

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (error) { return fallback; }
};
const writeStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; }
};
const readSession = (key) => { try { return sessionStorage.getItem(key); } catch (error) { return null; } };
const writeSession = (key, value) => { try { sessionStorage.setItem(key, value); } catch (error) { /* session storage may be disabled */ } };

const fallbackHash = (value) => {
  let hash = 2166136261;
  for (const character of value) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16);
};
const hashPassword = async (value) => {
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return fallbackHash(value);
};

const createId = () => globalThis.crypto?.randomUUID?.() || `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const safeUrl = (value) => /^https?:\/\//i.test(value.trim()) ? value.trim() : '';
const readFileAsDataUrl = (file, maxBytes) => new Promise((resolve, reject) => {
  if (!file) { resolve(''); return; }
  if (file.size > maxBytes) { reject(new Error(`Keep this file under ${Math.round(maxBytes / 1024 / 1024)} MB for local browser storage.`)); return; }
  const reader = new FileReader();
  reader.addEventListener('load', () => resolve(String(reader.result || '')));
  reader.addEventListener('error', () => reject(new Error('The file could not be read.')));
  reader.readAsDataURL(file);
});

const setAdminTheme = (theme) => {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark-mode', dark);
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0b11' : '#f6f7ff');
  const button = document.querySelector('[data-admin-theme]');
  if (button) {
    button.textContent = dark ? '☾' : '☼';
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (readStorage('tanish-admin-remember-theme', true)) writeStorage('tanish-theme', theme);
};

const adminLock = document.querySelector('[data-admin-lock]');
const adminShell = document.querySelector('[data-admin-shell]');
const loginForm = document.querySelector('[data-admin-login]');
const loginMessage = document.querySelector('[data-login-message]');
let adminInitialized = false;

const revealAdmin = () => {
  adminLock?.setAttribute('hidden', '');
  if (adminShell) adminShell.hidden = false;
  if (!adminInitialized) { adminInitialized = true; initAdmin(); }
};

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get('password')?.toString() || '';
  const matches = (await hashPassword(password)) === (globalThis.crypto?.subtle ? ADMIN_PASSWORD_SHA256 : ADMIN_PASSWORD_FALLBACK);
  if (!matches) {
    if (loginMessage) loginMessage.textContent = 'That key does not match.';
    loginForm.classList.add('has-error');
    return;
  }
  writeSession('tanish-admin-auth', 'unlocked');
  if (loginMessage) loginMessage.textContent = '';
  loginForm.reset();
  revealAdmin();
});

const makeElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
const setStatus = (element, message, isError = false) => {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('is-error', isError);
  window.setTimeout(() => { element.textContent = ''; element.classList.remove('is-error'); }, 3000);
};
const normalizeProjects = () => {
  const stored = readStorage('tanish-admin-projects', projectDefaults);
  return projectDefaults.map((defaultProject) => ({ ...defaultProject, ...(stored.find((project) => project.title === defaultProject.title) || {}) }));
};
const getUploadedProjects = () => readStorage('tanish-uploaded-projects', []);
const getUploadedCertificates = () => readStorage('tanish-uploaded-certificates', []);

const renderFeaturedProjects = () => {
  const list = document.querySelector('[data-project-list]');
  if (!list) return;
  list.replaceChildren();
  normalizeProjects().forEach((project, index) => {
    const row = makeElement('div', 'project-row');
    const input = document.createElement('input');
    input.id = `project-${index}`;
    input.type = 'checkbox';
    input.checked = Boolean(project.featured);
    input.dataset.projectIndex = String(index);
    const label = makeElement('label');
    label.htmlFor = input.id;
    label.append(makeElement('strong', '', project.title), makeElement('small', '', project.type));
    row.append(input, label);
    list.append(row);
  });
};

const updateCounts = () => {
  const featured = normalizeProjects().filter((project) => project.featured).length;
  const projectCount = document.querySelector('[data-admin-project-count]');
  const certificateCount = document.querySelector('[data-admin-certificate-count]');
  if (projectCount) projectCount.textContent = String(featured + getUploadedProjects().length).padStart(2, '0');
  if (certificateCount) certificateCount.textContent = String(3 + getUploadedCertificates().length).padStart(2, '0');
};

const renderUploadedLibrary = () => {
  const list = document.querySelector('[data-uploaded-list]');
  if (!list) return;
  list.replaceChildren();
  const projects = getUploadedProjects();
  const certificates = getUploadedCertificates();
  if (!projects.length && !certificates.length) {
    list.append(makeElement('p', 'empty-library', 'Nothing uploaded yet. Publish a project or certificate above.'));
    updateCounts();
    return;
  }
  [...projects.map((item) => ({ ...item, kind: 'Project' })), ...certificates.map((item) => ({ ...item, kind: 'Certificate' }))].forEach((item) => {
    const row = makeElement('div', 'uploaded-row');
    if (item.image) { const image = document.createElement('img'); image.src = item.image; image.alt = ''; row.append(image); } else row.append(makeElement('span', 'uploaded-placeholder', item.kind === 'Project' ? 'P' : 'C'));
    const details = makeElement('div', 'uploaded-row-details');
    details.append(makeElement('strong', '', item.title), makeElement('small', '', `${item.kind} · ${item.meta || item.type || 'Published locally'}`));
    const remove = makeElement('button', 'remove-upload', 'Remove');
    remove.type = 'button';
    remove.addEventListener('click', () => {
      const key = item.kind === 'Project' ? 'tanish-uploaded-projects' : 'tanish-uploaded-certificates';
      writeStorage(key, readStorage(key, []).filter((storedItem) => storedItem.id !== item.id));
      renderUploadedLibrary();
    });
    row.append(details, remove);
    list.append(row);
  });
  updateCounts();
};

const publishProject = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector('[data-project-upload-status]');
  try {
    const data = new FormData(form);
    const image = await readFileAsDataUrl(form.querySelector('[name="image"]')?.files?.[0], 1200000);
    const project = { id: createId(), title: data.get('title').toString().trim(), type: data.get('type').toString().trim(), link: safeUrl(data.get('link').toString()), description: data.get('description').toString().trim(), image, published: true, createdAt: new Date().toISOString() };
    const projects = [...getUploadedProjects(), project];
    if (!writeStorage('tanish-uploaded-projects', projects)) throw new Error('Browser storage is full. Remove an upload and try again.');
    form.reset();
    setStatus(status, 'Project published locally.');
    renderUploadedLibrary();
  } catch (error) { setStatus(status, error.message, true); }
};

const publishCertificate = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector('[data-certificate-upload-status]');
  try {
    const data = new FormData(form);
    const image = await readFileAsDataUrl(form.querySelector('[name="image"]')?.files?.[0], 1200000);
    const pdf = await readFileAsDataUrl(form.querySelector('[name="pdf"]')?.files?.[0], 1800000);
    const certificate = { id: createId(), title: data.get('title').toString().trim(), meta: data.get('meta').toString().trim(), verify: safeUrl(data.get('verify').toString()), description: data.get('description').toString().trim(), image, pdf, published: true, createdAt: new Date().toISOString() };
    const certificates = [...getUploadedCertificates(), certificate];
    if (!writeStorage('tanish-uploaded-certificates', certificates)) throw new Error('Browser storage is full. Remove an upload and try again.');
    form.reset();
    setStatus(status, 'Certificate published locally.');
    renderUploadedLibrary();
  } catch (error) { setStatus(status, error.message, true); }
};

function initAdmin() {
  setAdminTheme(readStorage('tanish-theme', 'light') === 'dark' ? 'dark' : 'light');
  document.querySelector('[data-admin-theme]')?.addEventListener('click', () => setAdminTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark'));
  renderFeaturedProjects();
  renderUploadedLibrary();
  updateCounts();
  document.querySelector('[data-upload-project-form]')?.addEventListener('submit', publishProject);
  document.querySelector('[data-upload-certificate-form]')?.addEventListener('submit', publishCertificate);
  const projectForm = document.querySelector('[data-project-form]');
  projectForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const projects = normalizeProjects().map((project, index) => ({ ...project, featured: Boolean(document.querySelector(`[data-project-index="${index}"]`)?.checked) }));
    writeStorage('tanish-admin-projects', projects);
    setStatus(document.querySelector('[data-save-status]'), 'Saved locally.');
    updateCounts();
  });
  document.querySelector('[data-reset-projects]')?.addEventListener('click', () => { writeStorage('tanish-admin-projects', projectDefaults); renderFeaturedProjects(); updateCounts(); setStatus(document.querySelector('[data-save-status]'), 'Reset to defaults.'); });
  document.querySelector('[data-remember-theme]')?.addEventListener('change', (event) => writeStorage('tanish-admin-remember-theme', event.target.checked));
  document.querySelector('[data-motion]')?.addEventListener('change', (event) => writeStorage('tanish-admin-motion', event.target.checked));
  const rememberTheme = document.querySelector('[data-remember-theme]');
  if (rememberTheme) rememberTheme.checked = readStorage('tanish-admin-remember-theme', true);
  const motion = document.querySelector('[data-motion]');
  if (motion) motion.checked = readStorage('tanish-admin-motion', true);
  const adminDate = document.querySelector('[data-admin-date]');
  if (adminDate) adminDate.textContent = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date());
}

if (readSession('tanish-admin-auth') === 'unlocked') revealAdmin();
