# Aman Kumar Shaw — Backend & Systems

Two portfolio presentations using static HTML, CSS and JavaScript. The default light page uses warm white, navy, charcoal and tea-brown, with a full-width studio-grey portrait band. A Dark mode link opens the original cinematic portfolio; its Light mode link returns to the default page. There are no analytics, external fonts, or framework dependencies.

## Branch and publication

The redesign is on `dev`. GitHub Pages currently publishes that branch. `main` retains the original portfolio; it is not changed by these commits.

## Local preview

Serve the repository with any static HTTP server, for example `python -m http.server 8080`. An HTTP preview is recommended for the GitHub activity refresh.

## Content

- Formal portrait and current CV supplied by Aman.
- Five projects: VeriCV, Commerce Circuit, BookHaven, Patient Management, and DeviceLens.
- Commerce Circuit and Patient Management are explicitly labelled learning projects. Their light-mode sections show architecture and the current learning focus, without problem/solution framing. Other project descriptions retain their problem, approach, implementation and result. No performance benchmarks or hiring outcomes are invented.
- Prominent résumé buttons have been removed from the light page. Discreet CV links remain in the background and contact sections.
- VeriCV copy follows the current project README, including its local-first workflow and source-grounded validation boundary.
- Writing links to the ELK/Zipkin guide, Medium, Dev.to, and the independent tech labor-market working paper.
- GitHub, LinkedIn, LeetCode, GeeksforGeeks, email, live DeviceLens and résumé links are preserved.

## Public GitHub activity

The feed shows recent commits authored by `JardaniJovonovich6` in the five selected repositories. It is not a lifetime commit count, contribution graph, performance score, or account-wide activity feed.

The static HTML includes a verified snapshot. When the activity section approaches the viewport, the browser requests up to three commits per project from GitHub's public REST API, sorts the combined results by commit author date, and displays four. API text is inserted as text; links must match the corresponding GitHub repository commit path.

The public results can be cached in the visitor's browser for five minutes. No identifier, analytics record, authentication token or private repository data is stored. The feed checks once per page load when viewed; it does not promise instant updates while a page remains open. Only pushed commits can appear. GitHub rate limits, network errors and browser restrictions may prevent refresh; the saved snapshot remains visible with a status message.

## Accessibility and resilience

Semantic headings, skip navigation, keyboard-operable native project disclosures, focus indicators, responsive layouts and reduced-motion-aware smooth scrolling. The portfolio's content, project links and saved activity remain available without JavaScript.

The toolkit contains 24 skills/tools. Two identical visual groups create a continuous left-to-right strip; the duplicate is hidden from assistive technology. Full-colour icons are retained. The requested marquee runs by default, pauses on hover, and has a keyboard-accessible Pause/Play button. Other transitions respect reduced-motion preferences.

## Assets

Most technology icons are from [Devicon](https://github.com/devicons/devicon), under its [MIT license](assets/icons/LICENSE-Devicon.txt). Ollama and MCP icons are from [Simple Icons](https://github.com/simple-icons/simple-icons), under [CC0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). A few tools use small labelled monograms. Logos represent their respective projects and remain subject to their owners' trademarks. Icons are served locally in colour. The formal portrait remains unaltered apart from resize and WebP encoding.

## Dark portfolio

`dark.html`, `dark.css`, and `dark.js` restore the original cinematic presentation. Assets live under `assets/dark/`. The dark video loops muted and music remains off on arrival. Opt-in audio starts at 5% volume and follows 6 → 7 → 8 → 1 → 2 → 3 → 4. Navigating back to light mode stops that page's media; the light page has no video or audio elements and does not preload the dark media.

Background footage is from Mr. Robot and music is from the user-supplied focus mix, credited on the dark page. Earlier commits retain the previous designs.
