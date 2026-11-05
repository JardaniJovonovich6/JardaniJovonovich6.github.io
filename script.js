'use strict';
document.querySelector('#year').textContent = new Date().getFullYear();

const navLinks = [...document.querySelectorAll('nav a')];
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    const active = entries.find(entry => entry.isIntersecting);
    if (!active) return;
    navLinks.forEach(link => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  navLinks.forEach(link => {
    const target = document.querySelector(link.hash);
    if (target) navObserver.observe(target);
  });
}

// Public project activity only. No credentials, analytics, or visitor identifiers.
// The page remains useful when GitHub is unavailable: verified snapshot links are in HTML.
const owner = 'JardaniJovonovich6';
const repositories = ['VeriCV', 'commerce-circuit', 'BookHaven', 'Patient-Management-System-aman', 'DeviceLens'];
const activitySection = document.querySelector('#activity');
const activityFeed = document.querySelector('#activity-feed');
const activityStatus = document.querySelector('#activity-status');
const cacheKey = 'aman-public-project-activity-v1';
const cacheDuration = 5 * 60 * 1000;

function validCommit(commit) {
  if (!commit || !repositories.includes(commit.repository) || typeof commit.message !== 'string' || typeof commit.sha !== 'string') return false;
  if (!Number.isFinite(Date.parse(commit.date))) return false;
  try {
    const link = new URL(commit.url);
    return link.protocol === 'https:' && link.hostname === 'github.com' && link.pathname.startsWith(`/${owner}/${commit.repository}/commit/`);
  } catch { return false; }
}

function renderActivity(commits, checkedAt) {
  const safeCommits = commits.filter(validCommit).slice(0, 4);
  if (!safeCommits.length) return false;
  const fragment = document.createDocumentFragment();
  safeCommits.forEach(commit => {
    const row = document.createElement('li');
    const top = document.createElement('div');
    const repo = document.createElement('span');
    repo.className = 'activity-repo';
    repo.textContent = commit.repository;
    const time = document.createElement('time');
    time.dateTime = commit.date;
    time.textContent = new Date(commit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    top.append(repo, time);
    const link = document.createElement('a');
    link.href = commit.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${commit.message} ↗`;
    const sha = document.createElement('span');
    sha.className = 'commit-sha';
    sha.textContent = commit.sha.slice(0, 7);
    row.append(top, link, sha);
    fragment.append(row);
  });
  activityFeed.replaceChildren(fragment);
  activityStatus.textContent = `GitHub activity · checked ${new Date(checkedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
  return true;
}

async function refreshActivity() {
  try {
    const saved = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (saved && Array.isArray(saved.commits) && Number.isFinite(saved.checkedAt) && Date.now() - saved.checkedAt < cacheDuration && renderActivity(saved.commits, saved.checkedAt)) return;
  } catch { /* Public activity caching is optional. */ }

  const results = await Promise.allSettled(repositories.map(async repository => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/commits?author=${owner}&per_page=3`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10000),
      credentials: 'omit'
    });
    if (!response.ok) throw new Error('GitHub activity unavailable');
    const commits = await response.json();
    if (!Array.isArray(commits)) throw new Error('Unexpected GitHub response');
    return commits.map(commit => ({ repository, message: String(commit.commit?.message || '').split('\n')[0], date: commit.commit?.author?.date, url: commit.html_url, sha: commit.sha }));
  }));
  // Keep the complete saved feed if any repository cannot be checked.
  if (results.some(result => result.status === 'rejected')) {
    activityStatus.textContent = 'Saved snapshot · live refresh unavailable. View GitHub for the latest.';
    return;
  }
  const commits = results.flatMap(result => result.value).filter(validCommit).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);
  const checkedAt = Date.now();
  if (!renderActivity(commits, checkedAt)) return;
  try { localStorage.setItem(cacheKey, JSON.stringify({ checkedAt, commits })); } catch { /* No cache required. */ }
}

if ('IntersectionObserver' in window) {
  const activityObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      activityObserver.disconnect();
      refreshActivity().catch(() => { activityStatus.textContent = 'Saved snapshot · view GitHub for the latest.'; });
    }
  }, { rootMargin: '300px' });
  activityObserver.observe(activitySection);
} else {
  refreshActivity().catch(() => {});
}

// User-requested left-to-right toolkit motion, with a persistent pause control per visit.
const toolkit = document.querySelector('.toolkit');
const toolkitToggle = document.querySelector('#toolkit-toggle');
toolkitToggle.addEventListener('click', () => {
  const paused = toolkit.classList.toggle('is-paused');
  toolkitToggle.setAttribute('aria-pressed', String(paused));
  toolkitToggle.querySelector('span').textContent = paused ? 'Play skills' : 'Pause skills';
});

// Contribution counts come from the public GitHub profile via the Contributions API.
// Keep a first-party saved snapshot, validate external data, and never expose credentials.
const calendarPeriod = document.querySelector('#calendar-period');
const calendarGrid = document.querySelector('#calendar-grid');
const calendarMonths = document.querySelector('#calendar-months');
const calendarStatus = document.querySelector('#calendar-status');
const calendarDetail = document.querySelector('#calendar-day-detail');
const calendarCacheTTL = 60 * 60 * 1000;
const contributionDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const contributionMonth = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
let calendarSnapshot;
let calendarRequest = 0;
let shownCalendarPeriod = 'last';

function checkedTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function readPublicCache(key) {
  try {
    const entry = JSON.parse(localStorage.getItem(key) || 'null');
    if (entry && Number.isFinite(entry.checkedAt) && Date.now() - entry.checkedAt >= 0 && Date.now() - entry.checkedAt < calendarCacheTTL) return entry;
  } catch { /* Storage is optional. */ }
  return null;
}
function writePublicCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ checkedAt: Date.now(), data })); } catch { /* Storage is optional. */ }
}

function contributionDays(data, period) {
  if (!data || !Array.isArray(data.contributions) || !data.contributions.length || data.contributions.length > 400) throw new Error('Invalid calendar');
  const today = new Date().toISOString().slice(0, 10);
  const days = data.contributions.map(day => {
    if (!day || typeof day.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4) throw new Error('Invalid day');
    const timestamp = Date.parse(`${day.date}T00:00:00Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== day.date) throw new Error('Invalid date');
    return { date: day.date, count: day.count, level: day.level };
  }).filter(day => day.date <= today && (period === 'last' || day.date.startsWith(`${period}-`))).sort((a, b) => a.date.localeCompare(b.date));
  if (!days.length || new Set(days.map(day => day.date)).size !== days.length) throw new Error('Empty or duplicate dates');
  if (days.some((day, index) => index && Date.parse(day.date) - Date.parse(days[index - 1].date) !== 86400000)) throw new Error('Incomplete calendar');
  return days;
}

function dayLabel(day) {
  return `${contributionDate.format(new Date(`${day.date}T00:00:00Z`))}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}`;
}

function renderContributionCalendar(data, period) {
  const days = contributionDays(data, period);
  const first = new Date(`${days[0].date}T00:00:00Z`);
  const offset = first.getUTCDay();
  const weeks = Math.ceil((offset + days.length) / 7);
  const monthFragment = document.createDocumentFragment();
  const dayFragment = document.createDocumentFragment();
  for (let i = 0; i < offset; i++) {
    const spacer = document.createElement('span');
    spacer.className = 'calendar-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    dayFragment.append(spacer);
  }
  days.forEach((day, index) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    if (index === 0 || date.getUTCDate() === 1) {
      const month = document.createElement('span');
      month.style.gridColumn = String(Math.floor((offset + index) / 7) + 1);
      month.textContent = contributionMonth.format(date);
      monthFragment.append(month);
    }
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = `calendar-day level-${day.level}`;
    cell.dataset.date = day.date;
    cell.dataset.count = String(day.count);
    cell.tabIndex = index === days.length - 1 ? 0 : -1;
    cell.setAttribute('aria-label', dayLabel(day));
    cell.title = dayLabel(day);
    dayFragment.append(cell);
  });
  calendarMonths.style.setProperty('--weeks', String(weeks));
  calendarMonths.replaceChildren(monthFragment);
  calendarGrid.replaceChildren(dayFragment);
  document.querySelector('#calendar-range').textContent = `${contributionDate.format(first)} – ${contributionDate.format(new Date(`${days[days.length - 1].date}T00:00:00Z`))}`;
  document.querySelector('#github-contribution-total').textContent = days.reduce((sum, day) => sum + day.count, 0).toLocaleString('en-GB');
  document.querySelector('#github-active-days').textContent = days.filter(day => day.count > 0).length.toLocaleString('en-GB');
  document.querySelectorAll('.stat-period').forEach(label => { label.textContent = period === 'last' ? 'past year' : period; });
  calendarDetail.textContent = 'Hover, tap, or use arrow keys to inspect a day.';
  shownCalendarPeriod = period;
  const scroll = document.querySelector('.calendar-scroll');
  scroll.scrollLeft = period === 'last' || period === String(new Date().getUTCFullYear()) ? scroll.scrollWidth : 0;
}

function inspectCalendarCell(cell) {
  if (!cell?.matches('.calendar-day')) return;
  calendarGrid.querySelectorAll('.calendar-day').forEach(day => {
    day.tabIndex = day === cell ? 0 : -1;
    day.classList.toggle('selected', day === cell);
  });
  calendarDetail.textContent = cell.getAttribute('aria-label');
}
calendarGrid.addEventListener('click', event => inspectCalendarCell(event.target.closest('.calendar-day')));
calendarGrid.addEventListener('focusin', event => inspectCalendarCell(event.target.closest('.calendar-day')));
calendarGrid.addEventListener('keydown', event => {
  const cells = [...calendarGrid.querySelectorAll('.calendar-day')];
  const index = cells.indexOf(event.target);
  if (index < 0) return;
  let next = index;
  if (event.key === 'ArrowLeft') next -= 7;
  else if (event.key === 'ArrowRight') next += 7;
  else if (event.key === 'ArrowUp') next -= 1;
  else if (event.key === 'ArrowDown') next += 1;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = cells.length - 1;
  else return;
  event.preventDefault();
  const cell = cells[Math.max(0, Math.min(cells.length - 1, next))];
  cell.focus({ preventScroll: true });
  cell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
});

async function loadCalendarPeriod(period) {
  if (![...calendarPeriod.options].some(option => option.value === period)) return;
  const request = ++calendarRequest;
  let hasFallback = shownCalendarPeriod === period;
  if (calendarSnapshot?.calendars?.[period]) {
    try {
      renderContributionCalendar(calendarSnapshot.calendars[period], period);
      hasFallback = true;
      calendarStatus.textContent = `Calendar snapshot · ${checkedTime(Date.parse(calendarSnapshot.capturedAt))} · checking for updates…`;
    } catch { /* Keep the current verified calendar. */ }
  }
  const cacheKey = `aman-github-calendar-v1-${period}`;
  const cache = readPublicCache(cacheKey);
  if (cache) {
    try {
      renderContributionCalendar(cache.data, period);
      calendarStatus.textContent = `Calendar checked ${checkedTime(cache.checkedAt)} · updates periodically`;
      return;
    } catch { /* Ignore invalid cached data. */ }
  }
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(owner)}?y=${encodeURIComponent(period)}`, { credentials: 'omit', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Calendar unavailable');
    const data = await response.json();
    if (request !== calendarRequest) return;
    renderContributionCalendar(data, period);
    writePublicCache(cacheKey, data);
    calendarStatus.textContent = `Calendar checked ${checkedTime(Date.now())} · updates periodically`;
  } catch {
    if (request !== calendarRequest) return;
    if (!hasFallback) calendarPeriod.value = shownCalendarPeriod;
    calendarStatus.textContent = hasFallback ? 'Saved calendar · live refresh unavailable. View GitHub for the latest.' : 'This period could not load. The previous calendar is still shown.';
  }
}

function renderProfileStats(data, checkedAt) {
  if (!data || !Number.isInteger(data.public_repos) || data.public_repos < 0 || !Number.isInteger(data.followers) || data.followers < 0) throw new Error('Invalid profile stats');
  document.querySelector('#github-repositories').textContent = data.public_repos.toLocaleString('en-GB');
  document.querySelector('#github-followers').textContent = data.followers.toLocaleString('en-GB');
  document.querySelector('#profile-stats-status').textContent = `Public profile checked ${checkedTime(checkedAt)}`;
}
async function refreshProfileStats() {
  const key = 'aman-github-profile-stats-v1';
  const cache = readPublicCache(key);
  if (cache) {
    try { renderProfileStats(cache.data, cache.checkedAt); return; } catch { /* Ignore invalid cache. */ }
  }
  try {
    const response = await fetch(`https://api.github.com/users/${owner}`, { headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit', signal: AbortSignal.timeout(10000) });
    if (!response.ok) return;
    const profile = await response.json();
    const data = { public_repos: profile.public_repos, followers: profile.followers };
    renderProfileStats(data, Date.now());
    writePublicCache(key, data);
  } catch { /* The saved public-profile counts remain visible. */ }
}

let calendarStarted = false;
async function startContributionCalendar() {
  if (calendarStarted) return;
  calendarStarted = true;
  try {
    const response = await fetch('assets/github-contributions.json', { credentials: 'same-origin' });
    if (response.ok) calendarSnapshot = await response.json();
  } catch { /* Static HTML is the initial fallback. */ }
  calendarPeriod.disabled = false;
  await Promise.allSettled([loadCalendarPeriod(calendarPeriod.value), refreshProfileStats()]);
}
calendarPeriod.addEventListener('change', () => {
  if (!calendarStarted) startContributionCalendar();
  else loadCalendarPeriod(calendarPeriod.value);
});
if ('IntersectionObserver' in window) {
  const calendarObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      calendarObserver.disconnect();
      startContributionCalendar();
    }
  }, { rootMargin: '300px' });
  calendarObserver.observe(document.querySelector('#github-calendar'));
} else startContributionCalendar();
