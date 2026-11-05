'use strict';
const video = document.querySelector('#ambient-video');
const motion = document.querySelector('#motion-toggle');
let userPausedVideo = false;
const updateMotionControl = () => {
  motion.textContent = video.paused ? 'Play background' : 'Pause background';
  motion.setAttribute('aria-pressed', String(video.paused));
};
const syncMotion = async () => {
  if (userPausedVideo || document.hidden) video.pause();
  else {
    try { await video.play(); } catch { /* Keep the poster and explicit play control available. */ }
  }
  updateMotionControl();
};
video.muted = true;
video.defaultMuted = true;
motion.addEventListener('click', () => {
  userPausedVideo = !video.paused;
  syncMotion();
});
document.addEventListener('visibilitychange', syncMotion);
video.addEventListener('loadeddata', syncMotion);
video.addEventListener('play', updateMotionControl);
video.addEventListener('pause', updateMotionControl);
window.addEventListener('pageshow', syncMotion);
document.addEventListener('pointerdown', event => {
  if (event.target instanceof Element && event.target.closest('#motion-toggle')) return;
  if (!userPausedVideo && video.paused) syncMotion();
}, { once: true });
syncMotion();

const tracks = [
  {number: 6, duration: 215}, {number: 7, duration: 295}, {number: 8, duration: 243},
  {number: 1, duration: 214}, {number: 2, duration: 278}, {number: 3, duration: 220}, {number: 4, duration: 209}
];
const audio = document.querySelector('#focus-audio');
const soundToggle = document.querySelector('#sound-toggle');
const soundLabel = document.querySelector('#sound-label');
const panel = document.querySelector('#sound-panel');
const playPause = document.querySelector('#play-pause');
const status = document.querySelector('#player-status');
let currentTrack = 0;
let loaded = false;
let playRequest = 0;
audio.volume = 0.20;
function timecode(seconds) { const s = Math.max(0, Math.floor(seconds || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
function updatePlayer() {
  const playing = !audio.paused && !audio.ended;
  soundToggle.setAttribute('aria-pressed', String(playing));
  soundLabel.textContent = playing ? 'Sound on' : 'Sound off';
  playPause.textContent = playing ? 'Pause' : 'Play';
  document.querySelector('#track-label').textContent = `Track ${tracks[currentTrack].number}`;
  document.querySelector('#track-time').textContent = `${timecode(audio.currentTime)} / ${timecode(Number.isFinite(audio.duration) ? audio.duration : tracks[currentTrack].duration)}`;
}
function loadTrack(index) {
  currentTrack = (index + tracks.length) % tracks.length;
  audio.src = `assets/track-${String(tracks[currentTrack].number).padStart(2, '0')}.m4a`;
  loaded = true;
  status.textContent = '';
  updatePlayer();
}
async function startAudio() {
  const request = ++playRequest;
  if (!loaded) loadTrack(currentTrack);
  status.textContent = 'Loading music…';
  try { await audio.play(); if (request === playRequest) status.textContent = ''; }
  catch (error) { if (request === playRequest && error.name !== 'AbortError') status.textContent = 'Music could not start. Press Play to try again.'; }
  updatePlayer();
}
soundToggle.addEventListener('click', () => {
  panel.hidden = false;
  if (audio.paused) startAudio(); else { ++playRequest; audio.pause(); status.textContent = ''; }
});
playPause.addEventListener('click', () => { if (audio.paused) startAudio(); else { ++playRequest; audio.pause(); status.textContent = ''; } });
document.querySelector('#previous-track').addEventListener('click', () => { loadTrack(currentTrack - 1); startAudio(); });
document.querySelector('#next-track').addEventListener('click', () => { loadTrack(currentTrack + 1); startAudio(); });
document.querySelector('#volume').addEventListener('input', event => { audio.volume = Number(event.target.value); });
document.querySelector('#close-player').addEventListener('click', () => { panel.hidden = true; soundToggle.focus(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { panel.hidden = true; soundToggle.focus(); } });
audio.addEventListener('ended', () => { loadTrack(currentTrack + 1); startAudio(); });
audio.addEventListener('error', () => { status.textContent = 'Music is unavailable. Try another track or press Play to retry.'; updatePlayer(); });
['play', 'pause', 'loadedmetadata', 'timeupdate'].forEach(event => audio.addEventListener(event, updatePlayer));
updatePlayer();
document.querySelector('#year').textContent = new Date().getFullYear();

const navLinks = [...document.querySelectorAll('nav a')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { navLinks.forEach(link => { if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); } });
}, { rootMargin: '-15% 0px -60% 0px' });
navLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
