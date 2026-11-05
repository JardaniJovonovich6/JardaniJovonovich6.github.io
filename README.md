# Aman Kumar Shaw — portfolio

Static HTML, CSS, and JavaScript. No build step, framework, tracking, external fonts, or runtime dependencies.

The cinematic redesign lives on `dev`. The original portfolio remains on `main`; this branch does not change the live GitHub Pages site unless Pages is explicitly reconfigured or the branch is merged.

## Preview

Serve the repository with a static HTTP server, for example `python -m http.server 8080`, and open the printed local address. Opening `index.html` directly also supports the basic page and media, but an HTTP preview is recommended.

## Media behavior

- `assets/focus-loop.mp4` is a 720p web export of the approved edit (68.48 seconds of encoded video). It contains **no audio stream**. The video loops, muted, with inline playback.
- Music is an independent audio player, silent on arrival. No track is requested until the visitor presses the sound button.
- Order: **6 → 7 → 8 → 1 → 2 → 3 → 4**, then repeat. Closing the player hides controls; the sound button or Pause stops music. Previous/next controls and volume are included.
- Track source boundaries: 6 = 19:13–22:48; 7 = 22:48–27:43; 8 = 27:43–31:46; 1 = 0:00–3:34; 2 = 3:34–8:12; 3 = 8:12–11:52; 4 = 11:52–15:21. Track 5 is intentionally omitted.
- The background video loops independently of the longer playlist. Its edit was paced against track 6; later tracks are not individually beat-matched.
- Reduced-motion preferences pause background playback and disable smooth scrolling. A visitor can explicitly play/pause the background. Browsers may also restrict autoplay in power-saving modes; the poster remains visible.
- The video pauses in a hidden tab. Audio plays only after user interaction and does not persist as autoplay consent across page loads.

## Content and assets

Portrait and current downloadable CV supplied by Aman. Project descriptions and profile URLs come from the supplied CV and original portfolio. The writing section links the Medium ELK/Zipkin guide, Medium profile, Dev.to profile, and the independent tech labor-market study. Existing GitHub, LinkedIn, LeetCode, GeeksforGeeks, and email destinations are retained.

Background footage: *Mr. Robot*. Audio: user-supplied focus mix, linked in the site footer. Those third-party media assets are not covered by a new license in this repository.
