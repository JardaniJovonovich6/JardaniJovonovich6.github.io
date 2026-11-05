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
